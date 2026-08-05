using System.Security.Claims;
using BackendSystemVitrio.DTO;
using BackendSystemVitrio.Services.AuthService;
using Microsoft.AspNetCore.Authorization;
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
            var response = await _authService.RegisterAsync(dto);
            return Ok(response);
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login(LoginDto dto)
        {
            var response = await _authService.ValidateCredentialsAsync(dto);
            return Ok(response);
        }

        // GET /api/Auth/me -> usado pelo frontend logo ao abrir o app pra
        // saber quem está logado (e se o token ainda é válido) e popular
        // a tela com os dados reais do usuário.
        [HttpGet("me")]
        [Authorize]
        public async Task<IActionResult> Me()
        {
            var idClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var user = await _authService.GetByIdAsync(int.Parse(idClaim!));

            if (user is null)
                return NotFound(Response<string>.Fail("Usuário não encontrado."));

            var dto = new UserDto
            {
                Id = user.Id,
                Name = user.Name,
                Email = user.Email,
                Phone = user.Phone,
                Cpf = user.Cpf,
                Role = user.Role.ToString()
            };

            return Ok(Response<UserDto>.Ok(dto));
        }
    }
}