using EcommerceApi.Domain.Enums;

namespace EcommerceApi.Domain.Entities;

public class OrderPayment
{
    public int OrderId { get; set; }
    public Order Order { get; set; } = null!;

    public PaymentMethod Method { get; set; }
    public PaymentStatus Status { get; set; }

    public string CardBrand { get; set; } = string.Empty;
    public string CardLast4 { get; set; } = string.Empty;
    public string CardholderName { get; set; } = string.Empty;

    public decimal AmountPaid { get; set; }
    public string Currency { get; set; } = "USD";

    public string TransactionReference { get; set; } = string.Empty;
    public DateTime ProcessedAt { get; set; }
}
