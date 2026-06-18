namespace EcommerceApi.Domain.Entities;

public class Customer
{
    public int CustomerId { get; set; }
    public string Email { get; set; } = string.Empty;
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public bool Active { get; set; } = true;

    public ICollection<Order> Orders { get; set; } = [];
}
