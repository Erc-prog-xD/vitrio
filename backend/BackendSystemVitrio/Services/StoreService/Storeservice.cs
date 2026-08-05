using System.Globalization;
using System.Text;
using System.Text.RegularExpressions;
using BackendSystemVitrio.Data;
using BackendSystemVitrio.DTO;
using BackendSystemVitrio.Models;
using Microsoft.EntityFrameworkCore;
using Npgsql;
using BackendSystemVitrio.Wrappers;

namespace BackendSystemVitrio.Services.StoreService
{
    public class StoreService : IStoreService
    {
        private readonly AppDbContext _context;

        public StoreService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<Response<List<StoreDto>>> GetStoresByUserAsync(int userId)
        {
            Response <List<StoreDto>> response = new Response<List<StoreDto>>();
            try{
                var stores = await _context.Store
                    .Where(s => s.UserId == userId && s.DeletionDate == null)
                    .OrderByDescending(s => s.CreationDate)
                    .Select(s => ToDto(s))
                    .ToListAsync();

                response.Dados = stores;
                response.Status = true;
                response.Mensagem = "Lojas do usuário recuperadas com sucesso.";
            }
            catch (Exception ex)
            {
                response.Dados = null;
                response.Status = false;
                response.Mensagem = $"Erro ao recuperar lojas do usuário: {ex.Message}";
            }

            return response;
        }

        public async Task<Response<StoreDto>> GetByIdAsync(int storeId, int userId)
        {
            Response<StoreDto> response = new Response<StoreDto>();

            try {
                var store = await _context.Store
                .FirstOrDefaultAsync(s => s.Id == storeId && s.UserId == userId && s.DeletionDate == null);

                if(store is null){
                    response.Dados = null;
                    response.Status = false;
                    response.Mensagem = "Loja não encontrada.";
                    return response;
                }
                response.Dados = ToDto(store);
                response.Status = true;
                response.Mensagem = "Loja recuperada com sucesso.";

            }   catch(Exception ex){
                response.Dados = null;
                response.Status = false;
                response.Mensagem = $"Erro ao recuperar loja: {ex.Message}";
            }
            return response;
        }

        public async Task<Response<StoreDto>> CreateAsync(int userId, CreateStoreDto dto)
        {
            Response <StoreDto> response = new Response<StoreDto>();

            try{
                var normalizedCnpj = OnlyDigits(dto.Cnpj);
                if (normalizedCnpj is not null){
                    var cnpjExists = await _context.Store.AnyAsync(s => s.Cnpj == normalizedCnpj);
                    if (cnpjExists)
                    {
                        response.Dados = null;
                        response.Status = false;
                        response.Mensagem = "CNPJ já cadastrado.";
                        return response;
                    }
                        
                }
                var nameExists = await _context.Store.AnyAsync(s => s.Name == dto.Name);
                if (nameExists)
                {
                    response.Dados = null;
                    response.Status = false;
                    response.Mensagem = "Nome da loja já cadastrado.";
                    return response;
                }

            var slug = await GenerateUniqueSlugAsync(dto.Name);

            var store = new Store
            {
                Name = dto.Name,
                Slug = slug,
                Cnpj = normalizedCnpj,
                Description = dto.Description,
                LogoUrl = dto.LogoUrl,
                PrimaryColor = dto.PrimaryColor ?? "#2563eb",
                SecondaryColor = dto.SecondaryColor ?? "#1d4ed8",
                TertiaryColor = dto.TertiaryColor ?? "#111827",
                UserId = userId
            };

            await using var transaction = await _context.Database.BeginTransactionAsync();

            _context.Store.Add(store);
            await _context.SaveChangesAsync();
            await transaction.CommitAsync();

            response.Dados = ToDto(store);
            response.Status = true;
            response.Mensagem = "Loja criada com sucesso.";
            }
            catch (Exception ex)
            {
                response.Dados = null;
                response.Status = false;
                response.Mensagem = $"Erro ao criar loja: {ex.Message}";
            }

            return response;
        }


        private async Task<string> GenerateUniqueSlugAsync(string name, int? ignoreStoreId = null)
        {
            var baseSlug = Slugify(name);
            var slug = baseSlug;
            var counter = 2;

            while (await _context.Store.AnyAsync(s => s.Slug == slug && s.Id != ignoreStoreId))
            {
                slug = $"{baseSlug}-{counter}";
                counter++;
            }

            return slug;
        }

        // "Casa da Érica" -> "casa-da-erica"
        private static string Slugify(string value)
        {
            var normalized = value.Normalize(NormalizationForm.FormD);
            var sb = new StringBuilder();

            foreach (var c in normalized)
            {
                var category = CharUnicodeInfo.GetUnicodeCategory(c);
                if (category != UnicodeCategory.NonSpacingMark)
                    sb.Append(c);
            }

            var slug = sb.ToString().Normalize(NormalizationForm.FormC).ToLowerInvariant();
            slug = Regex.Replace(slug, @"[^a-z0-9\s-]", "");
            slug = Regex.Replace(slug, @"\s+", "-").Trim('-');

            return string.IsNullOrWhiteSpace(slug) ? "loja" : slug;
        }

        private static string? OnlyDigits(string? value)
        {
            if (string.IsNullOrWhiteSpace(value))
                return null;

            var digits = Regex.Replace(value, @"\D", "");
            return digits.Length == 0 ? null : digits;
        }

        private static StoreDto ToDto(Store s) => new()
        {
            Id = s.Id,
            Name = s.Name,
            Slug = s.Slug,
            Cnpj = s.Cnpj,
            Description = s.Description,
            LogoUrl = s.LogoUrl,
            PrimaryColor = s.PrimaryColor,
            SecondaryColor = s.SecondaryColor,
            TertiaryColor = s.TertiaryColor,
            IsActive = s.IsActive,
            CreationDate = s.CreationDate
        };
    }
}