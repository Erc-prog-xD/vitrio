"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { getToken, logout as clearToken, getMe, type User } from "./api";
import { isTokenExpired } from "./jwt";

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  logout: () => void;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const logout = useCallback(() => {
    clearToken();
    setUser(null);
    router.push("/login");
  }, [router]);

  const refresh = useCallback(async () => {
    const token = getToken();

    // Sem token, ou token obviamente vencido: nem chama o backend.
    if (!token || isTokenExpired(token)) {
      clearToken();
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      // Busca do banco (não só decodifica o token) pra pegar dado
      // atualizado e confirmar que o token ainda é aceito pelo backend
      // (ex: usuário foi desativado, chave JWT mudou, etc).
      const { dados } = await getMe();
      setUser(dados);
    } catch {
      clearToken();
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  // Qualquer chamada autenticada que tomar 401 (token expirou no meio da
  // sessão, por exemplo) dispara esse evento globalmente — não só o /me.
  useEffect(() => {
    function handleUnauthorized() {
      clearToken();
      setUser(null);
      router.push("/login");
    }

    window.addEventListener("auth:unauthorized", handleUnauthorized);
    return () => window.removeEventListener("auth:unauthorized", handleUnauthorized);
  }, [router]);

  return (
    <AuthContext.Provider value={{ user, loading, logout, refresh }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth precisa ser usado dentro de <AuthProvider>");
  return ctx;
}

// Hook pra páginas protegidas (dashboard, etc): redireciona pro /login se
// não tiver usuário logado, depois que o carregamento inicial terminar.
export function useRequireAuth() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [loading, user, router]);

  return { user, loading };
}

export function useGuestOnly() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.replace("/initialpage");
    }
  }, [loading, user, router]);

  return { loading };
}