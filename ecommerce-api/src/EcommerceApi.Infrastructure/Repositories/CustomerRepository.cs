using EcommerceApi.Domain.Entities;
using EcommerceApi.Domain.Repositories;
using EcommerceApi.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace EcommerceApi.Infrastructure.Repositories;

public class CustomerRepository(AppDbContext db) : ICustomerRepository
{
    public Task<Customer?> GetByEmailAsync(string email) =>
        db.Customers.FirstOrDefaultAsync(c => c.Email == email && c.Active);

    public async Task AddAsync(Customer customer) => await db.Customers.AddAsync(customer);

    public Task SaveChangesAsync() => db.SaveChangesAsync();
}
