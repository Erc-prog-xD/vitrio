using BackendSystemVitrio.DTO;
using BackendSystemVitrio.Models;
using BackendSystemVitrio.Wrappers;

namespace BackendSystemVitrio.Services.AuthService
{
    // Reconstruí este contrato com base no que AuthService/AuthController usam
    // (o arquivo original não foi enviado). Só adicione o método GetByIdAsync
    // ao seu IAuthService.cs real se os outros já baterem certinho.
    public interface IAuthService
    {
        Task<Response<string>> RegisterAsync(RegisterDto dto);
        Task<Response<string>> ValidateCredentialsAsync(LoginDto dto);
        Task<User?> GetByIdAsync(int id); // novo: usado pelo GET /api/Auth/me
        string GenerateToken(User user);
    }
}