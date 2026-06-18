namespace EcommerceApi.Domain.Entities;

public class Product
{
    public int ProductId { get; set; }
    public string Sku { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string Category { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public string Currency { get; set; } = "USD";
    public int CurrentStock { get; set; }
    public decimal WeightKg { get; set; }
    public bool Active { get; set; } = true;
}
