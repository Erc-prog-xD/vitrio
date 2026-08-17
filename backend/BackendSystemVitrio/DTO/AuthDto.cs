// DTO/AuthResultDto.cs
namespace BackendSystemVitrio.DTO
{

    public class AuthResponseDto
    {
        public required string Token { get; set; }
        public DateTime ExpiresAt { get; set; }
    }
    // Uso interno entre Service e Controller — nunca serializado direto na resposta HTTP,
    // porque o RefreshToken não pode vazar no corpo JSON (só vai no cookie HttpOnly).
    public class AuthResultDto
    {
        public required string AccessToken { get; set; }
        public required string RefreshToken { get; set; }
    }

}