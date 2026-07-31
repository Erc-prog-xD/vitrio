using BackendSystemVitrio.Enum;

namespace BackendSystemVitrio.DTO
{
    public class RegisterDto
    {
        public required string Name { get; set; }
        public required string Email { get; set; }
        public required string Password { get; set; }
        public required Role Role { get; set; }

        public string? StoreName { get; set; }
        public string? Phone { get; set; }
        public string? Cpf { get; set; }
        public string? Cnpj { get; set; }
    }
}