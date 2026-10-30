using Inventario.Application.Dtos;
using Inventario.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Inventario.Api.Controllers;

[ApiController]
[Route("api/productos")]
[Authorize]
public class ProductosController : ControllerBase
{
    private readonly IProductoService _productoService;

    public ProductosController(IProductoService productoService)
    {
        _productoService = productoService;
    }

    [HttpGet]
    public async Task<IActionResult> Get(
        [FromQuery] string? texto, 
        [FromQuery] int? categoria, 
        [FromQuery] bool soloBajoMinimo = false, 
        [FromQuery] bool incluirInactivos = false, 
        [FromQuery] int page = 1, 
        [FromQuery] int pageSize = 10)
    {
        var result = await _productoService.ObtenerProductosAsync(texto, categoria, soloBajoMinimo, incluirInactivos, page, pageSize);
        return Ok(result);
    }

    [HttpPost]
    [Authorize(Roles = "ADMIN")]
    public async Task<IActionResult> Create([FromBody] CrearProductoDto dto)
    {
        var result = await _productoService.CrearProductoAsync(dto);
        return CreatedAtAction(nameof(Get), new { sku = result.Sku }, result);
    }

    [HttpGet("{sku}/movimientos")]
    public async Task<IActionResult> Kardex(string sku, [FromQuery] DateTime? desde, [FromQuery] DateTime? hasta)
    {
        var result = await _productoService.ObtenerKardexAsync(sku, desde, hasta);
        return Ok(result);
    }
}