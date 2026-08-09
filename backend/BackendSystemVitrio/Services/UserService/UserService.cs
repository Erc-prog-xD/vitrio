using System.Globalization;
using System.Text;
using System.Text.RegularExpressions;
using BackendSystemVitrio.Data;
using BackendSystemVitrio.DTO;
using BackendSystemVitrio.Models;
using Microsoft.EntityFrameworkCore;
using Npgsql;
using BackendSystemVitrio.Wrappers;

namespace BackendSystemVitrio.Services.UserService
{
    public class UserService : IUserService
    {
        private readonly AppDbContext _context;

        public UserService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<Response<string>> UpdateUserAsync(int userId, UpdateUserDto dto)
        {
            Response<string> response = new Response<string>();
    
            try
            {
                var user = await _context.User.FirstOrDefaultAsync(u => u.Id == userId);

                if (user is null)
                {
                    response.Dados = null;
                    response.Status = false;
                    response.Mensagem = "Usuário não encontrado.";
                    return response;
                }

                Console.WriteLine("iasdiaskdoaskdoaskd");
                
                if (!string.IsNullOrWhiteSpace(dto.Name))
                    user.Name = dto.Name;

                if (!string.IsNullOrWhiteSpace(dto.Email))
                    user.Email = dto.Email;

                if (!string.IsNullOrWhiteSpace(dto.Phone))
                    user.Phone = dto.Phone;

                _context.User.Update(user);
                await _context.SaveChangesAsync();

                response.Dados = null;
                response.Status = true;
                response.Mensagem = "Perfil atualizado com sucesso.";
            }
            catch (Exception ex)
            {
                response.Dados = null;
                response.Status = false;
                response.Mensagem = $"Erro ao atualizar perfil: {ex.Message}";
            }

            return response;
        }
    }
}