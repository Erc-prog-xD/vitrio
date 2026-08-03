using BackendSystemVitrio.Enum;

namespace BackendSystemVitrio.Models
{
    public class User
    {
        public int Id { get; set; }
        public required string Name { get; set; }
        public required string Email { get; set; }

        public string? Phone { get; set; }
        public string? Cpf { get; set; }

        public required Role Role { get; set; }

        public required byte[] PasswordHash { get; set; }
        public required byte[] PasswordSalt { get; set; }

        public DateTime CreationDate { get; set; } = DateTime.UtcNow;
        public DateTime? DeletionDate { get; set; } = null;

        // Um lojista tem uma loja; cliente e admin não têm.
        public Store? Store { get; set; }
    }
}