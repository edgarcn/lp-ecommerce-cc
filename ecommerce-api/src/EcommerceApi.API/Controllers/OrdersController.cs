using EcommerceApi.Application.DTOs.Orders;
using EcommerceApi.Application.Services;
using EcommerceApi.Domain.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EcommerceApi.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class OrdersController(OrderService orderService) : ControllerBase
{
    [HttpGet]
    [Authorize]
    public async Task<IActionResult> GetAll(
        [FromQuery] OrderStatus? status,
        [FromQuery] string? customerEmail,
        [FromQuery] int? orderId,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
    {
        var result = await orderService.GetPagedAsync(status, customerEmail, orderId, page, pageSize);
        return Ok(result);
    }

    [HttpGet("{orderId:int}")]
    [Authorize]
    public async Task<IActionResult> GetById(int orderId)
    {
        var order = await orderService.GetByIdAsync(orderId);
        return order is null ? NotFound() : Ok(order);
    }

    [HttpGet("validate")]
    [AllowAnonymous]
    public async Task<IActionResult> Validate([FromQuery] int orderId, [FromQuery] string customerEmail)
    {
        var exists = await orderService.ExistsAsync(orderId, customerEmail);
        return exists ? Ok(new { exists = true }) : NotFound(new { exists = false });
    }

    [HttpGet("lookup")]
    [AllowAnonymous]
    public async Task<IActionResult> Lookup([FromQuery] int orderId, [FromQuery] string? customerEmail)
    {
        if (orderId <= 0 || string.IsNullOrWhiteSpace(customerEmail))
            return BadRequest(new { message = "Order id and email are required." });

        var order = await orderService.GetForCustomerAsync(orderId, customerEmail);
        return order is null
            ? NotFound(new { message = "No order found for that email and order number." })
            : Ok(order);
    }

    [HttpPost]
    [AllowAnonymous]
    public async Task<IActionResult> Create([FromBody] CreateOrderRequest req)
    {
        var (result, error) = await orderService.CreateAsync(req);
        if (error is not null) return BadRequest(new { message = error });
        return CreatedAtAction(nameof(GetById), new { orderId = result!.OrderId }, result);
    }

    [HttpPatch("{orderId:int}/status")]
    [Authorize]
    public async Task<IActionResult> UpdateStatus(int orderId, [FromBody] UpdateOrderStatusRequest req)
    {
        var (result, error) = await orderService.UpdateStatusAsync(orderId, req);
        if (error is not null)
            return result is null && error == "Order not found."
                ? NotFound(new { message = error })
                : BadRequest(new { message = error });
        return Ok(result);
    }
}
