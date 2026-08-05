using System.Security.Claims;
using BackendSystemVitrio.DTO;
using BackendSystemVitrio.Services.StoreService;
using BackendSystemVitrio.Wrappers;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BackendSystemVitrio.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize] // exige o JWT gerado no login/registro
    public class StoreController : ControllerBase
    {
        private readonly IStoreService _storeService;

        public StoreController(IStoreService storeService)
        {
            _storeService = storeService;
        }

        // GET /api/Store -> todas as lojas do usuário logado
        [HttpGet]
        public async Task<IActionResult> GetMyStores()
        {
            var response = await _storeService.GetStoresByUserAsync(GetUserId());
            return Ok(response);
        }

        // GET /api/Store/{id}
        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetById(int id)
        {
            var response = await _storeService.GetByIdAsync(id, GetUserId());
            return Ok(response);
        }

        // POST /api/Store -> cria uma nova loja para o usuário logado
        [HttpPost]
        public async Task<IActionResult> Create(CreateStoreDto dto)
        {
            var response = await _storeService.CreateAsync(GetUserId(), dto);
            return Ok(response);
        }


        // Lê o Id do usuário a partir do claim colocado no token pelo AuthService.GenerateToken.
        private int GetUserId()
        {
            var claim = User.FindFirstValue(ClaimTypes.NameIdentifier);
            return int.Parse(claim!);
        }
    }
}