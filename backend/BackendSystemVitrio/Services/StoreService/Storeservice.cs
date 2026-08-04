using System.Globalization;
using System.Text;
using System.Text.RegularExpressions;
using BackendSystemVitrio.Data;
using BackendSystemVitrio.DTO;
using BackendSystemVitrio.Models;
using Microsoft.EntityFrameworkCore;
using Npgsql;

namespace BackendSystemVitrio.Services.StoreService
{
    public class StoreService : IStoreService
    {
        private readonly AppDbContext _context;

        public StoreService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<List<StoreDto>> GetStoresByUserAsync(int userId)
        {
            return await _context.Store
                .Where(s => s.UserId == userId && s.DeletionDate == null)
                .OrderByDescending(s => s.CreationDate)
                .Select(s => ToDto(s))
                .ToListAsync();
        }

        public async Task<StoreDto?> GetByIdAsync(int storeId, int userId)
        {
            // Sempre filtra por UserId também: garante que um usuário não
            // consiga ler/editar/apagar loja de outro só trocando o {id} na URL.
            var store = await _context.Store
                .FirstOrDefaultAsync(s => s.Id == storeId && s.UserId == userId && s.DeletionDate == null);

            return store is null ? null : ToDto(store);
        }

        public async Task<StoreDto?> CreateAsync(int userId, CreateStoreDto dto)
        {
            var normalizedCnpj = OnlyDigits(dto.Cnpj);

            if (normalizedCnpj is not null)
            {
                var cnpjExists = await _context.Store.AnyAsync(s => s.Cnpj == normalizedCnpj);
                if (cnpjExists)
                    return null;
            }

            var nameExists = await _context.Store.AnyAsync(s => s.Name == dto.Name);
            if (nameExists)
                return null;

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

            try
            {
                _context.Store.Add(store);
                await _context.SaveChangesAsync();
                await transaction.CommitAsync();
            }
            catch (DbUpdateException ex) when (ex.InnerException is PostgresException { SqlState: "23505" })
            {
                // Mesma race condition do RegisterAsync: dois requests
                // simultâneos com o mesmo nome/CNPJ/slug.
                await transaction.RollbackAsync();
                return null;
            }

            return ToDto(store);
        }

        public async Task<StoreDto?> UpdateAsync(int storeId, int userId, UpdateStoreDto dto)
        {
            var store = await _context.Store
                .FirstOrDefaultAsync(s => s.Id == storeId && s.UserId == userId && s.DeletionDate == null);

            if (store is null)
                return null;

            if (!string.IsNullOrWhiteSpace(dto.Name) && dto.Name != store.Name)
            {
                var nameExists = await _context.Store.AnyAsync(s => s.Name == dto.Name && s.Id != storeId);
                if (nameExists)
                    return null;

                store.Name = dto.Name;
                store.Slug = await GenerateUniqueSlugAsync(dto.Name, storeId);
            }

            if (dto.Description is not null) store.Description = dto.Description;
            if (dto.LogoUrl is not null) store.LogoUrl = dto.LogoUrl;
            if (dto.PrimaryColor is not null) store.PrimaryColor = dto.PrimaryColor;
            if (dto.SecondaryColor is not null) store.SecondaryColor = dto.SecondaryColor;
            if (dto.TertiaryColor is not null) store.TertiaryColor = dto.TertiaryColor;
            if (dto.IsActive.HasValue) store.IsActive = dto.IsActive.Value;

            if (dto.Cnpj is not null)
            {
                var normalizedCnpj = OnlyDigits(dto.Cnpj);

                if (normalizedCnpj is not null)
                {
                    var cnpjExists = await _context.Store.AnyAsync(s => s.Cnpj == normalizedCnpj && s.Id != storeId);
                    if (cnpjExists)
                        return null;
                }

                store.Cnpj = normalizedCnpj;
            }

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateException ex) when (ex.InnerException is PostgresException { SqlState: "23505" })
            {
                return null;
            }

            return ToDto(store);
        }

        public async Task<bool> DeleteAsync(int storeId, int userId)
        {
            var store = await _context.Store
                .FirstOrDefaultAsync(s => s.Id == storeId && s.UserId == userId && s.DeletionDate == null);

            if (store is null)
                return false;

            // Soft delete: preserva histórico (produtos, pedidos etc.) e
            // some da vitrine pública, igual ao padrão já usado em User.
            store.DeletionDate = DateTime.UtcNow;
            store.IsActive = false;

            await _context.SaveChangesAsync();
            return true;
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