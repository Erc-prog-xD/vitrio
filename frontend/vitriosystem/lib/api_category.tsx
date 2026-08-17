// ===== Category =====
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5020";

import { ApiResponse, getToken } from "./api";

export interface Category {
  id: number;
  storeId: number;
  name: string;
  slug: string;
  parentCategoryId: number | null;
  isActive: boolean;
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
    res.status === 204 ? { dados: null, mensagem: null, status: res.ok } : await  res.json();

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

export function getCategoriesByStore(storeId: number) {
  return request<Category[]>(`/api/Category/${storeId}`, "GET", undefined, true);
}