using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Inventario.Application.Dtos;
using Inventario.Application.Interfaces;
using Inventario.Domain.Exceptions;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;

namespace Inventario.Application.Services;

public class AuthService : IAuthService
{
    private readonly DbContext _context;
    private readonly IConfiguration _configuration;

    public AuthService(DbContext context, IConfiguration configuration)
    {
        _context = context;
        _configuration = configuration;
    }

    public async Task<LoginResponseDto> LoginAsync(LoginRequestDto request)
    {
        var usuario = await _context.Set<Domain.Entities.Usuario>()
            .Include(u => u.Rol)
            .FirstOrDefaultAsync(u => u.Username == request.Username);

        // Validar existencia, contraseña hash BCrypt y cuenta activa
        if (usuario == null || !usuario.Activo || !BCrypt.Net.BCrypt.Verify(request.Password, usuario.PasswordHash))
        {
            throw new BusinessRuleException("Credenciales inválidas o cuenta de usuario inactiva.", 401);
        }

        // Generar Token JWT
        var tokenHandler = new JwtSecurityTokenHandler();
        var secretKey = _configuration["Jwt:Secret"] ?? "SuperSecretKey_InventarioComputacion_2026_KeyMustBeLongEnough!";
        var key = Encoding.UTF8.GetBytes(secretKey);

        var expiracion = DateTime.UtcNow.AddHours(8);

        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, usuario.Id.ToString()),
            new Claim(ClaimTypes.Name, usuario.Username),
            new Claim(ClaimTypes.Role, usuario.Rol.Codigo)
        };

        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(claims),
            Expires = expiracion,
            Issuer = _configuration["Jwt:Issuer"] ?? "InventarioApi",
            Audience = _configuration["Jwt:Audience"] ?? "InventarioWeb",
            SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
        };

        var token = tokenHandler.CreateToken(tokenDescriptor);

        // Mantiene el orden exacto de tu DTO: Token, Username, Rol, Expiracion
        return new LoginResponseDto(
            tokenHandler.WriteToken(token),
            usuario.Username,
            usuario.Rol.Codigo,
            expiracion
        );
    }
}