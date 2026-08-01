// Middlewares/ExceptionHandlingMiddleware.cs
using System.Net;
using BackendSystemVitrio.Wrappers;

namespace BackendSystemVitrio.Middlewares
{
    public class ExceptionHandlingMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<ExceptionHandlingMiddleware> _logger;

        public ExceptionHandlingMiddleware(RequestDelegate next, ILogger<ExceptionHandlingMiddleware> logger)
        {
            _next = next;
            _logger = logger;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            try
            {
                await _next(context);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro não tratado");

                context.Response.ContentType = "application/json";
                context.Response.StatusCode = (int)HttpStatusCode.InternalServerError;

                var response = Response<string>.Fail("Ocorreu um erro interno. Tente novamente mais tarde.");
                await context.Response.WriteAsJsonAsync(response);
            }
        }
    }
}