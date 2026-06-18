using EcommerceApi.Domain.Entities;
using EcommerceApi.Domain.Repositories;
using EcommerceApi.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace EcommerceApi.Infrastructure.Repositories;

public class ProductRepository(AppDbContext db) : IProductRepository
{
    public async Task<(IEnumerable<Product> Items, int TotalCount)> GetPagedAsync(
        string? name, string? category, string? sku, int page, int pageSize)
    {
        var query = db.Products.Where(p => p.Active);

        if (!string.IsNullOrWhiteSpace(name))
            query = query.Where(p => p.Name.Contains(name));
        if (!string.IsNullOrWhiteSpace(category))
            query = query.Where(p => p.Category == category);
        if (!string.IsNullOrWhiteSpace(sku))
            query = query.Where(p => p.Sku == sku);

        var total = await query.CountAsync();
        var items = await query
            .OrderBy(p => p.Name)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return (items, total);
    }

    public async Task<IEnumerable<string>> GetCategoriesAsync() =>
        await db.Products
            .Where(p => p.Active)
            .Select(p => p.Category)
            .Distinct()
            .OrderBy(c => c)
            .ToListAsync();

    public Task<Product?> GetByIdAsync(int productId) =>
        db.Products.FirstOrDefaultAsync(p => p.ProductId == productId);

    public Task<Product?> GetBySkuAsync(string sku) =>
        db.Products.FirstOrDefaultAsync(p => p.Sku == sku);

    public Task<IEnumerable<Product>> GetBySkusAsync(IEnumerable<string> skus) =>
        Task.FromResult<IEnumerable<Product>>(
            db.Products.Where(p => skus.Contains(p.Sku)).ToList());

    public async Task AddAsync(Product product) => await db.Products.AddAsync(product);

    public async Task AddRangeAsync(IEnumerable<Product> products) =>
        await db.Products.AddRangeAsync(products);

    public Task UpdateAsync(Product product)
    {
        db.Products.Update(product);
        return Task.CompletedTask;
    }

    public Task SaveChangesAsync() => db.SaveChangesAsync();
}
