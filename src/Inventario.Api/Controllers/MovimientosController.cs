using System.Security.Claims;
using Inventario.Application.Dtos;
using Inventario.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Inventario.Api.Controllers;

[ApiController]
[Route("api/movimientos")]
[Authorize(Roles = "ADMIN,OPERADOR")]
public class MovimientosController : ControllerBase
{
    private readonly IMovimientoService _movimientoService;

    public MovimientosController(IMovimientoService movimientoService)
    {
        _movimientoService = movimientoService;
    }

    [HttpPost("entradas")]
    public async Task<IActionResult> RegistrarEntrada([FromBody] RegistrarEntradaDto dto)
    {
        int usuarioId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        await _movimientoService.RegistrarEntradaAsync(dto, usuarioId);
        return StatusCode(201, new { message = "Entrada registrada exitosamente." });
    }

    [HttpPost("salidas")]
    public async Task<IActionResult> RegistrarSalida([FromBody] RegistrarSalidaDto dto)
    {
        int usuarioId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        await _movimientoService.RegistrarSalidaAsync(dto, usuarioId);
        return StatusCode(201, new { message = "Salida registrada exitosamente." });
    }
}