using System.ComponentModel.DataAnnotations;

namespace EcommerceApi.Application.DTOs.Products;

public record UpdateProductRequest(
    [Required][MaxLength(200)] string Name,
    string? Description,
    [Required][MaxLength(100)] string Category,
    [Range(0, double.MaxValue)] decimal Price,
    [Range(0, int.MaxValue)] int Stock,
    [Range(0, double.MaxValue)] decimal WeightKg);
