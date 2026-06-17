namespace EcommerceApi.Domain.Entities;

public class DeliveryAddress
{
    public int OrderId { get; set; }
    public Order Order { get; set; } = null!;
    public string Fullname { get; set; } = string.Empty;
    public string CountryRegion { get; set; } = string.Empty;
    public string StreetAddress { get; set; } = string.Empty;
    public string? UnitSuiteNumber { get; set; }
    public string City { get; set; } = string.Empty;
    public string State { get; set; } = string.Empty;
    public string ZipCode { get; set; } = string.Empty;
    public string? DeliveryInstructions { get; set; }
}
