// ===== Category =====

import { request } from "./api";

export interface Category {
  id: number;
  storeId: number;
  name: string;
  slug: string;
  parentCategoryId: number | null;
  isActive: boolean;
}

export interface CreateCategoryPayload {
  storeId: number;
  name: string;
  slug?: string;
  parentCategoryId?: number;
}

export function getCategoriesByStore(storeId: number) {
  return request<Category[]>(`/api/Category/${storeId}`, "GET", undefined, true);
}

export function createCategory(payload: CreateCategoryPayload) {
  return request<string>("/api/Category", "POST", payload, true);
}