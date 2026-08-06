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
using Npgsql;
using BackendSystemVitrio.Wrappers;
using BackendSystemVitrio.Enum;

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

        public async Task<Response<string>> RegisterAsync(RegisterDto dto)
        {

            Response<string> response = new Response<string>();

            try{

            

            var normalizedCpf = OnlyDigits(dto.Cpf);

            if (normalizedCpf is null){
                response.Dados = null;
                response.Mensagem = "CPF inválido.";
                response.Status = false;
                return response;
            }

            var cpfExists = await _context.User.AnyAsync(u => u.Cpf == normalizedCpf);
            if (cpfExists){
                response.Dados = null;
                response.Mensagem = "CPF já cadastrado.";
                response.Status = false;
                return response;
            }

            var emailExists = await _context.User.AnyAsync(u => u.Email == dto.Email);
            if (emailExists){
                response.Dados = null;
                response.Mensagem = "Email já cadastrado.";
                response.Status = false;
                return response;
            }

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


            _context.User.Add(user);
            await _context.SaveChangesAsync();
            await transaction.CommitAsync();
            
            response.Dados = "Usuário cadastrado com sucesso.";
            response.Mensagem = null;
            response.Status = true;
            }
            catch (Exception ex)
            {
                response.Dados = null;
                response.Mensagem = "Erro ao cadastrar usuário: " + ex.Message;
                response.Status = false;
            }

            return response;
        }

        public async Task<Response<string>> ValidateCredentialsAsync(LoginDto dto)
        {
            Response<string> response = new Response<string>();

            try{

            var cpf = OnlyDigits(dto.Cpf);

            if (cpf is null){
                response.Dados = null;
                response.Mensagem = "CPF inválido.";
                response.Status = false;
                return response;
            }
                

            var user = await _context.User.FirstOrDefaultAsync(u => u.Cpf == cpf);

            if (user is null){
                response.Dados = null;
                response.Mensagem = "Usuário não encontrado.";
                response.Status = false;
                return response;
            }

            if (!VerifyPasswordHash(dto.Password, user.PasswordHash, user.PasswordSalt)){
                response.Dados = null;
                response.Mensagem = "Senha incorreta.";
                response.Status = false;
                return response;
            }

            if (user.Role == Role.Client){
                response.Dados = null;
                response.Mensagem = "Este acesso é exclusivo para lojistas e administradores.";
                response.Status = false;
                return response;
            }

            var token = GenerateToken(user);

            response.Dados = token;
            response.Mensagem = "Login bem-sucedido.";
            response.Status = true;
            }
            catch (Exception ex)
            {
                response.Dados = null;
                response.Mensagem = "Erro ao validar credenciais: " + ex.Message;
                response.Status = false;
            }
            return response;
        }

        // Usado pelo GET /api/Auth/me: busca o usuário direto do banco a
        // partir do Id que veio no claim do token, em vez de confiar só no
        // que está decodificado no JWT (que pode estar desatualizado se o
        // usuário editou o perfil depois de logar).
        public async Task<User?> GetByIdAsync(int id)
        {
            return await _context.User.FirstOrDefaultAsync(u => u.Id == id && u.DeletionDate == null);
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

        private static string? OnlyDigits(string? value)
        {
            if (string.IsNullOrWhiteSpace(value))
                return null;

            var digits = Regex.Replace(value, @"\D", "");
            return digits.Length == 0 ? null : digits;
        }
    }
}