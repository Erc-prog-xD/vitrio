using Microsoft.EntityFrameworkCore;
using BackendSystemVitrio.Models;

namespace BackendSystemVitrio.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
        }
        public DbSet<User> User { get; set; }

         protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);
 
            modelBuilder.Entity<User>()
                .HasIndex(u => u.Email)
                .IsUnique();
 
            // Postgres permite múltiplos NULL em índice único, então Cpf/Cnpj
            // continuam opcionais sem conflitar entre si.
            modelBuilder.Entity<User>()
                .HasIndex(u => u.Cpf)
                .IsUnique();
 
            modelBuilder.Entity<User>()
                .HasIndex(u => u.Cnpj)
                .IsUnique();
        }
    }
}