using BackendSystemVitrio.DTO;
using BackendSystemVitrio.Wrappers;

namespace BackendSystemVitrio.Services.CategoryService
{
    public interface ICategoryService
    {
        Task<Response<List<CategoryResponseDto>>> getCategoriesByStore(int storeId, int userId);
        Task<Response<string>> createCategoryByStore(int userId, CreateCategoryDto dto);
    }
}