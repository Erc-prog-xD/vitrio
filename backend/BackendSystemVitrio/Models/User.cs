using BackendSystemVitrio.Enum;

namespace BackendSystemVitrio.Models
{
    public class User
    {
        public int Id { get; set; }
        public required string Name { get; set; }
        public required string Email { get; set; }

        public string? Phone { get; set; }

        // CPF agora é a única credencial usada no login, por isso é obrigatório
        // (antes era opcional, o que quebrava o login e abria brecha de segurança
        // quando dois usuários ficavam com Cpf nulo).
        public required string Cpf { get; set; }

        public required Role Role { get; set; }

        public required byte[] PasswordHash { get; set; }
        public required byte[] PasswordSalt { get; set; }

        public DateTime CreationDate { get; set; } = DateTime.UtcNow;
        public DateTime? DeletionDate { get; set; } = null;

        // Um usuário pode ter várias lojas (antes era Store? Store, 1 para 1).
        public ICollection<Store> Stores { get; set; } = new List<Store>();
    }
}