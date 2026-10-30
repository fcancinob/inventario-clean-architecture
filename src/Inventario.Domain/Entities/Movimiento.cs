namespace Inventario.Domain.Entities;

public enum TipoMovimiento
{
    ENTRADA = 1,
    SALIDA = 2
}

public class Movimiento
{
    public int Id { get; set; }
    public int ProductoId { get; set; }
    public Producto Producto { get; set; } = null!;
    public TipoMovimiento Tipo { get; set; }
    public int Cantidad { get; set; }
    public decimal PrecioUnitario { get; set; }
    public string Documento { get; set; } = null!;
    public int? ProveedorId { get; set; }
    public Proveedor? Proveedor { get; set; }
    public int UsuarioId { get; set; }
    public Usuario Usuario { get; set; } = null!;
    public DateTime Fecha { get; set; } = DateTime.UtcNow;
}