using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BackendSystemVitrio.Migrations
{
    /// <inheritdoc />
    public partial class ajustes : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_User_Cnpj",
                table: "User");

            migrationBuilder.DropColumn(
                name: "Cnpj",
                table: "User");

            migrationBuilder.AddColumn<string>(
                name: "Cnpj",
                table: "Store",
                type: "text",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Store_Cnpj",
                table: "Store",
                column: "Cnpj",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Store_Cnpj",
                table: "Store");

            migrationBuilder.DropColumn(
                name: "Cnpj",
                table: "Store");

            migrationBuilder.AddColumn<string>(
                name: "Cnpj",
                table: "User",
                type: "text",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_User_Cnpj",
                table: "User",
                column: "Cnpj",
                unique: true);
        }
    }
}
