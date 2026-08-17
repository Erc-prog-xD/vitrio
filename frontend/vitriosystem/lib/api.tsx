const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5020";

export type ApiResponse<T> = {
  dados: T | null;
  mensagem: string | null;
  status: boolean;
};

export const ROLES = {
  CLIENT: "Client",
  ADMIN: "Admin",
  SHOPKEEPER: "Shopkeeper",
} as const;

export const SHOPKEEPER_ROLE = 2 as const;
export type Role = typeof SHOPKEEPER_ROLE;

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  role: Role;
  phone?: string;
  cpf: string;
}

export interface LoginPayload {
  cpf: string;
  password: string;
}

export interface updateProfilePayload {
  name: string;
  email: string;
  phone: string;
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

// ===== Access Token em memória (nunca em localStorage/cookie legível por JS) =====
// Perdido a cada reload — é esperado. O AuthProvider recupera um novo
// automaticamente no boot da aplicação usando o refresh token (cookie HttpOnly).

let accessToken: string | null = null;

export function setAccessToken(token: string | null) {
  accessToken = token;
}

export function getAccessToken(): string | null {
  return accessToken;
}

// ===== Requisição base =====

let refreshPromise: Promise<boolean> | null = null;

async function parseResponse<T>(res: Response): Promise<ApiResponse<T>> {
  const rawText = await res.text();

  if (!rawText) {
    return { dados: null, mensagem: res.ok ? null : "Erro ao processar a solicitação.", status: res.ok };
  }

  try {
    return JSON.parse(rawText);
  } catch {
    return { dados: null, mensagem: "Resposta inválida do servidor.", status: false };
  }
}

// Chama /api/Auth/refresh usando o cookie HttpOnly. Deduplica chamadas
// concorrentes (se 3 requisições tomarem 401 ao mesmo tempo, só dispara 1 refresh).
async function tryRefreshAccessToken(): Promise<boolean> {
  if (!refreshPromise) {
    refreshPromise = (async () => {
      try {
        const res = await fetch(`${API_URL}/api/Auth/refresh`, {
          method: "POST",
          credentials: "include",
        });

        const data = await parseResponse<string>(res);

        if (res.ok && data.status && data.dados) {
          setAccessToken(data.dados);
          return true;
        }

        setAccessToken(null);
        return false;
      } catch {
        setAccessToken(null);
        return false;
      } finally {
        refreshPromise = null;
      }
    })();
  }

  return refreshPromise;
}

export async function request<T>(
  path: string,
  method: "GET" | "POST" | "PUT" | "DELETE",
  body?: unknown,
  auth = false,
  isRetry = false
): Promise<ApiResponse<T>> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };

  if (auth && accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }

  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers,
    credentials: "include", // sempre manda o cookie do refresh token, mesmo em rotas sem "auth"
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  // Access token expirou no meio da sessão: tenta renovar 1 vez e refaz a chamada original.
  if (res.status === 401 && auth && !isRetry) {
    const refreshed = await tryRefreshAccessToken();

    if (refreshed) {
      return request<T>(path, method, body, auth, true);
    }

    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("auth:unauthorized"));
    }
  }

  const data = await parseResponse<T>(res);

  if (!res.ok) {
    throw new Error(data.mensagem ?? "Erro ao processar a solicitação.");
  }

  return data;
}

// ===== Auth =====

export function register(payload: RegisterPayload) {
  return request<string>("/api/Auth/register", "POST", payload);
}

export async function login(payload: LoginPayload) {
  const response = await request<string>("/api/Auth/login", "POST", payload);

  if (response.status && response.dados) {
    setAccessToken(response.dados);
  }

  return response;
}

export async function logout() {
  try {
    await request<string>("/api/Auth/logout", "POST", undefined, false);
  } finally {
    setAccessToken(null);
  }
}

// Chamado no boot do app: tenta recuperar um access token a partir do
// refresh token guardado no cookie HttpOnly. Retorna se conseguiu ou não.
export async function bootstrapSession(): Promise<boolean> {
  return tryRefreshAccessToken();
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

export function updateMyProfile(payload: updateProfilePayload) {
  return request<string>("/api/User/update-profile", "PUT", payload, true);
}