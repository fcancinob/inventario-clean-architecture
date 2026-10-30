namespace Inventario.Domain.Entities;

public class Producto
{
    public int Id { get; set; }
    public string Sku { get; set; } = null!;
    public string Nombre { get; set; } = null!;
    public string Marca { get; set; } = null!;
    public int CategoriaId { get; set; }
    public Categoria Categoria { get; set; } = null!;
    public decimal PrecioCosto { get; set; }
    public decimal PrecioVenta { get; set; }
    public int StockActual { get; set; }
    public int StockMinimo { get; set; }
    public bool Activo { get; set; } = true;
    public Guid Version { get; set; } = Guid.NewGuid();

    public ICollection<Movimiento> Movimientos { get; set; } = new List<Movimiento>();
}