using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using Microsoft.EntityFrameworkCore;
using Microsoft.OpenApi;
using System.Text;
using BackendSystemVitrio.Services.AuthService;
using BackendSystemVitrio.Services.StoreService; 
using BackendSystemVitrio.Services.UserService;
using BackendSystemVitrio.Services.CategoryService;
using BackendSystemVitrio.Data;
using BackendSystemVitrio.Middlewares;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "BackendSystemVitrio API",
        Version = "v1",
        Description = "API do sistema Vitrio"
    });

    // Sem isso o Swagger UI não mostra o botão "Authorize": ele não sabe
    // que a API usa Bearer token, então não tem como anexar o JWT nas
    // chamadas de rotas com [Authorize] (ex: StoreController).
    var bearerScheme = new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        Scheme = "Bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Description = "Cole aqui o token retornado pelo login/registro. Não precisa digitar \"Bearer \" antes, o Swagger adiciona sozinho."
    };

    options.AddSecurityDefinition("Bearer", bearerScheme);

    // Padrão do Swashbuckle 10 / Microsoft.OpenApi v2: a referência ao
    // esquema precisa do próprio "document" (parâmetro da lambda), não
    // só do Id como string solta.
    options.AddSecurityRequirement(document => new OpenApiSecurityRequirement
    {
        [new OpenApiSecuritySchemeReference("Bearer", document)] = []
    });
});

// Registrar o AuthService e IStoreService
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IStoreService, StoreService>();
builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddScoped<ICategoryService, CategoryService>();

// Configurar autenticação JWT
builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = builder.Configuration["Jwt:Issuer"],
        ValidAudience = builder.Configuration["Jwt:Audience"],
        IssuerSigningKey = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"]!))
    };
});

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

// Configurar CORS para o frontend
const string CorsPolicy = "FrontendPolicy";

builder.Services.AddCors(options =>
{
    options.AddPolicy(CorsPolicy, policy =>
    {
        policy.WithOrigins("http://localhost:3000")
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

builder.Services.AddAuthorization();

var app = builder.Build();

app.UseMiddleware<ExceptionHandlingMiddleware>();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseCors(CorsPolicy); // precisa vir ANTES de UseAuthentication/UseAuthorization

app.UseAuthentication(); // precisa vir ANTES de UseAuthorization
app.UseAuthorization();

app.MapControllers();

app.Run();