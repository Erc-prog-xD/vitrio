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
        Task<Response<AuthResultDto>> ValidateCredentialsAsync(LoginDto dto);
        Task<Response<AuthResultDto>> RefreshTokenAsync(string refreshToken);
        Task<Response<string>> RevokeRefreshTokenAsync(string refreshToken);
        Task<User?> GetByIdAsync(int id);
    }
}