const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5020";

export type ApiResponse<T> = {
  dados: T | null;
  mensagem: string | null;
  status: boolean;
};

// Este formulário público só cria contas de Lojista (Shopkeeper = 2).
// Contas de Cliente (Client = 0) são criadas depois, dentro do sistema da loja,
// usando a mesma tabela User. Admin (1) não é auto-registrável.
export const SHOPKEEPER_ROLE = 2 as const;
export type Role = typeof SHOPKEEPER_ROLE;

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  role: Role;
  storeName?: string;
  phone?: string;
  cpf?: string;
  cnpj?: string;
}

export interface LoginPayload {
  document: string; // CPF ou CNPJ
  password: string;
}

export interface AuthResponse {
  token: string;
  expiresAt: string;
}

async function request<T>(path: string, body: unknown): Promise<ApiResponse<T>> {
  const res = await fetch(`${API_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const data: ApiResponse<T> = await res.json();

  if (!res.ok) {
    throw new Error(data.mensagem ?? "Erro ao processar a solicitação.");
  }

  return data;
}

export function register(payload: RegisterPayload) {
  return request<AuthResponse>("/api/Auth/register", payload);
}

export function login(payload: LoginPayload) {
  return request<AuthResponse>("/api/Auth/login", payload);
}

const TOKEN_KEY = "vitrio_token";

export function saveToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function logout() {
  localStorage.removeItem(TOKEN_KEY);
}