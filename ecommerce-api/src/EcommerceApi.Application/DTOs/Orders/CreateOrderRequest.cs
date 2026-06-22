using System.ComponentModel.DataAnnotations;
using EcommerceApi.Domain.Enums;

namespace EcommerceApi.Application.DTOs.Orders;

public record CreateOrderRequest(
    [Required][EmailAddress] string CustomerEmail,
    [Required][MaxLength(100)] string CustomerFirstName,
    [Required][MaxLength(100)] string CustomerLastName,
    [Required] CreateDeliveryAddressRequest DeliveryAddress,
    [Required] PaymentRequest Payment,
    [Required][MinLength(1)] IEnumerable<CreateOrderLineRequest> OrderLines);

public record PaymentRequest(
    PaymentMethod Method,
    [Required][MaxLength(200)] string CardholderName,
    [Required][MaxLength(20)] string CardNumber);

public record CreateDeliveryAddressRequest(
    [Required][MaxLength(200)] string Fullname,
    [Required][MaxLength(100)] string CountryRegion,
    [Required][MaxLength(300)] string StreetAddress,
    [MaxLength(100)] string? UnitSuiteNumber,
    [Required][MaxLength(100)] string City,
    [Required][MaxLength(100)] string State,
    [Required][MaxLength(20)] string ZipCode,
    string? DeliveryInstructions);

public record CreateOrderLineRequest(
    [Range(1, int.MaxValue)] int ProductId,
    [Range(1, int.MaxValue)] int Quantity);
