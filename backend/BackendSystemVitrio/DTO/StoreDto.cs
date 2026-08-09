namespace BackendSystemVitrio.DTO
{
    public class StoreDto
    {
        public int Id { get; set; }
        public required string Name { get; set; }
        public required string Slug { get; set; }
        public string? Cnpj { get; set; }
        public string? Description { get; set; }
        public string? LogoUrl { get; set; }
        public required string PrimaryColor { get; set; }
        public required string SecondaryColor { get; set; }
        public required string TertiaryColor { get; set; }
        public bool IsActive { get; set; }
        public DateTime CreationDate { get; set; }
    }
}