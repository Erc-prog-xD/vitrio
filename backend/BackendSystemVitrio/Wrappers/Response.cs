namespace BackendSystemVitrio.Wrappers
{
    public class Response<T>
    {
        public T? Dados { get; set; }
        public string? Mensagem { get; set; }
        public bool Status { get; set; } = true;

        public static Response<T> Ok(T dados, string? mensagem = null)
            => new() { Dados = dados, Mensagem = mensagem, Status = true };

        public static Response<T> Fail(string mensagem)
            => new() { Dados = default, Mensagem = mensagem, Status = false };
    }
}