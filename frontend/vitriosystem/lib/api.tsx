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
  phone?: string;
  cpf: string; // agora obrigatório: é a credencial de login
}

export interface LoginPayload {
  cpf: string; // login não aceita mais CNPJ, só CPF
  password: string;
}

export interface AuthResponse {
  token: string;
  expiresAt: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  cpf: string;
  role: string;
}

export interface Store {
  id: number;
  name: string;
  slug: string;
  cnpj: string | null;
  description: string | null;
  logoUrl: string | null;
  primaryColor: string;
  secondaryColor: string;
  tertiaryColor: string;
  isActive: boolean;
  creationDate: string;
}

export interface CreateStorePayload {
  name: string;
  cnpj?: string;
  description?: string;
  logoUrl?: string;
  primaryColor?: string;
  secondaryColor?: string;
  tertiaryColor?: string;
}

export interface UpdateStorePayload extends Partial<CreateStorePayload> {
  isActive?: boolean;
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

async function request<T>(
  path: string,
  method: "GET" | "POST" | "PUT" | "DELETE",
  body?: unknown,
  auth = false
): Promise<ApiResponse<T>> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };

  if (auth) {
    const token = getToken();
    if (!token) throw new Error("Sessão expirada. Faça login novamente.");
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  // 204 No Content ou corpo vazio não tem JSON pra parsear.
  const data: ApiResponse<T> =
    res.status === 204 ? { dados: null, mensagem: null, status: res.ok } : await res.json();

  if (res.status === 401 && auth && typeof window !== "undefined") {
    // Token expirou ou foi invalidado no meio da sessão (não só no load
    // inicial). O AuthProvider escuta esse evento e desloga automaticamente.
    window.dispatchEvent(new Event("auth:unauthorized"));
  }

  if (!res.ok) {
    throw new Error(data.mensagem ?? "Erro ao processar a solicitação.");
  }

  return data;
}

// ===== Auth =====

export function register(payload: RegisterPayload) {
  return request<AuthResponse>("/api/Auth/register", "POST", payload);
}

export function login(payload: LoginPayload) {
  return request<AuthResponse>("/api/Auth/login", "POST", payload);
}

// ===== Usuário logado (rota autenticada) =====

export function getMe() {
  return request<User>("/api/Auth/me", "GET", undefined, true);
}

// ===== Store (rotas autenticadas) =====

export function getMyStores() {
  return request<Store[]>("/api/Store", "GET", undefined, true);
}

export function getStoreById(id: number) {
  return request<Store>(`/api/Store/${id}`, "GET", undefined, true);
}

export function createStore(payload: CreateStorePayload) {
  return request<Store>("/api/Store", "POST", payload, true);
}

export function updateStore(id: number, payload: UpdateStorePayload) {
  return request<Store>(`/api/Store/${id}`, "PUT", payload, true);
}

export function deleteStore(id: number) {
  return request<string>(`/api/Store/${id}`, "DELETE", undefined, true);
}