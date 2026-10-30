using Inventario.Domain.Entities;

namespace Inventario.Infrastructure.Persistence;

public static class DbInitializer
{
    public static void Initialize(InventarioDbContext context)
    {
        context.Database.EnsureCreated();

        if (context.Usuarios.Any()) return; // La BD ya tiene datos

        // 1. Roles
        var roles = new[]
        {
            new Rol { Id = 1, Codigo = "ADMIN", Descripcion = "Administrador: acceso total" },
            new Rol { Id = 2, Codigo = "OPERADOR", Descripcion = "Registra entradas y salidas de stock" },
            new Rol { Id = 3, Codigo = "CONSULTA", Descripcion = "Solo lectura: consultas y reportes" }
        };
        context.Roles.AddRange(roles);
        context.SaveChanges();

        // 2. Usuarios (Hash BCrypt para 'Prueba2026!')
        string bCryptHash = "$2a$10$5YfgEoQaXJwSdTe4o8YI.OAQq1MOJkRtERTxvzMCjXwY8Hh1eXYz6";
        var usuarios = new[]
        {
            new Usuario { Id = 1, Username = "admin", NombreCompleto = "Andrea Valdés Mora", Email = "admin@inventario.test", PasswordHash = bCryptHash, RolId = 1, Activo = true },
            new Usuario { Id = 2, Username = "jperez", NombreCompleto = "Juan Pérez Soto", Email = "jperez@inventario.test", PasswordHash = bCryptHash, RolId = 2, Activo = true },
            new Usuario { Id = 3, Username = "mrojas", NombreCompleto = "María Rojas Fuentes", Email = "mrojas@inventario.test", PasswordHash = bCryptHash, RolId = 2, Activo = true },
            new Usuario { Id = 4, Username = "csoto", NombreCompleto = "Carlos Soto Ibarra", Email = "csoto@inventario.test", PasswordHash = bCryptHash, RolId = 3, Activo = true },
            new Usuario { Id = 5, Username = "lmunoz", NombreCompleto = "Luis Muñoz Tapia", Email = "lmunoz@inventario.test", PasswordHash = bCryptHash, RolId = 2, Activo = false } // INACTIVO
        };
        context.Usuarios.AddRange(usuarios);
        context.SaveChanges();

        // 3. Categorías
        var categorias = new[]
        {
            new Categoria { Id = 1, Codigo = "NOTE", Nombre = "Notebooks" },
            new Categoria { Id = 2, Codigo = "MONI", Nombre = "Monitores" },
            new Categoria { Id = 3, Codigo = "PERI", Nombre = "Periféricos" },
            new Categoria { Id = 4, Codigo = "ALMA", Nombre = "Almacenamiento" },
            new Categoria { Id = 5, Codigo = "COMP", Nombre = "Componentes" },
            new Categoria { Id = 6, Codigo = "REDE", Nombre = "Redes" }
        };
        context.Categorias.AddRange(categorias);
        context.SaveChanges();

        // 4. Proveedores
        var proveedores = new[]
        {
            new Proveedor { Id = 1, Rut = "76.111.222-3", RazonSocial = "TecnoMayorista S.A.", Email = "ventas@tecnomayorista.test", Activo = true },
            new Proveedor { Id = 2, Rut = "77.333.444-5", RazonSocial = "Distribuidora Byte SpA", Email = "pedidos@distribyte.test", Activo = true },
            new Proveedor { Id = 3, Rut = "76.555.666-7", RazonSocial = "Importadora PC Sur Ltda.", Email = "contacto@pcsur.test", Activo = true },
            new Proveedor { Id = 4, Rut = "78.777.888-9", RazonSocial = "Redes y Más S.A.", Email = "ventas@redesymas.test", Activo = true }
        };
        context.Proveedores.AddRange(proveedores);
        context.SaveChanges();

        // 5. Productos (Stock inicial en 0, luego se calcula con los movimientos)
        var productos = new[]
        {
            new Producto { Id = 1, Sku = "NB-001", Nombre = "Notebook 14\" Core i5 16GB 512GB SSD", Marca = "Lenovo", CategoriaId = 1, PrecioCosto = 520000, PrecioVenta = 689990, StockActual = 0, StockMinimo = 5, Activo = true },
            new Producto { Id = 2, Sku = "NB-002", Nombre = "Notebook 15.6\" Ryzen 7 16GB 1TB SSD", Marca = "ASUS", CategoriaId = 1, PrecioCosto = 610000, PrecioVenta = 799990, StockActual = 0, StockMinimo = 4, Activo = true },
            new Producto { Id = 3, Sku = "NB-003", Nombre = "Notebook 13\" Core i7 32GB 1TB SSD", Marca = "Dell", CategoriaId = 1, PrecioCosto = 980000, PrecioVenta = 1249990, StockActual = 0, StockMinimo = 2, Activo = true },
            new Producto { Id = 4, Sku = "MN-001", Nombre = "Monitor 24\" Full HD IPS 75Hz", Marca = "Samsung", CategoriaId = 2, PrecioCosto = 89000, PrecioVenta = 129990, StockActual = 0, StockMinimo = 8, Activo = true },
            new Producto { Id = 5, Sku = "MN-002", Nombre = "Monitor 27\" QHD IPS 144Hz", Marca = "LG", CategoriaId = 2, PrecioCosto = 189000, PrecioVenta = 259990, StockActual = 0, StockMinimo = 5, Activo = true },
            new Producto { Id = 6, Sku = "MN-003", Nombre = "Monitor 34\" Ultrawide curvo", Marca = "AOC", CategoriaId = 2, PrecioCosto = 279000, PrecioVenta = 369990, StockActual = 0, StockMinimo = 2, Activo = true },
            new Producto { Id = 7, Sku = "PE-001", Nombre = "Teclado mecánico TKL switch rojo", Marca = "Redragon", CategoriaId = 3, PrecioCosto = 25000, PrecioVenta = 39990, StockActual = 0, StockMinimo = 15, Activo = true },
            new Producto { Id = 8, Sku = "PE-002", Nombre = "Mouse inalámbrico ergonómico", Marca = "Logitech", CategoriaId = 3, PrecioCosto = 18000, PrecioVenta = 29990, StockActual = 0, StockMinimo = 20, Activo = true },
            new Producto { Id = 9, Sku = "PE-003", Nombre = "Audífonos USB con micrófono", Marca = "HyperX", CategoriaId = 3, PrecioCosto = 32000, PrecioVenta = 49990, StockActual = 0, StockMinimo = 10, Activo = true },
            new Producto { Id = 10, Sku = "PE-004", Nombre = "Webcam Full HD 1080p", Marca = "Logitech", CategoriaId = 3, PrecioCosto = 38000, PrecioVenta = 59990, StockActual = 0, StockMinimo = 6, Activo = true },
            new Producto { Id = 11, Sku = "AL-001", Nombre = "SSD NVMe 1TB PCIe 4.0", Marca = "Kingston", CategoriaId = 4, PrecioCosto = 52000, PrecioVenta = 74990, StockActual = 0, StockMinimo = 10, Activo = true },
            new Producto { Id = 12, Sku = "AL-002", Nombre = "SSD SATA 480GB", Marca = "Crucial", CategoriaId = 4, PrecioCosto = 24000, PrecioVenta = 34990, StockActual = 0, StockMinimo = 10, Activo = true },
            new Producto { Id = 13, Sku = "AL-003", Nombre = "Disco externo 2TB USB 3.0", Marca = "Seagate", CategoriaId = 4, PrecioCosto = 55000, PrecioVenta = 79990, StockActual = 0, StockMinimo = 6, Activo = true },
            new Producto { Id = 14, Sku = "CO-001", Nombre = "Memoria RAM DDR4 16GB 3200MHz", Marca = "Corsair", CategoriaId = 5, PrecioCosto = 29000, PrecioVenta = 44990, StockActual = 0, StockMinimo = 12, Activo = true },
            new Producto { Id = 15, Sku = "CO-002", Nombre = "Memoria RAM DDR5 32GB 5600MHz", Marca = "Kingston", CategoriaId = 5, PrecioCosto = 78000, PrecioVenta = 109990, StockActual = 0, StockMinimo = 6, Activo = true },
            new Producto { Id = 16, Sku = "CO-003", Nombre = "Fuente de poder 650W 80 Plus Bronze", Marca = "Cooler Master", CategoriaId = 5, PrecioCosto = 45000, PrecioVenta = 64990, StockActual = 0, StockMinimo = 5, Activo = true },
            new Producto { Id = 17, Sku = "RE-001", Nombre = "Router WiFi 6 doble banda", Marca = "TP-Link", CategoriaId = 6, PrecioCosto = 48000, PrecioVenta = 69990, StockActual = 0, StockMinimo = 6, Activo = true },
            new Producto { Id = 18, Sku = "RE-002", Nombre = "Switch 8 puertos Gigabit", Marca = "TP-Link", CategoriaId = 6, PrecioCosto = 16000, PrecioVenta = 24990, StockActual = 0, StockMinimo = 8, Activo = true },
            new Producto { Id = 19, Sku = "RE-003", Nombre = "Cable de red Cat6 3 m", Marca = "Genérico", CategoriaId = 6, PrecioCosto = 1500, PrecioVenta = 3490, StockActual = 0, StockMinimo = 50, Activo = true },
            new Producto { Id = 20, Sku = "PE-005", Nombre = "Mouse óptico con cable PS/2", Marca = "Genérico", CategoriaId = 3, PrecioCosto = 3000, PrecioVenta = 5990, StockActual = 0, StockMinimo = 0, Activo = false } // INACTIVO
        };
        context.Productos.AddRange(productos);
        context.SaveChanges();
    }
}