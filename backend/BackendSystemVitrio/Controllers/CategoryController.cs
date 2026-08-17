using System.Security.Claims;
using BackendSystemVitrio.DTO;
using BackendSystemVitrio.Services.CategoryService;
using BackendSystemVitrio.Wrappers;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;


namespace BackendSystemVitrio.Controllers
{

    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Shopkeeper,Admin")]
    public class CategoryController : ControllerBase
    {
        private readonly ICategoryService _categoryService;

        public CategoryController(ICategoryService categoryService)
        {
            _categoryService = categoryService;
        }

        [HttpGet("{id:int}")]
        public async Task<IActionResult> getCategoriesByStore(int id)
        {
            var response = await _categoryService.getCategoriesByStore(id, GetUserId());
            return Ok(response);
        }
        
        [HttpPost]
        public async Task<IActionResult> createCategoryByStore([FromBody] CreateCategoryDto dto)
        {
            var response = await _categoryService.createCategoryByStore(GetUserId(), dto);
            return Ok(response);
        }

        private int GetUserId()
        {
            var claim = User.FindFirstValue(ClaimTypes.NameIdentifier);
            return int.Parse(claim!);
        }
    }

}
