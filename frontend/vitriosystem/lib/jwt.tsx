export interface JwtPayload {
  exp?: number;
  [key: string]: unknown;
}

// Decodifica só o payload (base64url) do JWT. Não valida assinatura no
// client — isso é papel do backend; aqui é só pra ler o "exp" e evitar
// uma chamada de rede desnecessária quando o token já está óbvio-vencido.
export function decodeToken(token: string): JwtPayload | null {
  try {
    const payload = token.split(".")[1];
    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    const json = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + c.charCodeAt(0).toString(16).padStart(2, "0"))
        .join("")
    );
    return JSON.parse(json);
  } catch {
    return null;
  }
}

export function isTokenExpired(token: string): boolean {
  const payload = decodeToken(token);
  if (!payload?.exp) return true;
  return Date.now() >= payload.exp * 1000;
}