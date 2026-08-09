namespace BackendSystemVitrio.DTO
{
    // Renomeado de "Document" para "Cpf": o login agora é exclusivamente por CPF
    // (CNPJ ficou só como dado da loja, não é mais credencial de acesso).
    public class LoginDto
    {
        public required string Cpf { get; set; }
        public required string Password { get; set; }
    }
}