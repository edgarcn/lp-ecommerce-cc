using EcommerceApi.Application.Services;
using EcommerceApi.Domain.Repositories;
using EcommerceApi.Infrastructure.Persistence;
using EcommerceApi.Infrastructure.Repositories;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// Load user-secrets in every environment (they otherwise load only in
// Development). On the dev machine this supplies the connection string, JWT
// secret, and admin hash regardless of ASPNETCORE_ENVIRONMENT. In a container
// there is no secrets file, so this is a no-op and environment variables apply.
builder.Configuration.AddUserSecrets<Program>(optional: true);

builder.Services.AddControllers();

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
    });

builder.Services.AddAuthorization();

// CORS — allow Angular dev server and production origins
builder.Services.AddCors(options =>
    options.AddPolicy("AllowFrontend", policy =>
        policy.WithOrigins(builder.Configuration.GetSection("AllowedOrigins").Get<string[]>() ?? [])
              .AllowAnyHeader()
              .AllowAnyMethod()));

var app = builder.Build();

app.UseCors("AllowFrontend");
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
