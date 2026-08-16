import { getToken } from "../../../lib/api";

// lib/api_cloudinary.ts
export async function uploadImage(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);

    const res = await fetch("/api/upload", {
    method: "POST",
    headers: { Authorization: `Bearer ${getToken()}` },
    body: formData,
    });

  const data = await res.json();

  if (!res.ok || !data.status) {
    throw new Error(data.mensagem ?? "Erro ao enviar a imagem.");
  }

  return data.dados as string;
}