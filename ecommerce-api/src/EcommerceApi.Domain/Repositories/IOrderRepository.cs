using EcommerceApi.Domain.Entities;
using EcommerceApi.Domain.Enums;

namespace EcommerceApi.Domain.Repositories;

public interface IOrderRepository
{
    Task<(IEnumerable<Order> Items, int TotalCount)> GetPagedAsync(
        OrderStatus? status, string? customerEmail, int? orderId, int page, int pageSize);
    Task<Order?> GetByIdAsync(int orderId);
    Task<bool> ExistsAsync(int orderId, string customerEmail);
    Task AddAsync(Order order);
    Task SaveChangesAsync();
}
