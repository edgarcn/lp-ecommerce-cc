namespace EcommerceApi.Application.DTOs.Products;

public record BatchUploadResult(
    int Created,
    int Updated,
    IReadOnlyList<string> Warnings,
    IReadOnlyList<string> Errors);
