namespace Inventario.Application.Dtos;

public record ProductoListDto(
    int Id,
    string Sku,
    string Nombre,
    string Marca,
    string Categoria,
    decimal PrecioVenta,
    int StockActual,
    int StockMinimo,
    bool AlertaBajoMinimo,
    bool Activo
);

public record PagedResultDto<T>(List<T> Items, int TotalRecords, int Page, int PageSize);

public record CrearProductoDto(
    string Sku,
    string Nombre,
    string Marca,
    int CategoriaId,
    decimal PrecioCosto,
    decimal PrecioVenta,
    int StockMinimo
);

public record RegistrarEntradaDto(
    int ProductoId,
    int ProveedorId,
    int Cantidad,
    decimal CostoUnitario,
    string NumeroFactura
);

public record RegistrarSalidaDto(
    int ProductoId,
    int Cantidad,
    string NumeroBoleta
);

public record MovimientoKardexDto(
    int Id,
    string Tipo,
    int Cantidad,
    decimal PrecioUnitario,
    string Documento,
    string? Proveedor,
    string Usuario,
    DateTime Fecha,
    int SaldoAcumulado
);

public record ProductoKardexFichaDto(
    string Sku,
    string Nombre,
    string Marca,
    string Categoria,
    int StockActual,
    List<MovimientoKardexDto> Movimientos
);

public record VentaCategoriaReporteDto(
    string Categoria,
    int UnidadesVendidas,
    int NumeroVentas,
    decimal MontoTotal
);

public record ReporteVentasResumenDto(
    List<VentaCategoriaReporteDto> Categorias,
    decimal MontoTotalGeneral,
    int TotalUnidadesVendidas
);