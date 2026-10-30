using Inventario.Application.Dtos;

namespace Inventario.Application.Interfaces;

public interface IMovimientoService
{
    Task<bool> RegistrarEntradaAsync(RegistrarEntradaDto dto, int usuarioId);
    Task<bool> RegistrarSalidaAsync(RegistrarSalidaDto dto, int usuarioId);
}