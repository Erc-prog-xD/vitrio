using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using System.Text.RegularExpressions;
using BackendSystemVitrio.Data;
using BackendSystemVitrio.DTO;
using BackendSystemVitrio.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

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
            var normalizedCnpj = OnlyDigits(dto.Cnpj);

            if (normalizedCpf is not null)
            {
                var cpfExists = await _context.User.AnyAsync(u => u.Cpf == normalizedCpf);
                if (cpfExists)
                    return null;
            }

            if (normalizedCnpj is not null)
            {
                var cnpjExists = await _context.User.AnyAsync(u => u.Cnpj == normalizedCnpj);
                if (cnpjExists)
                    return null;
            }

            var emailExists = await _context.User.AnyAsync(u => u.Email == dto.Email);
            if (emailExists)
                return null;

            CreatePasswordHash(dto.Password, out byte[] hash, out byte[] salt);

            var user = new User
            {
                Name = dto.Name,
                Email = dto.Email,
                Role = dto.Role,
                StoreName = dto.StoreName,
                Phone = dto.Phone,
                Cpf = normalizedCpf,
                Cnpj = normalizedCnpj,
                PasswordHash = hash,
                PasswordSalt = salt
            };

            _context.User.Add(user);

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateException)
            {
                // Guarda contra a race condition: se dois requests chegarem ao
                // mesmo tempo com o mesmo CPF/CNPJ/e-mail, os índices únicos do
                // banco (configurados no AppDbContext) rejeitam o segundo insert
                // mesmo que ambos tenham passado pelas checagens acima.
                return null;
            }

            return user;
        }

        public async Task<User?> ValidateCredentialsAsync(LoginDto dto)
        {
            var document = OnlyDigits(dto.Document);

            var user = await _context.User
                .FirstOrDefaultAsync(u => u.Cpf == document || u.Cnpj == document);

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
        // Retorna null (não string vazia) quando o valor não veio preenchido,
        // para não conflitar com outros registros que também não têm o campo -
        // o Postgres permite múltiplos NULL num índice único, mas não múltiplas
        // strings vazias.
        private static string? OnlyDigits(string? value)
        {
            if (string.IsNullOrWhiteSpace(value))
                return null;

            var digits = Regex.Replace(value, @"\D", "");
            return digits.Length == 0 ? null : digits;
        }
    }
}