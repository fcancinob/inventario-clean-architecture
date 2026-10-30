using Inventario.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Inventario.Api.Controllers;

[ApiController]
[Route("api/reportes")]
[Authorize]
public class ReportesController : ControllerBase
{
    private readonly IReporteService _reporteService;

    public ReportesController(IReporteService reporteService)
    {
        _reporteService = reporteService;
    }

    [HttpGet("ventas")]
    public async Task<IActionResult> GetVentas([FromQuery] DateTime desde, [FromQuery] DateTime hasta)
    {
        var result = await _reporteService.ObtenerReporteVentasAsync(desde, hasta);
        return Ok(result);
    }
}