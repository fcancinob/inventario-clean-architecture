using System.Text;
using Inventario.Application.Interfaces;
using Inventario.Application.Services;
using Inventario.Domain.Exceptions;
using Inventario.Infrastructure.Persistence;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Diagnostics;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;

var builder = WebApplication.CreateBuilder(args);

// Controladores
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();

// Swagger Generator
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "Inventario API",
        Version = "v1",
        Description = "API REST de Gestión de Inventario"
    });

    options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "Autenticación JWT. Ingrese 'Bearer' seguido de su token. Ejemplo: Bearer eyJhbGci...",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
    });

    options.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference { Type = ReferenceType.SecurityScheme, Id = "Bearer" }
            },
            Array.Empty<string>()
        }
    });
});

// Configuración de EF Core y DbContext
builder.Services.AddDbContext<InventarioDbContext>(options =>
    options.UseSqlite(builder.Configuration.GetConnectionString("DefaultConnection")));

// Mapeos para resolver la inyección de dependencias en servicios que piden IInventarioDbContext o DbContext
builder.Services.AddScoped<IInventarioDbContext>(sp => sp.GetRequiredService<InventarioDbContext>());
builder.Services.AddScoped<DbContext>(sp => sp.GetRequiredService<InventarioDbContext>());

// Inyección de Servicios de Aplicación
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IProductoService, ProductoService>();
builder.Services.AddScoped<IMovimientoService, MovimientoService>();
builder.Services.AddScoped<IReporteService, ReporteService>();

// Autenticación JWT
var secretKey = builder.Configuration["Jwt:Secret"] ?? "SuperSecretKey_InventarioComputacion_2026_KeyMustBeLongEnough!";
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"] ?? "InventarioApi",
            ValidAudience = builder.Configuration["Jwt:Audience"] ?? "InventarioWeb",
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey))
        };
    });

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", p => p.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader());
});

var app = builder.Build();

// Inicializar Semilla de Datos (Seed)
using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<InventarioDbContext>();
    DbInitializer.Initialize(context);
}

// Middleware de Manejo Global de Excepciones
app.UseExceptionHandler(exceptionHandlerApp =>
{
    exceptionHandlerApp.Run(async context =>
    {
        var exceptionHandlerFeature = context.Features.Get<IExceptionHandlerFeature>();
        if (exceptionHandlerFeature?.Error is BusinessRuleException ex)
        {
            context.Response.StatusCode = ex.StatusCode;
            await context.Response.WriteAsJsonAsync(new { status = ex.StatusCode, detail = ex.Message });
        }
        else
        {
            context.Response.StatusCode = 500;
            await context.Response.WriteAsJsonAsync(new { status = 500, detail = "Ocurrió un error interno en el servidor." });
        }
    });
});

// Middlewares del Pipeline de ASP.NET Core
app.UseSwagger();
app.UseSwaggerUI(c =>
{
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "Inventario API v1");
    c.RoutePrefix = "swagger";
});

app.UseCors("AllowFrontend");
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();