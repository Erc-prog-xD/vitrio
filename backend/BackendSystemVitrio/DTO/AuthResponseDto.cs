namespace BackendSystemVitrio.DTO
{
    public class AuthResponseDto
    {
        public required string Token { get; set; }
        public DateTime ExpiresAt { get; set; }
    }
}