using BackendSystemVitrio.DTO;
using BackendSystemVitrio.Models;
using BackendSystemVitrio.Wrappers;
namespace BackendSystemVitrio.Services.UserService
{
    public interface IUserService
    {
        Task<Response<string>> UpdateUserAsync(int userId, UpdateUserDto dto);

    }
}