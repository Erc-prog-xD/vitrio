using BackendSystemVitrio.DTO;

namespace BackendSystemVitrio.Services.StoreService
{
    public interface IStoreService
    {
        Task<List<StoreDto>> GetStoresByUserAsync(int userId);
        Task<StoreDto?> GetByIdAsync(int storeId, int userId);
        Task<StoreDto?> CreateAsync(int userId, CreateStoreDto dto);
        Task<StoreDto?> UpdateAsync(int storeId, int userId, UpdateStoreDto dto);
        Task<bool> DeleteAsync(int storeId, int userId);
    }
}