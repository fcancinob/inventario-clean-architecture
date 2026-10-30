namespace Inventario.Application.Dtos;

public record LoginRequestDto(string Username, string Password);
public record LoginResponseDto(string Token, string Username, string Rol, DateTime Expiracion);