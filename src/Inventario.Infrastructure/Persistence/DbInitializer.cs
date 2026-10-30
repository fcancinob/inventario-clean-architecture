using Inventario.Domain.Entities;

namespace Inventario.Infrastructure.Persistence;

public static class DbInitializer
{
    public static void Initialize(InventarioDbContext context)
    {
        context.Database.EnsureCreated();

        if (context.Usuarios.Any()) return;

        string hash = BCrypt.Net.BCrypt.HashPassword("Prueba2026!");

        var adminRol = new Rol { Nombre = "ADMIN" };
        var operadorRol = new Rol { Nombre = "OPERADOR" };
        var consultaRol = new Rol { Nombre = "CONSULTA" };
        context.Roles.AddRange(adminRol, operadorRol, consultaRol);
        context.SaveChanges();

        var usuarios = new List<Usuario>
        {
            new() { Username = "admin", PasswordHash = hash, RolId = adminRol.Id, Activo = true },
            new() { Username = "jperez", PasswordHash = hash, RolId = operadorRol.Id, Activo = true },
            new() { Username = "mrojas", PasswordHash = hash, RolId = operadorRol.Id, Activo = true },
            new() { Username = "csoto", PasswordHash = hash, RolId = consultaRol.Id, Activo = true },
            new() { Username = "lmunoz", PasswordHash = hash, RolId = operadorRol.Id, Activo = false }
        };
        context.Usuarios.AddRange(usuarios);

        var catNotebooks = new Categoria { Nombre = "Notebooks" };
        var catMonitores = new Categoria { Nombre = "Monitores" };
        var catPerifericos = new Categoria { Nombre = "Periféricos" };
        var catAlmacenamiento = new Categoria { Nombre = "Almacenamiento" };
        var catComponentes = new Categoria { Nombre = "Componentes" };
        var catRedes = new Categoria { Nombre = "Redes" };
        context.Categorias.AddRange(catNotebooks, catMonitores, catPerifericos, catAlmacenamiento, catComponentes, catRedes);

        var provTech = new Proveedor { Nombre = "TechData Chile", Activo = true };
        var provIngram = new Proveedor { Nombre = "Ingram Micro", Activo = true };
        var provIntcomex = new Proveedor { Nombre = "Intcomex", Activo = true };
        var provInactivo = new Proveedor { Nombre = "Proveedor Inactivo Ltd", Activo = false };
        context.Proveedores.AddRange(provTech, provIngram, provIntcomex, provInactivo);

        context.SaveChanges();

        var productos = new List<Producto>
        {
            new() { Sku = "NB-001", Nombre = "ThinkPad E14 Gen 4", Marca = "Lenovo", CategoriaId = catNotebooks.Id, PrecioCosto = 450000, PrecioVenta = 620000, StockActual = 12, StockMinimo = 5, Activo = true },
            new() { Sku = "NB-003", Nombre = "MacBook Air M2", Marca = "Apple", CategoriaId = catNotebooks.Id, PrecioCosto = 800000, PrecioVenta = 1100000, StockActual = 0, StockMinimo = 2, Activo = true },
            new() { Sku = "PE-005", Nombre = "Mouse Óptico USB", Marca = "Genius", CategoriaId = catPerifericos.Id, PrecioCosto = 2000, PrecioVenta = 4500, StockActual = 18, StockMinimo = 5, Activo = false },
            new() { Sku = "MN-001", Nombre = "Monitor 24 FHD", Marca = "Samsung", CategoriaId = catMonitores.Id, PrecioCosto = 75000, PrecioVenta = 115000, StockActual = 3, StockMinimo = 10, Activo = true }
        };
        context.Productos.AddRange(productos);
        context.SaveChanges();
    }
}