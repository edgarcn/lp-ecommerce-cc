namespace EcommerceApi.Application.DTOs.Products;

public record ProductDto(
    int ProductId,
    string Sku,
    string Name,
    string? Description,
    string Category,
    decimal Price,
    string Currency,
    int CurrentStock,
    decimal WeightKg,
    bool Active);
