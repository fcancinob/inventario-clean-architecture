namespace Inventario.Domain.Entities;

public class Proveedor
{
    public int Id { get; set; }
    public string Nombre { get; set; } = null!;
    public bool Activo { get; set; } = true;
}