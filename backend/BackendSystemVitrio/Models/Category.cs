namespace BackendSystemVitrio.Models
{
    public class Category
    {
        public int Id { get; set; }

        // Loja dona da categoria (categorias não são compartilhadas entre lojas)
        public required int StoreId { get; set; }
        public Store? Store { get; set; }

        public required string Name { get; set; }

        // Usado na URL, ex: /loja/casa-da-erica/categoria/roupas-masculinas
        // Único por loja (StoreId, Slug), mesmo caso do Product.
        public required string Slug { get; set; }

        // Permite subcategorias (ex: Roupas > Masculino). Null = categoria raiz.
        public int? ParentCategoryId { get; set; }
        public Category? ParentCategory { get; set; }
        public ICollection<Category> SubCategories { get; set; } = new List<Category>();

        public bool IsActive { get; set; } = true;

        public DateTime CreationDate { get; set; } = DateTime.UtcNow;
        public DateTime? DeletionDate { get; set; }

        public ICollection<Product> Products { get; set; } = new List<Product>();
    }
}