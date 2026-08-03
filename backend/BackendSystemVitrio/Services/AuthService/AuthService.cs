using System.Globalization;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using System.Text.RegularExpressions;
using BackendSystemVitrio.Data;
using BackendSystemVitrio.DTO;
using BackendSystemVitrio.Enum;
using BackendSystemVitrio.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Npgsql;

namespace BackendSystemVitrio.Services.AuthService
{
    public class AuthService : IAuthService
    {
        private readonly AppDbContext _context;
        private readonly IConfiguration _configuration;

        public AuthService(AppDbContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }

        public async Task<User?> RegisterAsync(RegisterDto dto)
        {
            var normalizedCpf = OnlyDigits(dto.Cpf);

            if (normalizedCpf is not null)
            {
                var cpfExists = await _context.User.AnyAsync(u => u.Cpf == normalizedCpf);
                if (cpfExists)
                    return null;
            }

            var emailExists = await _context.User.AnyAsync(u => u.Email == dto.Email);
            if (emailExists)
                return null;

            var isShopkeeperWithStore = dto.Role == Role.Shopkeeper && !string.IsNullOrWhiteSpace(dto.StoreName);


            CreatePasswordHash(dto.Password, out byte[] hash, out byte[] salt);

            var user = new User
            {
                Name = dto.Name,
                Email = dto.Email,
                Role = dto.Role,
                Phone = dto.Phone,
                Cpf = normalizedCpf,
                PasswordHash = hash,
                PasswordSalt = salt
            };

            await using var transaction = await _context.Database.BeginTransactionAsync();

            try
            {
                _context.User.Add(user);
                await _context.SaveChangesAsync(); 

                await transaction.CommitAsync();
            }
            catch (DbUpdateException ex) when (ex.InnerException is PostgresException { SqlState: "23505" })
            {
                // Cobre a race condition: dois requests simultâneos com o mesmo
                // CPF/e-mail/nome de loja/CNPJ podem passar pelas checagens acima
                // antes de qualquer um salvar. Os índices únicos do banco pegam
                // isso aqui (SqlState 23505 = unique_violation).
                await transaction.RollbackAsync();
                return null;
            }

            return user;
        }

        public async Task<User?> ValidateCredentialsAsync(LoginDto dto)
        {
            var document = OnlyDigits(dto.Document);

            // Primeiro tenta como CPF (pessoa física, dono da conta).
            var user = await _context.User.FirstOrDefaultAsync(u => u.Cpf == document);

            if (user is null)
                return null;

            if (!VerifyPasswordHash(dto.Password, user.PasswordHash, user.PasswordSalt))
                return null;

            return user;
        }

        public string GenerateToken(User user)
        {
            var claims = new List<Claim>
            {
                new(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new(ClaimTypes.Name, user.Name),
                new(ClaimTypes.Email, user.Email),
                new(ClaimTypes.Role, user.Role.ToString())
            };

            var key = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(_configuration["Jwt:Key"]!));

            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha512Signature);

            var token = new JwtSecurityToken(
                issuer: _configuration["Jwt:Issuer"],
                audience: _configuration["Jwt:Audience"],
                claims: claims,
                expires: DateTime.UtcNow.AddHours(8),
                signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        private static void CreatePasswordHash(string password, out byte[] hash, out byte[] salt)
        {
            using var hmac = new HMACSHA512();
            salt = hmac.Key;
            hash = hmac.ComputeHash(Encoding.UTF8.GetBytes(password));
        }

        private static bool VerifyPasswordHash(string password, byte[] hash, byte[] salt)
        {
            using var hmac = new HMACSHA512(salt);
            var computedHash = hmac.ComputeHash(Encoding.UTF8.GetBytes(password));
            return computedHash.SequenceEqual(hash);
        }

        // Remove pontos, traços e barras (ex: "123.456.789-00" -> "12345678900").
        // Retorna null (não string vazia) quando o valor não veio preenchido.
        private static string? OnlyDigits(string? value)
        {
            if (string.IsNullOrWhiteSpace(value))
                return null;

            var digits = Regex.Replace(value, @"\D", "");
            return digits.Length == 0 ? null : digits;
        }
    }
}