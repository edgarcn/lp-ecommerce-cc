using EcommerceApi.Application.Services;
using EcommerceApi.Domain.Repositories;
using EcommerceApi.Infrastructure.Persistence;
using EcommerceApi.Infrastructure.Repositories;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using System.Threading.RateLimiting;

var builder = WebApplication.CreateBuilder(args);

// Load user-secrets in every environment (they otherwise load only in
// Development). On the dev machine this supplies the connection string, JWT
// secret, and admin hash regardless of ASPNETCORE_ENVIRONMENT. In a container
// there is no secrets file, so this is a no-op and environment variables apply.
builder.Configuration.AddUserSecrets<Program>(optional: true);

builder.Services.AddControllers();

// Rate limiting — 10 login attempts per minute per IP
builder.Services.AddRateLimiter(options =>
{
    options.AddFixedWindowLimiter("login", opt =>
    {
        opt.Window = TimeSpan.FromMinutes(1);
        opt.PermitLimit = 10;
        opt.QueueLimit = 0;
        opt.QueueProcessingOrder = QueueProcessingOrder.OldestFirst;
    });
    options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
});

// Database
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseMySql(
        builder.Configuration.GetConnectionString("DefaultConnection"),
        ServerVersion.AutoDetect(builder.Configuration.GetConnectionString("DefaultConnection"))));

// Repositories
builder.Services.AddScoped<IProductRepository, ProductRepository>();
builder.Services.AddScoped<IOrderRepository, OrderRepository>();
builder.Services.AddScoped<ICustomerRepository, CustomerRepository>();

// Services
builder.Services.AddScoped<ProductService>();
builder.Services.AddScoped<OrderService>();

// JWT Auth
var jwtSecret = builder.Configuration["Auth:JwtSecret"];
if (string.IsNullOrEmpty(jwtSecret))
{
    throw new InvalidOperationException(
        $"Auth:JwtSecret is not configured (current environment: '{builder.Environment.EnvironmentName}'). " +
        "For local development set it with: dotnet user-secrets set \"Auth:JwtSecret\" \"<value>\". " +
        "For production/Docker provide it as the environment variable Auth__JwtSecret.");
}
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["Auth:JwtIssuer"],
            ValidAudience = builder.Configuration["Auth:JwtAudience"],
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSecret))
        };
        // Read the JWT from the httpOnly cookie instead of the Authorization header.
        options.Events = new JwtBearerEvents
        {
            OnMessageReceived = ctx =>
            {
                ctx.Token = ctx.Request.Cookies["velour.admin.token"];
                return Task.CompletedTask;
            }
        };
    });

builder.Services.AddAuthorization();

// CORS — allow Angular dev server and production origins.
// AllowCredentials() is required for the httpOnly auth cookie to be sent cross-origin.
builder.Services.AddCors(options =>
    options.AddPolicy("AllowFrontend", policy =>
        policy.WithOrigins(builder.Configuration.GetSection("AllowedOrigins").Get<string[]>() ?? [])
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials()));

var app = builder.Build();

// HTTPS hardening is opt-in via Security:RequireHttps (default false). It is left
// OFF for the local Docker demo, which is served over plain HTTP with no TLS/domain:
// enabling it would force HTTPS redirects, emit HSTS, and (combined with the Secure
// cookie below) silently break admin login over http://localhost. In a real
// production deployment behind TLS, set Security__RequireHttps=true.
var requireHttps = builder.Configuration.GetValue<bool>("Security:RequireHttps");

if (requireHttps)
    app.UseHttpsRedirection();

// Security response headers
app.Use(async (ctx, next) =>
{
    ctx.Response.Headers["X-Content-Type-Options"] = "nosniff";
    ctx.Response.Headers["X-Frame-Options"] = "DENY";
    ctx.Response.Headers["Referrer-Policy"] = "strict-origin-when-cross-origin";
    ctx.Response.Headers["Content-Security-Policy"] = "default-src 'none'";
    // HSTS is ignored by browsers over HTTP anyway, but only emit it when we are
    // genuinely HTTPS-served to avoid pinning HTTPS on a developer's localhost.
    if (requireHttps)
        ctx.Response.Headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains";
    await next();
});

app.UseCors("AllowFrontend");
app.UseRateLimiter();
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

// Auto-migrate on startup
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    db.Database.Migrate();
}

app.Run();
