namespace BackendSystemVitrio.Models
{
    public class ProductImage
    {
        public int Id { get; set; }

        public required int ProductId { get; set; }
        public Product? Product { get; set; }

        public required string Url { get; set; }

        // Define a ordem de exibição das imagens no produto (0 = primeira/capa)
        public int Order { get; set; } = 0;

        public DateTime CreationDate { get; set; } = DateTime.UtcNow;
    }
}