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
    }
}