using EcommerceApi.Domain.Enums;

namespace EcommerceApi.Application.DTOs.Orders;

public record UpdateOrderStatusRequest(
    OrderStatus OrderStatus,
    ShippingInfoDto? ShippingInfo);
