using Inventario.Application.Dtos;
using Inventario.Application.Interfaces;
using Inventario.Domain.Entities;
using Inventario.Domain.Exceptions;
using Microsoft.EntityFrameworkCore;

namespace Inventario.Application.Services;

public class ReporteService : IReporteService
{
    private readonly DbContext _context;

    public ReporteService(DbContext context)
    {
        _context = context;
    }

    public async Task<ReporteVentasResumenDto> ObtenerReporteVentasAsync(DateTime desde, DateTime hasta)
    {
        if (desde > hasta)
            throw new BusinessRuleException("La fecha 'desde' debe ser menor o igual a 'hasta'.");

        if ((hasta - desde).TotalDays > 366)
            throw new BusinessRuleException("El rango máximo de fechas permitido es de 366 días.");

        var movs = await _context.Set<Movimiento>()
            .Include(m => m.Producto)
            .ThenInclude(p => p.Categoria)
            .AsNoTracking()
            .Where(m => m.Tipo == TipoMovimiento.SALIDA && m.Fecha >= desde && m.Fecha <= hasta)
            .ToListAsync();

        var agrupado = movs
            .GroupBy(m => m.Producto.Categoria.Nombre)
            .Select(g => new VentaCategoriaReporteDto(
                g.Key,
                g.Sum(m => m.Cantidad),
                g.Count(),
                g.Sum(m => m.Cantidad * m.PrecioUnitario)
            ))
            .OrderByDescending(r => r.MontoTotal)
            .ToList();

        decimal totalMonto = agrupado.Sum(a => a.MontoTotal);
        int totalUnidades = agrupado.Sum(a => a.UnidadesVendidas);

        return new ReporteVentasResumenDto(agrupado, totalMonto, totalUnidades);
    }
}