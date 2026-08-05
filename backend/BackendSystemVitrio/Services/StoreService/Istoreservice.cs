using BackendSystemVitrio.DTO;
using BackendSystemVitrio.Models;
using BackendSystemVitrio.Wrappers;
namespace BackendSystemVitrio.Services.StoreService
{
    public interface IStoreService
    {
        Task<Response<List<StoreDto>>> GetStoresByUserAsync(int userId);
        Task<Response<StoreDto>> CreateAsync(int userId, CreateStoreDto dto);
        Task<Response<StoreDto>> GetByIdAsync(int storeId, int userId);
    }
}