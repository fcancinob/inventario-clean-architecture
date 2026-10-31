using Inventario.Application.Dtos;
using Inventario.Application.Interfaces;
using Inventario.Domain.Entities;
using Inventario.Domain.Exceptions;
using Microsoft.EntityFrameworkCore;

namespace Inventario.Application.Services;

public class ProductoService : IProductoService
{
    private readonly DbContext _context;

    public ProductoService(DbContext context)
    {
        _context = context;
    }

    public async Task<PagedResultDto<ProductoListDto>> ObtenerProductosAsync(string? texto, int? categoriaId, bool soloBajoMinimo, bool incluirInactivos, int page, int pageSize)
    {
        var query = _context.Set<Producto>()
            .Include(p => p.Categoria)
            .AsNoTracking()
            .AsQueryable();

        if (!incluirInactivos) query = query.Where(p => p.Activo);

        if (!string.IsNullOrWhiteSpace(texto))
        {
            var term = texto.Trim().ToLower();
            query = query.Where(p => p.Sku.ToLower().Contains(term) || p.Nombre.ToLower().Contains(term) || p.Marca.ToLower().Contains(term));
        }

        if (categoriaId.HasValue) query = query.Where(p => p.CategoriaId == categoriaId.Value);
        if (soloBajoMinimo) query = query.Where(p => p.StockActual <= p.StockMinimo);

        int total = await query.CountAsync();
        page = page < 1 ? 1 : page;
        pageSize = pageSize < 1 ? 10 : pageSize;

        var items = await query
            .OrderBy(p => p.Nombre)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(p => new ProductoListDto(
                p.Id, p.Sku, p.Nombre, p.Marca, p.Categoria.Nombre,
                p.PrecioVenta, p.StockActual, p.StockMinimo,
                p.StockActual <= p.StockMinimo, p.Activo
            ))
            .ToListAsync();

        return new PagedResultDto<ProductoListDto>(items, total, page, pageSize);
    }

    public async Task<ProductoListDto> CrearProductoAsync(CrearProductoDto dto)
    {
        if (dto.PrecioVenta < dto.PrecioCosto || dto.PrecioCosto <= 0)
            throw new BusinessRuleException("El precio de venta debe ser mayor o igual al precio de costo y ambos mayores a 0.");

        if (dto.StockMinimo < 0)
            throw new BusinessRuleException("El stock mínimo no puede ser negativo.");

        bool existeSku = await _context.Set<Producto>().AnyAsync(p => p.Sku.ToLower() == dto.Sku.Trim().ToLower());
        if (existeSku)
            throw new BusinessRuleException($"El SKU '{dto.Sku}' ya existe en el catálogo.", 409);

        bool existeCat = await _context.Set<Categoria>().AnyAsync(c => c.Id == dto.CategoriaId);
        if (!existeCat)
            throw new BusinessRuleException("La categoría especificada no existe.");

        var producto = new Producto
        {
            Sku = dto.Sku.Trim().ToUpper(),
            Nombre = dto.Nombre.Trim(),
            Marca = dto.Marca.Trim(),
            CategoriaId = dto.CategoriaId,
            PrecioCosto = dto.PrecioCosto,
            PrecioVenta = dto.PrecioVenta,
            StockActual = 0,
            StockMinimo = dto.StockMinimo,
            Activo = true
        };

        _context.Set<Producto>().Add(producto);
        await _context.SaveChangesAsync();

        var categoriaNombre = await _context.Set<Categoria>().Where(c => c.Id == dto.CategoriaId).Select(c => c.Nombre).FirstOrDefaultAsync();

        return new ProductoListDto(
            producto.Id, producto.Sku, producto.Nombre, producto.Marca,
            categoriaNombre ?? "", producto.PrecioVenta, producto.StockActual,
            producto.StockMinimo, producto.StockActual <= producto.StockMinimo, producto.Activo
        );
    }

    public async Task ActualizarProductoAsync(int id, ActualizarProductoDto dto)
    {
        var producto = await _context.Set<Producto>().FirstOrDefaultAsync(p => p.Id == id);
        if (producto == null)
            throw new BusinessRuleException($"El producto con ID {id} no existe.", 404);

        if (dto.PrecioVenta < dto.PrecioCosto || dto.PrecioCosto <= 0)
            throw new BusinessRuleException("El precio de venta debe ser mayor o igual al precio de costo y ambos mayores a 0.");

        if (dto.StockMinimo < 0)
            throw new BusinessRuleException("El stock mínimo no puede ser negativo.");

        bool existeCat = await _context.Set<Categoria>().AnyAsync(c => c.Id == dto.CategoriaId);
        if (!existeCat)
            throw new BusinessRuleException("La categoría especificada no existe.");

        producto.Nombre = dto.Nombre.Trim();
        producto.Marca = dto.Marca.Trim();
        producto.CategoriaId = dto.CategoriaId;
        producto.PrecioCosto = dto.PrecioCosto;
        producto.PrecioVenta = dto.PrecioVenta;
        producto.StockMinimo = dto.StockMinimo;

        await _context.SaveChangesAsync();
    }

    public async Task<ProductoKardexFichaDto> ObtenerKardexAsync(string sku, DateTime? desde, DateTime? hasta)
    {
        var producto = await _context.Set<Producto>()
            .Include(p => p.Categoria)
            .AsNoTracking()
            .FirstOrDefaultAsync(p => p.Sku.ToLower() == sku.Trim().ToLower());

        if (producto == null)
            throw new BusinessRuleException($"El producto con SKU '{sku}' no existe.", 404);

        var queryMovs = _context.Set<Movimiento>()
            .Include(m => m.Proveedor)
            .Include(m => m.Usuario)
            .AsNoTracking()
            .Where(m => m.ProductoId == producto.Id);

        if (desde.HasValue) queryMovs = queryMovs.Where(m => m.Fecha >= desde.Value);
        if (hasta.HasValue) queryMovs = queryMovs.Where(m => m.Fecha <= hasta.Value);

        var movsList = await queryMovs.OrderBy(m => m.Fecha).ToListAsync();

        int saldo = 0;
        var kardexMovs = new List<MovimientoKardexDto>();

        foreach (var m in movsList)
        {
            if (m.Tipo == TipoMovimiento.ENTRADA) saldo += m.Cantidad;
            else saldo -= m.Cantidad;

            kardexMovs.Add(new MovimientoKardexDto(
                m.Id, m.Tipo.ToString(), m.Cantidad, m.PrecioUnitario,
                m.Documento, m.Proveedor?.RazonSocial, m.Usuario.Username, m.Fecha, saldo
            ));
        }

        return new ProductoKardexFichaDto(
            producto.Sku, producto.Nombre, producto.Marca,
            producto.Categoria.Nombre, producto.StockActual, kardexMovs
        );
    }
}