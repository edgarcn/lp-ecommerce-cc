using EcommerceApi.Domain.Enums;

namespace EcommerceApi.Application.DTOs.Orders;

// A privacy-minimal projection of an order for the public customer-facing
// "track my order" view. It deliberately omits payment card metadata and the
// full delivery address (street, unit, zip, instructions); only a coarse
// ship-to location and tracking details are exposed.
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
