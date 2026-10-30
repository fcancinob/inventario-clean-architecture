using Inventario.Application.Dtos;

namespace Inventario.Application.Interfaces;

public interface IReporteService
{
    Task<ReporteVentasResumenDto> ObtenerReporteVentasAsync(DateTime desde, DateTime hasta);
}