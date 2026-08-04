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
            var stores = await _storeService.GetStoresByUserAsync(GetUserId());
            return Ok(Response<List<StoreDto>>.Ok(stores));
        }

        // GET /api/Store/{id}
        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetById(int id)
        {
            var store = await _storeService.GetByIdAsync(id, GetUserId());
            if (store is null)
                return NotFound(Response<string>.Fail("Loja não encontrada."));

            return Ok(Response<StoreDto>.Ok(store));
        }

        // POST /api/Store -> cria uma nova loja para o usuário logado
        [HttpPost]
        public async Task<IActionResult> Create(CreateStoreDto dto)
        {
            var store = await _storeService.CreateAsync(GetUserId(), dto);
            if (store is null)
                return BadRequest(Response<string>.Fail("Já existe uma loja com esse nome ou CNPJ."));

            return CreatedAtAction(nameof(GetById), new { id = store.Id }, Response<StoreDto>.Ok(store));
        }

        // PUT /api/Store/{id}
        [HttpPut("{id:int}")]
        public async Task<IActionResult> Update(int id, UpdateStoreDto dto)
        {
            var store = await _storeService.UpdateAsync(id, GetUserId(), dto);
            if (store is null)
                return BadRequest(Response<string>.Fail("Não foi possível atualizar a loja."));

            return Ok(Response<StoreDto>.Ok(store));
        }

        // DELETE /api/Store/{id} -> soft delete
        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Delete(int id)
        {
            var deleted = await _storeService.DeleteAsync(id, GetUserId());
            if (!deleted)
                return NotFound(Response<string>.Fail("Loja não encontrada."));

            return Ok(Response<string>.Ok("Loja removida com sucesso."));
        }

        // Lê o Id do usuário a partir do claim colocado no token pelo AuthService.GenerateToken.
        private int GetUserId()
        {
            var claim = User.FindFirstValue(ClaimTypes.NameIdentifier);
            return int.Parse(claim!);
        }
    }
}