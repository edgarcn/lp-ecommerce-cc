using EcommerceApi.Application.DTOs.Common;
using EcommerceApi.Application.DTOs.Orders;
using EcommerceApi.Domain.Entities;
using EcommerceApi.Domain.Enums;
using EcommerceApi.Domain.Repositories;

namespace EcommerceApi.Application.Services;

public class OrderService(
    IOrderRepository orderRepo,
    ICustomerRepository customerRepo,
    IProductRepository productRepo)
{
    public async Task<PagedResult<OrderDto>> GetPagedAsync(
        OrderStatus? status, string? customerEmail, int? orderId, int page, int pageSize)
    {
        var (items, total) = await orderRepo.GetPagedAsync(status, customerEmail, orderId, page, pageSize);
        return new PagedResult<OrderDto>(items.Select(ToDto), total, page, pageSize);
    }

    public async Task<OrderDto?> GetByIdAsync(int orderId)
    {
        var order = await orderRepo.GetByIdAsync(orderId);
        return order is null ? null : ToDto(order);
    }

    public Task<bool> ExistsAsync(int orderId, string customerEmail) =>
        orderRepo.ExistsAsync(orderId, customerEmail);

    public async Task<(OrderDto? Result, string? Error)> CreateAsync(CreateOrderRequest req)
    {
        var productIds = req.OrderLines.Select(l => l.ProductId).Distinct().ToList();
        var products = new List<Product>();
        foreach (var id in productIds)
        {
            var p = await productRepo.GetByIdAsync(id);
            if (p is null || !p.Active)
                return (null, $"Product with id {id} not found or inactive.");
            if (p.CurrentStock < req.OrderLines.Where(l => l.ProductId == id).Sum(l => l.Quantity))
                return (null, $"Insufficient stock for product '{p.Name}' (SKU: {p.Sku}).");
            products.Add(p);
        }

        var customer = await customerRepo.GetByEmailAsync(req.CustomerEmail)
            ?? new Customer
            {
                Email = req.CustomerEmail,
                FirstName = req.CustomerFirstName,
                LastName = req.CustomerLastName
            };

        if (customer.CustomerId == 0)
            await customerRepo.AddAsync(customer);

        var order = new Order
        {
            PlacedDate = DateTime.UtcNow,
            Customer = customer,
            DeliveryAddress = new DeliveryAddress
            {
                Fullname = req.DeliveryAddress.Fullname,
                CountryRegion = req.DeliveryAddress.CountryRegion,
                StreetAddress = req.DeliveryAddress.StreetAddress,
                UnitSuiteNumber = req.DeliveryAddress.UnitSuiteNumber,
                City = req.DeliveryAddress.City,
                State = req.DeliveryAddress.State,
                ZipCode = req.DeliveryAddress.ZipCode,
                DeliveryInstructions = req.DeliveryAddress.DeliveryInstructions
            },
            OrderLines = req.OrderLines.Select(l =>
            {
                var product = products.First(p => p.ProductId == l.ProductId);
                return new OrderLine
                {
                    ProductId = l.ProductId,
                    Product = product,
                    Quantity = l.Quantity,
                    BasePrice = product.Price,
                    Discount = 0
                };
            }).ToList()
        };

        // Fake payment gateway: always approves and returns a transaction reference.
        // Only safe card metadata (brand + last 4) is kept — never the full number.
        var digitsOnly = new string(req.Payment.CardNumber.Where(char.IsDigit).ToArray());
        order.Payment = new OrderPayment
        {
            Method = req.Payment.Method,
            Status = PaymentStatus.Approved,
            CardBrand = DetectCardBrand(digitsOnly),
            CardLast4 = digitsOnly.Length >= 4 ? digitsOnly[^4..] : digitsOnly,
            CardholderName = req.Payment.CardholderName.Trim(),
            AmountPaid = order.OrderLines.Sum(l => l.TotalLine),
            Currency = "USD",
            TransactionReference = $"TXN-{Guid.NewGuid():N}"[..20].ToUpperInvariant(),
            ProcessedAt = DateTime.UtcNow
        };

        // Deduct stock
        foreach (var line in order.OrderLines)
        {
            var product = products.First(p => p.ProductId == line.ProductId);
            product.CurrentStock -= line.Quantity;
            await productRepo.UpdateAsync(product);
        }

        await orderRepo.AddAsync(order);
        await orderRepo.SaveChangesAsync();

        return (ToDto(order), null);
    }

    public async Task<(OrderDto? Result, string? Error)> UpdateStatusAsync(
        int orderId, UpdateOrderStatusRequest req)
    {
        var order = await orderRepo.GetByIdAsync(orderId);
        if (order is null)
            return (null, "Order not found.");

        if (order.OrderStatus == OrderStatus.Delivered || order.OrderStatus == OrderStatus.Cancelled)
            return (null, $"Cannot change status of an order that is already {order.OrderStatus}.");

        order.OrderStatus = req.OrderStatus;

        if (req.OrderStatus == OrderStatus.Delivered && req.ShippingInfo is not null)
        {
            order.ShippingInfo = new OrderShippingInfo
            {
                ShippingServiceName = req.ShippingInfo.ShippingServiceName,
                TrackingNumber = req.ShippingInfo.TrackingNumber
            };
        }

        await orderRepo.SaveChangesAsync();
        return (ToDto(order), null);
    }

    private static OrderDto ToDto(Order o) => new(
        o.OrderId,
        o.PlacedDate,
        o.Customer.Email,
        o.Customer.FirstName,
        o.Customer.LastName,
        o.OrderStatus,
        new DeliveryAddressDto(
            o.DeliveryAddress.Fullname,
            o.DeliveryAddress.CountryRegion,
            o.DeliveryAddress.StreetAddress,
            o.DeliveryAddress.UnitSuiteNumber,
            o.DeliveryAddress.City,
            o.DeliveryAddress.State,
            o.DeliveryAddress.ZipCode,
            o.DeliveryAddress.DeliveryInstructions),
        o.Payment is null ? null : new PaymentInfoDto(
            o.Payment.Method,
            o.Payment.Status,
            o.Payment.CardBrand,
            o.Payment.CardLast4,
            o.Payment.CardholderName,
            o.Payment.AmountPaid,
            o.Payment.Currency,
            o.Payment.TransactionReference,
            o.Payment.ProcessedAt),
        o.ShippingInfo is null ? null : new ShippingInfoDto(
            o.ShippingInfo.ShippingServiceName,
            o.ShippingInfo.TrackingNumber),
        o.OrderLines.Select(l => new OrderLineDto(
            l.OrderLineId,
            l.ProductId,
            l.Product.Name,
            l.Product.Sku,
            l.Quantity,
            l.BasePrice,
            l.Discount,
            l.TotalLine)),
        o.OrderLines.Sum(l => l.TotalLine));

    private static string DetectCardBrand(string digits)
    {
        if (string.IsNullOrEmpty(digits)) return "Unknown";
        if (digits.StartsWith('4')) return "Visa";
        var prefix2 = digits.Length >= 2 ? int.Parse(digits[..2]) : 0;
        if (prefix2 is 34 or 37) return "Amex";
        if (prefix2 is >= 51 and <= 55) return "Mastercard";
        if (digits.StartsWith("6011") || digits.StartsWith("65")) return "Discover";
        return "Unknown";
    }
}
