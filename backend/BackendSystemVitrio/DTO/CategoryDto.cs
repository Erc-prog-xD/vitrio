namespace BackendSystemVitrio.DTO
{
    public class CreateCategoryDto
    {
        public required int StoreId { get; set; }
        public required string Name { get; set; }
        public string? Slug { get; set; }
        public int? ParentCategoryId { get; set; }
    }

    public class UpdateCategoryDto
    {
        public string? Name { get; set; }
        public string? Slug { get; set; }
        public int? ParentCategoryId { get; set; }
        public bool? IsActive { get; set; }
    }

    public class CategoryResponseDto
    {
        public int Id { get; set; }
        public int StoreId { get; set; }
        public required string Name { get; set; }
        public required string Slug { get; set; }
        public int? ParentCategoryId { get; set; }
        public bool IsActive { get; set; }
    }
}