using Inventario.Application.Dtos;
using Inventario.Application.Interfaces;
using Inventario.Domain.Entities;
using Inventario.Domain.Exceptions;
using Microsoft.EntityFrameworkCore;

namespace Inventario.Application.Services;

public class MovimientoService : IMovimientoService
{
    private readonly DbContext _context;

    public MovimientoService(DbContext context)
    {
        _context = context;
    }

    public async Task<bool> RegistrarEntradaAsync(RegistrarEntradaDto dto, int usuarioId)
    {
        if (dto.Cantidad <= 0 || dto.CostoUnitario <= 0)
            throw new BusinessRuleException("La cantidad y el costo unitario deben ser mayores a 0.");

        if (string.IsNullOrWhiteSpace(dto.NumeroFactura))
            throw new BusinessRuleException("El número de factura es obligatorio.");

        var strategy = _context.Database.CreateExecutionStrategy();
        return await strategy.ExecuteAsync(async () =>
        {
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                var producto = await _context.Set<Producto>().FirstOrDefaultAsync(p => p.Id == dto.ProductoId && p.Activo);
                if (producto == null)
                    throw new BusinessRuleException("El producto especificado no existe o está inactivo.");

                var proveedor = await _context.Set<Proveedor>().FirstOrDefaultAsync(pr => pr.Id == dto.ProveedorId && pr.Activo);
                if (proveedor == null)
                    throw new BusinessRuleException("El proveedor especificado no existe o está inactivo.");

                producto.StockActual += dto.Cantidad;
                producto.Version = Guid.NewGuid();

                var movimiento = new Movimiento
                {
                    ProductoId = producto.Id,
                    Tipo = TipoMovimiento.ENTRADA,
                    Cantidad = dto.Cantidad,
                    PrecioUnitario = dto.CostoUnitario,
                    Documento = dto.NumeroFactura.Trim(),
                    ProveedorId = proveedor.Id,
                    UsuarioId = usuarioId,
                    Fecha = DateTime.UtcNow
                };

                _context.Set<Movimiento>().Add(movimiento);
                await _context.SaveChangesAsync();
                await transaction.CommitAsync();
                return true;
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }
        });
    }

    public async Task<bool> RegistrarSalidaAsync(RegistrarSalidaDto dto, int usuarioId)
    {
        if (dto.Cantidad <= 0)
            throw new BusinessRuleException("La cantidad debe ser mayor a 0.");

        if (string.IsNullOrWhiteSpace(dto.NumeroBoleta))
            throw new BusinessRuleException("El número de boleta es obligatorio.");

        var strategy = _context.Database.CreateExecutionStrategy();
        return await strategy.ExecuteAsync(async () =>
        {
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                var producto = await _context.Set<Producto>().FirstOrDefaultAsync(p => p.Id == dto.ProductoId && p.Activo);
                if (producto == null)
                    throw new BusinessRuleException("El producto especificado no existe o está inactivo.");

                if (producto.StockActual < dto.Cantidad)
                    throw new BusinessRuleException($"Stock insuficiente. Stock actual: {producto.StockActual}, solicitado: {dto.Cantidad}.");

                producto.StockActual -= dto.Cantidad;
                producto.Version = Guid.NewGuid();

                var movimiento = new Movimiento
                {
                    ProductoId = producto.Id,
                    Tipo = TipoMovimiento.SALIDA,
                    Cantidad = dto.Cantidad,
                    PrecioUnitario = producto.PrecioVenta,
                    Documento = dto.NumeroBoleta.Trim(),
                    ProveedorId = null,
                    UsuarioId = usuarioId,
                    Fecha = DateTime.UtcNow
                };

                _context.Set<Movimiento>().Add(movimiento);
                await _context.SaveChangesAsync();
                await transaction.CommitAsync();
                return true;
            }
            catch (DbUpdateConcurrencyException)
            {
                await transaction.RollbackAsync();
                throw new BusinessRuleException("El stock cambió simultáneamente en otra transacción. Intente nuevamente.");
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }
        });
    }
}