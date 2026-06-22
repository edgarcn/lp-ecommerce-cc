FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

COPY src/EcommerceApi.API/EcommerceApi.API.csproj src/EcommerceApi.API/
COPY src/EcommerceApi.Application/EcommerceApi.Application.csproj src/EcommerceApi.Application/
COPY src/EcommerceApi.Domain/EcommerceApi.Domain.csproj src/EcommerceApi.Domain/
COPY src/EcommerceApi.Infrastructure/EcommerceApi.Infrastructure.csproj src/EcommerceApi.Infrastructure/
RUN dotnet restore src/EcommerceApi.API/EcommerceApi.API.csproj

COPY . .
RUN dotnet publish src/EcommerceApi.API/EcommerceApi.API.csproj -c Release -o /app/publish --no-restore

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS final
WORKDIR /app
COPY --from=build /app/publish .

ENV ASPNETCORE_URLS=http://+:8080
EXPOSE 8080

ENTRYPOINT ["dotnet", "EcommerceApi.API.dll"]
