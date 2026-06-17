namespace EcommerceApi.Domain.Entities;

public class OrderShippingInfo
{
    public int OrderId { get; set; }
    public Order Order { get; set; } = null!;
    public string ShippingServiceName { get; set; } = string.Empty;
    public string TrackingNumber { get; set; } = string.Empty;
}
