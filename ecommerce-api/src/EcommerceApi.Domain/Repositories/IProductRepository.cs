using EcommerceApi.Domain.Entities;

namespace EcommerceApi.Domain.Repositories;

public interface IProductRepository
{
    Task<(IEnumerable<Product> Items, int TotalCount)> GetPagedAsync(
        string? name, string? category, string? sku, int page, int pageSize);
    Task<IEnumerable<string>> GetCategoriesAsync();
    Task<Product?> GetByIdAsync(int productId);
    Task<Product?> GetBySkuAsync(string sku);
    Task<IEnumerable<Product>> GetBySkusAsync(IEnumerable<string> skus);
    Task AddAsync(Product product);
    Task AddRangeAsync(IEnumerable<Product> products);
    Task UpdateAsync(Product product);
    Task SaveChangesAsync();
}
