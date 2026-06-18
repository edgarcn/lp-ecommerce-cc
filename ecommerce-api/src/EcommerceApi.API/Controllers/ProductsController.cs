using EcommerceApi.Application.DTOs.Products;
using EcommerceApi.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EcommerceApi.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ProductsController(ProductService productService) : ControllerBase
{
    [HttpGet]
    [AllowAnonymous]
    public async Task<IActionResult> GetAll(
        [FromQuery] string? name,
        [FromQuery] string? category,
        [FromQuery] string? sku,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
    {
        var result = await productService.GetPagedAsync(name, category, sku, page, pageSize);
        return Ok(result);
    }

    [HttpGet("categories")]
    [AllowAnonymous]
    public async Task<IActionResult> GetCategories()
    {
        var categories = await productService.GetCategoriesAsync();
        return Ok(categories);
    }

    [HttpGet("{productId:int}")]
    [AllowAnonymous]
    public async Task<IActionResult> GetById(int productId)
    {
        var product = await productService.GetByIdAsync(productId);
        return product is null ? NotFound() : Ok(product);
    }

    [HttpPost]
    [Authorize]
    public async Task<IActionResult> Create([FromBody] CreateProductRequest req)
    {
        var (result, error) = await productService.CreateAsync(req);
        if (error is not null) return Conflict(new { message = error });
        return CreatedAtAction(nameof(GetById), new { productId = result!.ProductId }, result);
    }

    [HttpPut("{productId:int}")]
    [Authorize]
    public async Task<IActionResult> Update(int productId, [FromBody] UpdateProductRequest req)
    {
        var (result, error) = await productService.UpdateAsync(productId, req);
        if (error is not null) return NotFound(new { message = error });
        return Ok(result);
    }

    [HttpDelete("{productId:int}")]
    [Authorize]
    public async Task<IActionResult> Deactivate(int productId)
    {
        var (success, error) = await productService.DeactivateAsync(productId);
        if (!success) return NotFound(new { message = error });
        return NoContent();
    }

    [HttpPost("batch-upload")]
    [Authorize]
    public async Task<IActionResult> BatchUpload(IFormFile file)
    {
        if (file is null || file.Length == 0)
            return BadRequest(new { message = "No file provided." });

        if (!file.FileName.EndsWith(".csv", StringComparison.OrdinalIgnoreCase))
            return BadRequest(new { message = "Only CSV files are accepted." });

        await using var stream = file.OpenReadStream();
        var result = await productService.BatchUploadAsync(stream, file.Length);

        return result.Errors.Count > 0
            ? BadRequest(result)
            : Ok(result);
    }
}
