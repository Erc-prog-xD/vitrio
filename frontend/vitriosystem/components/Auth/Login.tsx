"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { login, saveToken } from "@/lib/api";
import { formatCpf, isValidCpf } from "@/lib/validators";
import "./Auth.css";

export default function Login() {
  const router = useRouter();

  const [cpf, setCpf] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    // Login agora é só por CPF (CNPJ é dado da loja, não credencial de acesso).
    if (!isValidCpf(cpf)) {
      setError("Informe um CPF válido.");
      return;
    }

    setLoading(true);

    try {
      const { dados } = await login({ cpf, password });
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
          <label htmlFor="cpf">CPF</label>
          <input
            id="cpf"
            type="text"
            inputMode="numeric"
            placeholder="000.000.000-00"
            value={cpf}
            onChange={(e) => setCpf(formatCpf(e.target.value))}
            maxLength={14}
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