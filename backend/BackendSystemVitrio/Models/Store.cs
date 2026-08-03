namespace BackendSystemVitrio.Models
{
    public class Store
    {
        public int Id { get; set; }

        public required string Name { get; set; }

        // Usado em URLs públicas da loja, ex: vitrio.com/loja/casa-da-erica
        // Gerado automaticamente a partir do Name no momento do cadastro.
        public required string Slug { get; set; }

        // CNPJ da loja (opcional - MEI pode se registrar só com CPF do dono).
        public string? Cnpj { get; set; }

        public string? Description { get; set; }
        public string? LogoUrl { get; set; }

        // Cores usadas para personalizar a vitrine pública da loja
        public string PrimaryColor { get; set; } = "#2563eb";
        public string SecondaryColor { get; set; } = "#1d4ed8";
        public string TertiaryColor { get; set; } = "#111827";

        // Permite "pausar" a loja (some da vitrine pública) sem apagar os dados
        public bool IsActive { get; set; } = true;

        public DateTime CreationDate { get; set; } = DateTime.UtcNow;
        public DateTime? DeletionDate { get; set; } = null;

        // Dono da loja (1 usuário -> 1 loja, por enquanto)
        public required int UserId { get; set; }
        public User? User { get; set; }
    }
}