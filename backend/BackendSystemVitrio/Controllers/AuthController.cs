using BackendSystemVitrio.DTO;
using BackendSystemVitrio.Services.AuthService;
using Microsoft.AspNetCore.Mvc;
using BackendSystemVitrio.Wrappers;

namespace BackendSystemVitrio.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;

        public AuthController(IAuthService authService)
        {
            _authService = authService;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register(RegisterDto dto)
        {
            var user = await _authService.RegisterAsync(dto);
            if (user is null)
                return BadRequest(Response<string>.Fail("CPF obrigatório, ou já existe uma conta com esse Email ou CPF."));

            var token = _authService.GenerateToken(user);
            var response = new AuthResponseDto { Token = token, ExpiresAt = DateTime.UtcNow.AddHours(8) };

            return Ok(Response<AuthResponseDto>.Ok(response));
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login(LoginDto dto)
        {
            var user = await _authService.ValidateCredentialsAsync(dto);
            if (user is null)
                return Unauthorized(Response<string>.Fail("CPF ou senha inválidos."));

            var token = _authService.GenerateToken(user);
            var response = new AuthResponseDto { Token = token, ExpiresAt = DateTime.UtcNow.AddHours(8) };

            return Ok(Response<AuthResponseDto>.Ok(response));
        }
    }
}