"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { login, saveToken } from "@/lib/api";
import { formatDocument, isValidCpf, isValidCnpj } from "@/lib/validators";
import "./Auth.css";

export default function Login() {
  const router = useRouter();

  const [document, setDocument] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    const digits = document.replace(/\D/g, "");
    const isValidDocument =
      digits.length === 11 ? isValidCpf(document) : isValidCnpj(document);

    if (!isValidDocument) {
      setError("Informe um CPF ou CNPJ válido.");
      return;
    }

    setLoading(true);

    try {
      const { dados } = await login({ document, password });
      if (dados) {
        saveToken(dados.token);
        router.push("/");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao entrar.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <Link href="/" className="auth-logo">
          <h2>Vitrio System</h2>
        </Link>

        <h1>Entrar</h1>
        <p className="auth-subtitle">Acesse sua conta para continuar.</p>

        <form onSubmit={handleSubmit} className="auth-form" noValidate>
          <label htmlFor="document">CPF ou CNPJ</label>
          <input
            id="document"
            type="text"
            inputMode="numeric"
            placeholder="000.000.000-00"
            value={document}
            onChange={(e) => setDocument(formatDocument(e.target.value))}
            maxLength={18}
            required
          />

          <label htmlFor="password">Senha</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {error && <p className="auth-error">{error}</p>}

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>

        <p className="auth-switch">
          Não tem uma conta? <Link href="/register">Criar conta</Link>
        </p>
      </div>
    </div>
  );
}