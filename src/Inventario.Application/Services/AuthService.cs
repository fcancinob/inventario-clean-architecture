using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using BCrypt.Net;
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
    private readonly IConfiguration _config;

    public AuthService(DbContext context, IConfiguration config)
    {
        _context = context;
        _config = config;
    }

    public async Task<LoginResponseDto> LoginAsync(LoginRequestDto request)
    {
        var usuario = await _context.Set<Domain.Entities.Usuario>()
            .Include(u => u.Rol)
            .FirstOrDefaultAsync(u => u.Username == request.Username);

        if (usuario == null || !usuario.Activo || !BCrypt.Net.BCrypt.Verify(request.Password, usuario.PasswordHash))
        {
            throw new BusinessRuleException("Credenciales inválidas o usuario no autorizado.", 401);
        }

        var secretKey = _config["Jwt:Secret"] ?? "SuperSecretKey_InventarioComputacion_2026_KeyMustBeLongEnough!";
        var key = Encoding.UTF8.GetBytes(secretKey);
        var rolNombre = usuario.Rol?.Nombre ?? "CONSULTA";

        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, usuario.Id.ToString()),
            new Claim(ClaimTypes.Name, usuario.Username),
            new Claim(ClaimTypes.Role, rolNombre)
        };

        var expiracion = DateTime.UtcNow.AddMinutes(60);

        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(claims),
            Expires = expiracion,
            Issuer = _config["Jwt:Issuer"] ?? "InventarioApi",
            Audience = _config["Jwt:Audience"] ?? "InventarioWeb",
            SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
        };

        var tokenHandler = new JwtSecurityTokenHandler();
        var token = tokenHandler.CreateToken(tokenDescriptor);

        return new LoginResponseDto(tokenHandler.WriteToken(token), usuario.Username, rolNombre, expiracion);
    }
}