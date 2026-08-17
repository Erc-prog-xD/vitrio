// Models/RefreshToken.cs
namespace BackendSystemVitrio.Models
{
    public class RefreshToken
    {
        public int Id { get; set; }

        public required int UserId { get; set; }
        public User? User { get; set; }

        // Valor aleatório opaco — não é um JWT, só um identificador único.
        public required string Token { get; set; }

        public DateTime ExpiresAt { get; set; }
        public DateTime CreationDate { get; set; } = DateTime.UtcNow;
        public DateTime? RevokedAt { get; set; }

        public bool IsActive => RevokedAt == null && DateTime.UtcNow < ExpiresAt;
    }
}