using EcommerceApi.Domain.Enums;

namespace EcommerceApi.Domain.Entities;

public class Order
{
    public int OrderId { get; set; }
    public DateTime PlacedDate { get; set; }
    public int CustomerId { get; set; }
    public Customer Customer { get; set; } = null!;
    public OrderStatus OrderStatus { get; set; } = OrderStatus.Open;

    public DeliveryAddress DeliveryAddress { get; set; } = null!;
    public OrderPayment Payment { get; set; } = null!;
    public OrderShippingInfo? ShippingInfo { get; set; }
    public ICollection<OrderLine> OrderLines { get; set; } = [];
}
