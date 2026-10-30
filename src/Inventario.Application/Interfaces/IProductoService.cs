using Inventario.Application.Dtos;

namespace Inventario.Application.Interfaces;

public interface IProductoService
{
    Task<PagedResultDto<ProductoListDto>> ObtenerProductosAsync(string? texto, int? categoriaId, bool soloBajoMinimo, bool incluirInactivos, int page, int pageSize);
    Task<ProductoListDto> CrearProductoAsync(CrearProductoDto dto);
    Task<ProductoKardexFichaDto> ObtenerKardexAsync(string sku, DateTime? desde, DateTime? hasta);
}