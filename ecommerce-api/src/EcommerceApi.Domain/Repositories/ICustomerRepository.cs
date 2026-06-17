using EcommerceApi.Domain.Entities;

namespace EcommerceApi.Domain.Repositories;

public interface ICustomerRepository
{
    Task<Customer?> GetByEmailAsync(string email);
    Task AddAsync(Customer customer);
    Task SaveChangesAsync();
}
