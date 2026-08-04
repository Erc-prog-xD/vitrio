using BackendSystemVitrio.Models;
using Microsoft.EntityFrameworkCore;

namespace BackendSystemVitrio.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
        }

        public DbSet<User> User { get; set; }
        public DbSet<Store> Store { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<User>()
                .HasIndex(u => u.Email)
                .IsUnique();

            // CPF é a credencial de login agora: único e obrigatório.
            modelBuilder.Entity<User>()
                .HasIndex(u => u.Cpf)
                .IsUnique();

            modelBuilder.Entity<Store>()
                .HasIndex(s => s.Cnpj)
                .IsUnique();

            modelBuilder.Entity<Store>()
                .HasIndex(s => s.Name)
                .IsUnique();

            modelBuilder.Entity<Store>()
                .HasIndex(s => s.Slug)
                .IsUnique();

            // Removido o índice único de UserId (antes limitava a 1 loja por
            // usuário) e a relação passou de HasOne/WithOne para HasOne/WithMany,
            // já que agora 1 usuário pode ter N lojas.
            modelBuilder.Entity<Store>()
                .HasOne(s => s.User)
                .WithMany(u => u.Stores)
                .HasForeignKey(s => s.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}