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

            // Postgres permite múltiplos NULL em índice único, então Cpf/Cnpj
            // continuam opcionais sem conflitar entre si.
            modelBuilder.Entity<User>()
                .HasIndex(u => u.Email)
                .IsUnique();

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

            // 1 usuário -> 1 loja, por enquanto
            modelBuilder.Entity<Store>()
                .HasIndex(s => s.UserId)
                .IsUnique();

            modelBuilder.Entity<Store>()
                .HasOne(s => s.User)
                .WithOne(u => u.Store)
                .HasForeignKey<Store>(s => s.UserId);
        }
    }
}