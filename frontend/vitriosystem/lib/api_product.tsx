// ===== Product =====

import { request } from "./api";

export interface ProductImage {
  id: number;
  url: string;
  order: number;
}

export interface Product {
  id: number;
  storeId: number;
  categoryId: number | null;
  name: string;
  slug: string;
  description: string | null;
  sku: string | null;
  price: number;
  promotionalPrice: number | null;
  stockQuantity: number;
  isActive: boolean;
  isFeatured: boolean;
  creationDate: string;
  images: ProductImage[];
}

export interface CreateProductPayload {
  storeId: number;
  categoryId?: number;
  name: string;
  slug?: string;
  description?: string;
  sku?: string;
  price: number;
  promotionalPrice?: number;
  stockQuantity?: number;
  isActive?: boolean;
  isFeatured?: boolean;
  images?: { url: string; order: number }[];
}

export function getProductsByStore(storeId: number) {
  return request<Product[]>(`/api/Product/${storeId}`, "GET", undefined, true);
}

export function createProduct(payload: CreateProductPayload) {
  return request<Product>("/api/Product", "POST", payload, true);
}