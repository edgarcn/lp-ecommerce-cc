using EcommerceApi.Domain.Enums;

namespace EcommerceApi.Application.DTOs.Orders;

public record OrderDto(
    int OrderId,
    DateTime PlacedDate,
    string CustomerEmail,
    string CustomerFirstName,
    string CustomerLastName,
    OrderStatus OrderStatus,
    DeliveryAddressDto DeliveryAddress,
    PaymentInfoDto? Payment,
    ShippingInfoDto? ShippingInfo,
    IEnumerable<OrderLineDto> OrderLines,
    decimal Total);

public record PaymentInfoDto(
    PaymentMethod Method,
    PaymentStatus Status,
    string CardBrand,
    string CardLast4,
    string CardholderName,
    decimal AmountPaid,
    string Currency,
    string TransactionReference,
    DateTime ProcessedAt);

public record DeliveryAddressDto(
    string Fullname,
    string CountryRegion,
    string StreetAddress,
    string? UnitSuiteNumber,
    string City,
    string State,
    string ZipCode,
    string? DeliveryInstructions);

public record ShippingInfoDto(
    string ShippingServiceName,
    string TrackingNumber);

public record OrderLineDto(
    long OrderLineId,
    int ProductId,
    string ProductName,
    string ProductSku,
    int Quantity,
    decimal BasePrice,
    decimal Discount,
    decimal TotalLine);
