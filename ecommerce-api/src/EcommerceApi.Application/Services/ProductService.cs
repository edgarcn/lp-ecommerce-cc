using CsvHelper;
using CsvHelper.Configuration;
using EcommerceApi.Application.DTOs.Common;
using EcommerceApi.Application.DTOs.Products;
using EcommerceApi.Domain.Entities;
using EcommerceApi.Domain.Repositories;
using System.Globalization;

namespace EcommerceApi.Application.Services;

public class ProductService(IProductRepository repo)
{
    private const int MaxFileSizeBytes = 5 * 1024 * 1024; // 5 MB

    public async Task<PagedResult<ProductDto>> GetPagedAsync(
        string? name, string? category, string? sku, int page, int pageSize)
    {
        var (items, total) = await repo.GetPagedAsync(name, category, sku, page, pageSize);
        return new PagedResult<ProductDto>(items.Select(ToDto), total, page, pageSize);
    }

    public Task<IEnumerable<string>> GetCategoriesAsync() => repo.GetCategoriesAsync();

    public async Task<ProductDto?> GetByIdAsync(int productId)
    {
        var product = await repo.GetByIdAsync(productId);
        return product is null ? null : ToDto(product);
    }

    public async Task<(ProductDto? Result, string? Error)> CreateAsync(CreateProductRequest req)
    {
        var existing = await repo.GetBySkuAsync(req.Sku);
        if (existing is not null)
            return (null, $"SKU '{req.Sku}' already exists.");

        var product = new Product
        {
            Sku = req.Sku.Trim(),
            Name = req.Name.Trim(),
            Description = req.Description?.Trim(),
            Category = req.Category.Trim(),
            Price = req.Price,
            CurrentStock = req.Stock,
            WeightKg = req.WeightKg
        };

        await repo.AddAsync(product);
        await repo.SaveChangesAsync();
        return (ToDto(product), null);
    }

    public async Task<(ProductDto? Result, string? Error)> UpdateAsync(int productId, UpdateProductRequest req)
    {
        var product = await repo.GetByIdAsync(productId);
        if (product is null)
            return (null, "Product not found.");

        product.Name = req.Name.Trim();
        product.Description = req.Description?.Trim();
        product.Category = req.Category.Trim();
        product.Price = req.Price;
        product.CurrentStock = req.Stock;
        product.WeightKg = req.WeightKg;

        await repo.UpdateAsync(product);
        await repo.SaveChangesAsync();
        return (ToDto(product), null);
    }

    public async Task<(bool Success, string? Error)> DeactivateAsync(int productId)
    {
        var product = await repo.GetByIdAsync(productId);
        if (product is null)
            return (false, "Product not found.");

        product.Active = false;
        product.CurrentStock = 0;
        await repo.UpdateAsync(product);
        await repo.SaveChangesAsync();
        return (true, null);
    }

    public async Task<BatchUploadResult> BatchUploadAsync(Stream fileStream, long fileLength)
    {
        if (fileLength > MaxFileSizeBytes)
            return new BatchUploadResult(0, 0, [], [$"File size exceeds the {MaxFileSizeBytes / 1024 / 1024}MB limit."]);

        List<(CsvProductRow Row, int Line)> rows;
        try
        {
            rows = ParseCsv(fileStream);
        }
        catch (Exception ex)
        {
            // Structural failure (missing header columns, unreadable file): hard-fail.
            return new BatchUploadResult(0, 0, [], [$"The file could not be read: {ex.Message}"]);
        }

        var warnings = new List<string>();
        var errors = new List<string>();
        int created = 0, updated = 0;

        // Validate and parse every row first. All-or-nothing: if any row has a
        // problem, import nothing and return the full list of rows to fix.
        var grouped = new Dictionary<string, List<ParsedProductRow>>(StringComparer.OrdinalIgnoreCase);
        foreach (var (row, lineNumber) in rows)
        {
            if (IsBlankRow(row)) continue; // skip fully-empty lines (trailing blanks)

            var (parsed, error) = ValidateAndParse(row, lineNumber);
            if (error is not null) { errors.Add(error); continue; }

            if (!grouped.TryGetValue(parsed!.Sku, out var list))
                grouped[parsed.Sku] = list = [];
            list.Add(parsed);
        }

        if (errors.Count > 0) return new BatchUploadResult(0, 0, [], errors);

        var allSkus = grouped.Keys.ToList();
        var existingProducts = (await repo.GetBySkusAsync(allSkus))
            .ToDictionary(p => p.Sku, StringComparer.OrdinalIgnoreCase);

        var toAdd = new List<Product>();

        foreach (var (sku, skuRows) in grouped)
        {
            if (skuRows.Count > 1)
                warnings.Add($"SKU '{sku}' appears {skuRows.Count} times in the file. Stock values will be accumulated.");

            if (existingProducts.TryGetValue(sku, out var existing))
            {
                existing.CurrentStock += skuRows.Sum(r => r.Stock);
                if (!existing.Active)
                {
                    existing.Active = true;
                    warnings.Add($"SKU '{sku}' was previously deactivated and has been reactivated. Stock updated to {existing.CurrentStock}.");
                }
                else
                {
                    warnings.Add($"SKU '{sku}' already exists in the database. Stock updated to {existing.CurrentStock}.");
                }
                await repo.UpdateAsync(existing);
                updated++;
            }
            else
            {
                var first = skuRows[0];
                var product = new Product
                {
                    Sku = first.Sku,
                    Name = first.Name,
                    Description = first.Description,
                    Category = first.Category,
                    Price = first.Price,
                    CurrentStock = skuRows.Sum(r => r.Stock),
                    WeightKg = first.WeightKg
                };
                toAdd.Add(product);
                created++;
            }
        }

        if (toAdd.Count > 0)
            await repo.AddRangeAsync(toAdd);

        await repo.SaveChangesAsync();
        return new BatchUploadResult(created, updated, warnings, errors);
    }

    // Reads every field as a raw string so malformed values produce clean,
    // user-friendly messages in ValidateAndParse instead of CsvHelper type-converter dumps.
    private static List<(CsvProductRow Row, int Line)> ParseCsv(Stream stream)
    {
        var results = new List<(CsvProductRow, int)>();
        var config = new CsvConfiguration(CultureInfo.InvariantCulture)
        {
            HasHeaderRecord = true,
            PrepareHeaderForMatch = args => args.Header.Trim().ToLowerInvariant(),
            MissingFieldFound = null,
            HeaderValidated = null
        };

        using var reader = new StreamReader(stream);
        using var csv = new CsvReader(reader, config);

        csv.Read();
        csv.ReadHeader();

        int line = 1;
        while (csv.Read())
        {
            line++;
            results.Add((csv.GetRecord<CsvProductRow>()!, line));
        }

        return results;
    }

    private static bool IsBlankRow(CsvProductRow r) =>
        string.IsNullOrWhiteSpace(r.Name) && string.IsNullOrWhiteSpace(r.Sku) &&
        string.IsNullOrWhiteSpace(r.Description) && string.IsNullOrWhiteSpace(r.Category) &&
        string.IsNullOrWhiteSpace(r.Price) && string.IsNullOrWhiteSpace(r.Stock) &&
        string.IsNullOrWhiteSpace(r.WeightKg);

    private static (ParsedProductRow? Parsed, string? Error) ValidateAndParse(CsvProductRow row, int line)
    {
        if (string.IsNullOrWhiteSpace(row.Name)) return (null, $"Line {line}: 'name' is required.");
        if (string.IsNullOrWhiteSpace(row.Sku)) return (null, $"Line {line}: 'sku' is required.");
        if (string.IsNullOrWhiteSpace(row.Category)) return (null, $"Line {line}: 'category' is required.");

        if (row.Name.Trim().Length > 200) return (null, $"Line {line}: 'name' exceeds 200 characters (got {row.Name.Trim().Length}).");
        if (row.Sku.Trim().Length > 50) return (null, $"Line {line}: 'sku' exceeds 50 characters (got {row.Sku.Trim().Length}).");
        if (row.Category.Trim().Length > 100) return (null, $"Line {line}: 'category' exceeds 100 characters (got {row.Category.Trim().Length}).");

        var rawPrice = (row.Price ?? string.Empty).Trim().TrimStart('$').Trim();
        if (string.Equals(rawPrice, "free", StringComparison.OrdinalIgnoreCase))
            return (null, $"Line {line}: 'price' cannot be the word 'free'. Replace it with '0.00' to mark the product as free.");
        if (!decimal.TryParse(rawPrice, NumberStyles.Number, CultureInfo.InvariantCulture, out var price) || price < 0)
            return (null, $"Line {line}: 'price' must be a number >= 0 (got '{row.Price}').");
        if (!int.TryParse(row.Stock, NumberStyles.Integer, CultureInfo.InvariantCulture, out var stock) || stock < 0)
            return (null, $"Line {line}: 'stock' must be a whole number >= 0 (got '{row.Stock}').");
        if (!decimal.TryParse(row.WeightKg, NumberStyles.Number, CultureInfo.InvariantCulture, out var weight) || weight < 0)
            return (null, $"Line {line}: 'weight_kg' must be a number >= 0 (got '{row.WeightKg}').");

        return (new ParsedProductRow(
            row.Sku.Trim(), row.Name.Trim(), row.Description?.Trim(),
            row.Category.Trim(), price, stock, weight), null);
    }

    private static ProductDto ToDto(Product p) => new(
        p.ProductId, p.Sku, p.Name, p.Description, p.Category,
        p.Price, p.Currency, p.CurrentStock, p.WeightKg, p.Active);
}

internal class CsvProductRow
{
    public string? Name { get; set; }
    public string? Sku { get; set; }
    public string? Description { get; set; }
    public string? Category { get; set; }
    public string? Price { get; set; }
    public string? Stock { get; set; }
    [CsvHelper.Configuration.Attributes.Name("weight_kg")]
    public string? WeightKg { get; set; }
}

internal record ParsedProductRow(
    string Sku, string Name, string? Description, string Category,
    decimal Price, int Stock, decimal WeightKg);
