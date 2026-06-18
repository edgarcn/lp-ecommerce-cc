using EcommerceApi.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace EcommerceApi.Infrastructure.Persistence;

public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<Product> Products => Set<Product>();
    public DbSet<Customer> Customers => Set<Customer>();
    public DbSet<Order> Orders => Set<Order>();
    public DbSet<OrderLine> OrderLines => Set<OrderLine>();
    public DbSet<DeliveryAddress> DeliveryAddresses => Set<DeliveryAddress>();
    public DbSet<OrderPayment> OrderPayments => Set<OrderPayment>();
    public DbSet<OrderShippingInfo> OrderShippingInfos => Set<OrderShippingInfo>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Product>(e =>
        {
            e.HasKey(p => p.ProductId);
            e.HasIndex(p => p.Sku).IsUnique();
            e.Property(p => p.Sku).HasMaxLength(50).IsRequired();
            e.Property(p => p.Name).HasMaxLength(200).IsRequired();
            e.Property(p => p.Category).HasMaxLength(100).IsRequired();
            e.Property(p => p.Currency).HasMaxLength(3).HasDefaultValue("USD");
            e.Property(p => p.Price).HasColumnType("decimal(18,2)");
            e.Property(p => p.WeightKg).HasColumnType("decimal(10,3)");
        });

        modelBuilder.Entity<Customer>(e =>
        {
            e.HasKey(c => c.CustomerId);
            e.HasIndex(c => c.Email).IsUnique();
            e.Property(c => c.Email).HasMaxLength(200).IsRequired();
            e.Property(c => c.FirstName).HasMaxLength(100).IsRequired();
            e.Property(c => c.LastName).HasMaxLength(100).IsRequired();
        });

        modelBuilder.Entity<Order>(e =>
        {
            e.HasKey(o => o.OrderId);
            e.HasOne(o => o.Customer).WithMany(c => c.Orders).HasForeignKey(o => o.CustomerId);
            e.HasOne(o => o.DeliveryAddress).WithOne(d => d.Order)
                .HasForeignKey<DeliveryAddress>(d => d.OrderId);
            e.HasOne(o => o.Payment).WithOne(p => p.Order)
                .HasForeignKey<OrderPayment>(p => p.OrderId);
            e.HasOne(o => o.ShippingInfo).WithOne(s => s.Order)
                .HasForeignKey<OrderShippingInfo>(s => s.OrderId);
            e.HasMany(o => o.OrderLines).WithOne(l => l.Order).HasForeignKey(l => l.OrderId);
        });

        modelBuilder.Entity<OrderLine>(e =>
        {
            e.HasKey(l => l.OrderLineId);
            e.Ignore(l => l.TotalLine);
            e.Property(l => l.BasePrice).HasColumnType("decimal(18,2)");
            e.Property(l => l.Discount).HasColumnType("decimal(18,2)");
            e.HasOne(l => l.Product).WithMany().HasForeignKey(l => l.ProductId);
        });

        modelBuilder.Entity<DeliveryAddress>(e =>
        {
            e.HasKey(d => d.OrderId);
            e.Property(d => d.Fullname).HasMaxLength(200).IsRequired();
            e.Property(d => d.CountryRegion).HasMaxLength(100).IsRequired();
            e.Property(d => d.StreetAddress).HasMaxLength(300).IsRequired();
            e.Property(d => d.City).HasMaxLength(100).IsRequired();
            e.Property(d => d.State).HasMaxLength(100).IsRequired();
            e.Property(d => d.ZipCode).HasMaxLength(20).IsRequired();
        });

        modelBuilder.Entity<OrderPayment>(e =>
        {
            e.HasKey(p => p.OrderId);
            e.Property(p => p.CardBrand).HasMaxLength(30).IsRequired();
            e.Property(p => p.CardLast4).HasMaxLength(4).IsRequired();
            e.Property(p => p.CardholderName).HasMaxLength(200).IsRequired();
            e.Property(p => p.Currency).HasMaxLength(3).HasDefaultValue("USD");
            e.Property(p => p.AmountPaid).HasColumnType("decimal(18,2)");
            e.Property(p => p.TransactionReference).HasMaxLength(50).IsRequired();
        });

        modelBuilder.Entity<OrderShippingInfo>(e =>
        {
            e.HasKey(s => s.OrderId);
            e.Property(s => s.ShippingServiceName).HasMaxLength(200).IsRequired();
            e.Property(s => s.TrackingNumber).HasMaxLength(100).IsRequired();
        });
    }
}
