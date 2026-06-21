# LP E-Commerce — Backend API

.NET Web API using a layered architecture and the repository pattern over EF Core
(Pomelo MySQL provider). See the [solution README](../README.md) for the full
business rules.

## Projects
```
src/
  EcommerceApi.Domain/          Entities, enums, repository interfaces
  EcommerceApi.Application/     DTOs, services (product & order logic, CSV batch)
  EcommerceApi.Infrastructure/  DbContext, EF migrations, repository implementations
  EcommerceApi.API/             Controllers, Program.cs, configuration
```

## Domain model (summary)
- `Product` (unique `Sku`, `Currency`, integer `CurrentStock`, soft-delete via `Active`)
- `Customer` (unique `Email`)
- `Order` → `OrderLine` (many), `DeliveryAddress` (1:1), `OrderPayment` (1:1),
  `OrderShippingInfo` (1:1, set when Delivered)
- Enums: `OrderStatus` (Open/Cancelled/Delivered), `PaymentMethod`,
  `PaymentStatus`
- `OrderPayment` stores only safe card metadata (brand, last 4, cardholder,
  amount, transaction reference, timestamp) — never the full number, CVV, or
  expiry.

## Configuration & secrets
No secrets are committed. `appsettings.json` holds empty placeholders.

Local development secrets (connection string, JWT secret, admin password **hash**)
load from **either**:
- `appsettings.Development.json` (gitignored), or
- `dotnet user-secrets` (also loaded in any environment for robustness).

Keys:
- `ConnectionStrings:DefaultConnection`
- `Auth:JwtSecret`, `Auth:JwtIssuer`, `Auth:JwtAudience`
- `Auth:AdminUsername`, `Auth:AdminPasswordHash` (BCrypt)

For production/Docker, supply these as environment variables (double-underscore
nesting), e.g. `ConnectionStrings__DefaultConnection`, `Auth__JwtSecret`,
`Auth__AdminPasswordHash`. Environment variables take precedence.

If `Auth:JwtSecret` is missing, the app fails fast at startup with a clear message.

### Regenerate the admin password hash
PowerShell can't easily load BCrypt; use a .NET file-based app:
```
#:package BCrypt.Net-Next@4.2.0
Console.WriteLine(BCrypt.Net.BCrypt.HashPassword(args[0]));
```
Run: `dotnet run genhash.cs -- "yourPassword"`

## Run
```powershell
dotnet run --project src/EcommerceApi.API/EcommerceApi.API.csproj --launch-profile http
```
- Serves `http://localhost:5048`.
- EF Core migrations are applied automatically on startup.
- CORS allows `http://localhost:4200` (the Angular dev server).

## Database migrations
```
dotnet ef migrations add <Name> --project src/EcommerceApi.Infrastructure --startup-project src/EcommerceApi.API
dotnet ef database update --project src/EcommerceApi.Infrastructure --startup-project src/EcommerceApi.API
```
