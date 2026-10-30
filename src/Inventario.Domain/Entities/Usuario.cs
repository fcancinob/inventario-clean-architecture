namespace Inventario.Domain.Entities;

public class Usuario
{
    public int Id { get; set; }
    public string Username { get; set; } = null!;
    public string PasswordHash { get; set; } = null!;
    public bool Activo { get; set; } = true;
    public int RolId { get; set; }
    public Rol Rol { get; set; } = null!;
}