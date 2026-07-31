using BackendSystemVitrio.DTO;
using BackendSystemVitrio.Models;

namespace BackendSystemVitrio.Services.AuthService
{
    public interface IAuthService
    {
        Task<User?> RegisterAsync(RegisterDto dto);
        Task<User?> ValidateCredentialsAsync(LoginDto dto);
        string GenerateToken(User user);
    }
}