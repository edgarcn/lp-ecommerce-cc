using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace EcommerceApi.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController(IConfiguration config) : ControllerBase
{
    [HttpPost("login")]
    public IActionResult Login([FromBody] LoginRequest req)
    {
        var adminUser = config["Auth:AdminUsername"];
        var adminPassHash = config["Auth:AdminPasswordHash"];

        var validUser = req.Username == adminUser;
        var validPass = !string.IsNullOrEmpty(adminPassHash)
            && BCrypt.Net.BCrypt.Verify(req.Password, adminPassHash);

        if (!validUser || !validPass)
            return Unauthorized(new { message = "Invalid credentials." });

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(config["Auth:JwtSecret"]!));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
        var token = new JwtSecurityToken(
            issuer: config["Auth:JwtIssuer"],
            audience: config["Auth:JwtAudience"],
            claims: [new Claim(ClaimTypes.Role, "Admin")],
            expires: DateTime.UtcNow.AddHours(8),
            signingCredentials: creds);

        return Ok(new { token = new JwtSecurityTokenHandler().WriteToken(token) });
    }
}

public record LoginRequest(string Username, string Password);
