using Inventario.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Inventario.Application.Interfaces;

public interface IInventarioDbContext
{
    DbSet<Usuario> Usuarios { get; }
    DbSet<Rol> Roles { get; }
    DbSet<Categoria> Categorias { get; }
    DbSet<Proveedor> Proveedores { get; }
    DbSet<Producto> Productos { get; }
    DbSet<Movimiento> Movimientos { get; }

    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}