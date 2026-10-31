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
        if (request == null || string.IsNullOrWhiteSpace(request.Username) || string.IsNullOrWhiteSpace(request.Password))
        {
            throw new BusinessRuleException("Debe proporcionar un usuario y contraseña válidos.", 400);
        }

        var usernameLower = request.Username.Trim().ToLower();

        // Buscar el usuario e incluir la entidad Rol
        var usuario = await _context.Set<Domain.Entities.Usuario>()
            .Include(u => u.Rol)
            .FirstOrDefaultAsync(u => u.Username.ToLower() == usernameLower);

        // 1. Validar si el usuario existe
        if (usuario == null)
        {
            throw new BusinessRuleException("Credenciales inválidas.", 401);
        }

        // 2. Validar si la cuenta está activa (ej: lmunoz debe rebotar)
        if (!usuario.Activo)
        {
            throw new BusinessRuleException("El usuario se encuentra inactivo en el sistema.", 401);
        }

        // 3. Validar la contraseña contra el hash de BCrypt
        bool passwordValida = false;
        try
        {
            passwordValida = BCrypt.Net.BCrypt.Verify(request.Password, usuario.PasswordHash);
        }
        catch
        {
            // Si el hash guardado en BD no es formato BCrypt válido
            throw new BusinessRuleException("Error al verificar la seguridad de las credenciales.", 500);
        }

        if (!passwordValida)
        {
            throw new BusinessRuleException("Credenciales inválidas.", 401);
        }

        // 4. Determinar código de rol seguro
        var codigoRol = usuario.Rol?.Codigo ?? "CONSULTA";

        // 5. Generar Token JWT
        var secretKey = _configuration["Jwt:Secret"] ?? "SuperSecretKey_InventarioComputacion_2026_KeyMustBeLongEnough!";
        var key = Encoding.UTF8.GetBytes(secretKey);
        var expiracion = DateTime.UtcNow.AddHours(8);

        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, usuario.Id.ToString()),
            new Claim(ClaimTypes.Name, usuario.Username),
            new Claim(ClaimTypes.Role, codigoRol)
        };

        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(claims),
            Expires = expiracion,
            Issuer = _configuration["Jwt:Issuer"] ?? "InventarioApi",
            Audience = _configuration["Jwt:Audience"] ?? "InventarioWeb",
            SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
        };

        var tokenHandler = new JwtSecurityTokenHandler();
        var token = tokenHandler.CreateToken(tokenDescriptor);

        return new LoginResponseDto(
            tokenHandler.WriteToken(token),
            usuario.Username,
            codigoRol,
            expiracion
        );
    }
}