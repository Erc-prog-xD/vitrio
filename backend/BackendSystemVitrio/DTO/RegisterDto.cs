using BackendSystemVitrio.Enum;

namespace BackendSystemVitrio.DTO
{
    // Obs: reconstruí este DTO com base no que era usado em AuthService/AuthController,
    // já que o arquivo original não foi enviado. Ajuste os nomes se divergirem do seu.
    public class RegisterDto
    {
        public required string Name { get; set; }
        public required string Email { get; set; }
        public required string Password { get; set; }

        // Obrigatório: é a credencial usada no login.
        public required string Cpf { get; set; }

        public string? Phone { get; set; }
        public required Role Role { get; set; }

        // StoreName removido: a loja não é mais criada junto com o cadastro,
        // e sim depois, via POST /api/Store, já autenticado.
    }
}