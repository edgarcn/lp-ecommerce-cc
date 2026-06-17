namespace EcommerceApi.Domain.Entities;

public class OrderLine
{
    public long OrderLineId { get; set; }
    public int OrderId { get; set; }
    public Order Order { get; set; } = null!;
    public int ProductId { get; set; }
    public Product Product { get; set; } = null!;
    public int Quantity { get; set; }
    public decimal BasePrice { get; set; }
    public decimal Discount { get; set; }
    public decimal TotalLine => (BasePrice - Discount) * Quantity;
}
