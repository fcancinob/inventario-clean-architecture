using Inventario.Application.Interfaces;
using Inventario.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Inventario.Infrastructure.Persistence;

public class InventarioDbContext : DbContext, IInventarioDbContext
{
    public InventarioDbContext(DbContextOptions<InventarioDbContext> options) : base(options) { }

    public DbSet<Usuario> Usuarios => Set<Usuario>();
    public DbSet<Rol> Roles => Set<Rol>();
    public DbSet<Categoria> Categorias => Set<Categoria>();
    public DbSet<Proveedor> Proveedores => Set<Proveedor>();
    public DbSet<Producto> Productos => Set<Producto>();
    public DbSet<Movimiento> Movimientos => Set<Movimiento>();

    public override Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        return base.SaveChangesAsync(cancellationToken);
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<Producto>()
            .HasIndex(p => p.Sku)
            .IsUnique();

        modelBuilder.Entity<Usuario>()
            .HasIndex(u => u.Username)
            .IsUnique();

        modelBuilder.Entity<Producto>()
            .Property(p => p.Version)
            .IsConcurrencyToken();
    }
}