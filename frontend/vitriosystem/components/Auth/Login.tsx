"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { login, saveToken } from "@/lib/api";
import { formatCpf, isValidCpf } from "@/lib/validators";
import { useAuth, useGuestOnly } from "@/lib/auth_context";
import styles from "./Auth.module.css";

export default function Login() {
  const router = useRouter();
  const { refresh } = useAuth();

  const [cpf, setCpf] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { loading: guestOnlyLoading } = useGuestOnly();

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
      const response = await login({ cpf, password });

      // O backend responde 200 OK mesmo em erro de negócio (senha errada,
      // CPF não encontrado, role sem permissão de acesso, etc) — quem
      // indica sucesso ou falha é o campo "status", não o HTTP status.
      // Por isso não dá pra confiar só em "dados" pra saber se deu certo.
      if (!response.status || !response.dados) {
        setError(response.mensagem ?? "Não foi possível entrar.");
        return;
      }

      saveToken(response.dados);
      await refresh();

      router.replace("/menu/initialpage");
    } catch (err) {
      // Chega aqui só em falha de rede/servidor (erro real de HTTP),
      // não em regra de negócio — essa já foi tratada acima.
      setError(err instanceof Error ? err.message : "Erro ao entrar.");
    } finally {
      setLoading(false);
    }
  }

  if (guestOnlyLoading) return null;

  return (
    <div className={styles.authPage}>
      <div className={styles.authCard}>
        <Link href="/" className={styles.authLogo}>
          <h2>Vitrio System</h2>
        </Link>

        <h1>Entrar</h1>
        <p className={styles.authSubtitle}>Acesse sua conta para continuar.</p>

        <form onSubmit={handleSubmit} className={styles.authForm} noValidate>
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

          {error && <p className={styles.authError}>{error}</p>}

          <button type="submit" className={styles.btnPrimary} disabled={loading}>
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>

        <p className={styles.authSwitch}>
          Não tem uma conta? <Link href="/auth/register">Criar conta</Link>
        </p>
      </div>
    </div>
  );
}