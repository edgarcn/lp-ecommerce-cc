using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace EcommerceApi.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController(IConfiguration config) : ControllerBase
{
    private const string CookieName = "velour.admin.token";

    [HttpPost("login")]
    [EnableRateLimiting("login")]
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

        var tokenString = new JwtSecurityTokenHandler().WriteToken(token);

        // Secure tracks whether we are actually served over HTTPS, NOT the environment
        // name. A container defaults to the Production environment but the demo runs over
        // plain HTTP; setting Secure=true there would make the browser silently drop the
        // cookie and break admin login. Real production sets Security__RequireHttps=true.
        Response.Cookies.Append(CookieName, tokenString, new CookieOptions
        {
            HttpOnly = true,
            SameSite = SameSiteMode.Strict,
            Secure = config.GetValue<bool>("Security:RequireHttps"),
            Expires = DateTimeOffset.UtcNow.AddHours(8)
        });

        return Ok(new { message = "Authenticated." });
    }

    [HttpGet("me")]
    [Microsoft.AspNetCore.Authorization.Authorize]
    public IActionResult Me() => Ok(new { role = "Admin" });

    [HttpPost("logout")]
    public IActionResult Logout()
    {
        Response.Cookies.Delete(CookieName);
        return NoContent();
    }
}

public record LoginRequest(string Username, string Password);
