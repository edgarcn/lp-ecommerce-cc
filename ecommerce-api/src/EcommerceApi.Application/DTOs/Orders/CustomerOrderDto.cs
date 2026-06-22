using EcommerceApi.Domain.Enums;

namespace EcommerceApi.Application.DTOs.Orders;

public record CustomerOrderDto(
    int OrderId,
    DateTime PlacedDate,
    string CustomerFirstName,
    OrderStatus OrderStatus,
    string ShipToCity,
    string ShipToState,
    string ShipToCountryRegion,
    ShippingInfoDto? ShippingInfo,
    IEnumerable<OrderLineDto> OrderLines,
    decimal Total);
