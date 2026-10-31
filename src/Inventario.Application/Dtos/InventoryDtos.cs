using System.Text.Json.Serialization;

namespace Inventario.Application.Dtos;

public record ProductoListDto(
    [property: JsonPropertyName("id")] int Id,
    [property: JsonPropertyName("sku")] string Sku,
    [property: JsonPropertyName("nombre")] string Nombre,
    [property: JsonPropertyName("marca")] string Marca,
    [property: JsonPropertyName("categoria")] string Categoria,
    [property: JsonPropertyName("precioVenta")] decimal PrecioVenta,
    [property: JsonPropertyName("stockActual")] int StockActual,
    [property: JsonPropertyName("stockMinimo")] int StockMinimo,
    [property: JsonPropertyName("alertaBajoMinimo")] bool AlertaBajoMinimo,
    [property: JsonPropertyName("activo")] bool Activo
);

public record PagedResultDto<T>(
    [property: JsonPropertyName("items")] List<T> Items,
    [property: JsonPropertyName("totalRecords")] int TotalRecords,
    [property: JsonPropertyName("page")] int Page,
    [property: JsonPropertyName("pageSize")] int PageSize
);

public record CrearProductoDto(
    [property: JsonPropertyName("sku")] string Sku,
    [property: JsonPropertyName("nombre")] string Nombre,
    [property: JsonPropertyName("marca")] string Marca,
    [property: JsonPropertyName("categoriaId")] int CategoriaId,
    [property: JsonPropertyName("precioCosto")] decimal PrecioCosto,
    [property: JsonPropertyName("precioVenta")] decimal PrecioVenta,
    [property: JsonPropertyName("stockMinimo")] int StockMinimo
);

public record RegistrarEntradaDto(
    [property: JsonPropertyName("productoId")] int ProductoId,
    [property: JsonPropertyName("proveedorId")] int ProveedorId,
    [property: JsonPropertyName("cantidad")] int Cantidad,
    [property: JsonPropertyName("costoUnitario")] decimal CostoUnitario,
    [property: JsonPropertyName("numeroFactura")] string NumeroFactura
);

public record RegistrarSalidaDto(
    [property: JsonPropertyName("productoId")] int ProductoId,
    [property: JsonPropertyName("cantidad")] int Cantidad,
    [property: JsonPropertyName("numeroBoleta")] string NumeroBoleta
);

public record MovimientoKardexDto(
    [property: JsonPropertyName("id")] int Id,
    [property: JsonPropertyName("tipo")] string Tipo,
    [property: JsonPropertyName("cantidad")] int Cantidad,
    [property: JsonPropertyName("precioUnitario")] decimal PrecioUnitario,
    [property: JsonPropertyName("documento")] string Documento,
    [property: JsonPropertyName("proveedor")] string? Proveedor,
    [property: JsonPropertyName("usuario")] string Usuario,
    [property: JsonPropertyName("fecha")] DateTime Fecha,
    [property: JsonPropertyName("saldoAcumulado")] int SaldoAcumulado
);

public record ProductoKardexFichaDto(
    [property: JsonPropertyName("sku")] string Sku,
    [property: JsonPropertyName("nombre")] string Nombre,
    [property: JsonPropertyName("marca")] string Marca,
    [property: JsonPropertyName("categoria")] string Categoria,
    [property: JsonPropertyName("stockActual")] int StockActual,
    [property: JsonPropertyName("movimientos")] List<MovimientoKardexDto> Movimientos
);

public record VentaCategoriaReporteDto(
    [property: JsonPropertyName("categoria")] string Categoria,
    [property: JsonPropertyName("unidadesVendidas")] int UnidadesVendidas,
    [property: JsonPropertyName("numeroVentas")] int NumeroVentas,
    [property: JsonPropertyName("montoTotal")] decimal MontoTotal
);

public record ReporteVentasResumenDto(
    [property: JsonPropertyName("categorias")] List<VentaCategoriaReporteDto> Categorias,
    [property: JsonPropertyName("montoTotalGeneral")] decimal MontoTotalGeneral,
    [property: JsonPropertyName("totalUnidadesVendidas")] int TotalUnidadesVendidas
);