// lib/api_cloudinary.ts
import { getAccessToken } from "../../../lib/api";

export async function uploadImage(file: File): Promise<string> {
  const token = getAccessToken();
  if (!token) throw new Error("Sessão expirada. Faça login novamente.");

  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch("/api/upload", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });

  const data = await res.json();

  if (!res.ok || !data.status) {
    throw new Error(data.mensagem ?? "Erro ao enviar a imagem.");
  }

  return data.dados as string;
}