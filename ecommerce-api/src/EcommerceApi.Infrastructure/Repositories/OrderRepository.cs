using EcommerceApi.Domain.Entities;
using EcommerceApi.Domain.Enums;
using EcommerceApi.Domain.Repositories;
using EcommerceApi.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace EcommerceApi.Infrastructure.Repositories;

public class OrderRepository(AppDbContext db) : IOrderRepository
{
    public async Task<(IEnumerable<Order> Items, int TotalCount)> GetPagedAsync(
        OrderStatus? status, string? customerEmail, int? orderId, int page, int pageSize)
    {
        var query = db.Orders
            .Include(o => o.Customer)
            .Include(o => o.DeliveryAddress)
            .Include(o => o.Payment)
            .Include(o => o.ShippingInfo)
            .Include(o => o.OrderLines).ThenInclude(l => l.Product)
            .AsQueryable();

        if (status.HasValue)
            query = query.Where(o => o.OrderStatus == status.Value);
        if (!string.IsNullOrWhiteSpace(customerEmail))
            query = query.Where(o => o.Customer.Email == customerEmail);
        if (orderId.HasValue)
            query = query.Where(o => o.OrderId == orderId.Value);

        var total = await query.CountAsync();
        var items = await query
            .OrderByDescending(o => o.PlacedDate)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return (items, total);
    }

    public Task<Order?> GetByIdAsync(int orderId) =>
        db.Orders
            .Include(o => o.Customer)
            .Include(o => o.DeliveryAddress)
            .Include(o => o.Payment)
            .Include(o => o.ShippingInfo)
            .Include(o => o.OrderLines).ThenInclude(l => l.Product)
            .FirstOrDefaultAsync(o => o.OrderId == orderId);

    public Task<bool> ExistsAsync(int orderId, string customerEmail) =>
        db.Orders.AnyAsync(o => o.OrderId == orderId && o.Customer.Email == customerEmail);

    public async Task AddAsync(Order order) => await db.Orders.AddAsync(order);

    public Task SaveChangesAsync() => db.SaveChangesAsync();
}
