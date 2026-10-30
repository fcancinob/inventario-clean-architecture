namespace Inventario.Domain.Entities;

public class Proveedor
{
    public int Id { get; set; }
    public string Rut { get; set; } = string.Empty;
    public string RazonSocial { get; set; } = string.Empty;
    public string? Email { get; set; }
    public bool Activo { get; set; } = true;

    public ICollection<Movimiento> Movimientos { get; set; } = new List<Movimiento>();
}