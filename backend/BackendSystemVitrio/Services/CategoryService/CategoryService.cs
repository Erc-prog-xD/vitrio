using System.Globalization;
using System.Text;
using System.Text.RegularExpressions;
using BackendSystemVitrio.Data;
using BackendSystemVitrio.DTO;
using BackendSystemVitrio.Models;
using BackendSystemVitrio.Wrappers;
using Microsoft.EntityFrameworkCore;

namespace BackendSystemVitrio.Services.CategoryService
{
    public class CategoryService : ICategoryService
    {
        private readonly AppDbContext _context;

        public CategoryService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<Response<List<CategoryResponseDto>>> getCategoriesByStore(int storeId, int userId)
        {
            Response<List<CategoryResponseDto>> response = new Response<List<CategoryResponseDto>>();

            try
            {
                var store = await _context.Store
                    .FirstOrDefaultAsync(s => s.Id == storeId && s.DeletionDate == null);

                if (store is null)
                {
                    response.Dados = null;
                    response.Status = false;
                    response.Mensagem = "Loja não encontrada.";
                    return response;
                }

                if (store.UserId != userId)
                {
                    response.Dados = null;
                    response.Status = false;
                    response.Mensagem = "Você não tem permissão para acessar esta loja.";
                    return response;
                }

                var categories = await _context.Category
                    .Where(c => c.StoreId == storeId && c.DeletionDate == null)
                    .OrderBy(c => c.Name)
                    .Select(c => new CategoryResponseDto
                    {
                        Id = c.Id,
                        StoreId = c.StoreId,
                        Name = c.Name,
                        Slug = c.Slug,
                        ParentCategoryId = c.ParentCategoryId,
                        IsActive = c.IsActive,
                    })
                    .ToListAsync();

                response.Dados = categories;
                response.Status = true;
                response.Mensagem = "Categorias recuperadas com sucesso.";
            }
            catch (Exception ex)
            {
                response.Dados = null;
                response.Status = false;
                response.Mensagem = $"Erro ao recuperar categorias: {ex.Message}";
            }

            return response;
        }

        public async Task<Response<string>> createCategoryByStore(int userId, CreateCategoryDto dto)
        {
            Response<string> response = new Response<string>();

            try
            {
                var store = await _context.Store
                    .FirstOrDefaultAsync(s => s.Id == dto.StoreId && s.DeletionDate == null);

                if (store is null)
                {
                    response.Dados = null;
                    response.Status = false;
                    response.Mensagem = "Loja não encontrada.";
                    return response;
                }

                if (store.UserId != userId)
                {
                    response.Dados = null;
                    response.Status = false;
                    response.Mensagem = "Você não tem permissão para acessar esta loja.";
                    return response;
                }

                if (string.IsNullOrWhiteSpace(dto.Name))
                {
                    response.Dados = null;
                    response.Status = false;
                    response.Mensagem = "O nome da categoria é obrigatório.";
                    return response;
                }

                if (dto.ParentCategoryId.HasValue)
                {
                    var parentExists = await _context.Category.AnyAsync(c =>
                        c.Id == dto.ParentCategoryId.Value && c.StoreId == dto.StoreId && c.DeletionDate == null);

                    if (!parentExists)
                    {
                        response.Dados = null;
                        response.Status = false;
                        response.Mensagem = "Categoria pai não encontrada nesta loja.";
                        return response;
                    }
                }

                var category = new Category
                {
                    StoreId = dto.StoreId,
                    Name = dto.Name,
                    Slug = dto.Slug,
                    ParentCategoryId = dto.ParentCategoryId,
                };

                await using var transaction = await _context.Database.BeginTransactionAsync();

                _context.Category.Add(category);
                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                response.Dados = category.Id.ToString();
                response.Status = true;
                response.Mensagem = "Categoria criada com sucesso.";
            }
            catch (Exception ex)
            {
                response.Dados = null;
                response.Status = false;
                response.Mensagem = $"Erro ao criar categoria: {ex.Message}";
            }

            return response;
        }

    }
}