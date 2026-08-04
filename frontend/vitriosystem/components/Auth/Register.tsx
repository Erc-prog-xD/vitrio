"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { register, saveToken, SHOPKEEPER_ROLE } from "@/lib/api";
import { formatCpf, isValidCpf, formatPhone, isValidPhone } from "@/lib/validators";
import "./Auth.css";

export default function Register() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [cpf, setCpf] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!cpf.trim()) {
      setError("Informe o CPF");
      return;
    }

    if (phone.trim() && !isValidPhone(phone.trim())) {
      setError("Telefone inválido. Use o formato (00) 00000-0000.");
      return;
    }

    if (cpf.trim() && !isValidCpf(cpf)) {
      setError("CPF inválido. Confira os números digitados.");
      return;
    }


    setLoading(true);

    try {
      const { dados } = await register({
        name,
        email,
        password,
        role: SHOPKEEPER_ROLE,
        phone: phone || undefined,
        cpf: cpf.trim(), // já validado acima e agora é obrigatório na API
      });

      if (dados) {
        saveToken(dados.token);
        router.push("/");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao criar conta.");
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

        <h1>Criar sua Conta</h1>
        <p className="auth-subtitle">
          Cadastre-se para começar a usar o Vitrio System.
        </p>

        <form onSubmit={handleSubmit} className="auth-form" noValidate>
          <label htmlFor="name">Seu nome</label>
          <input id="name" value={name} onChange={(e) => setName(e.target.value)} required />

          <label htmlFor="email">E-mail</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <label htmlFor="password">Senha</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
          />

          <label htmlFor="phone">Telefone</label>
          <input
            id="phone"
            value={phone}
            onChange={(e) => setPhone(formatPhone(e.target.value))}
            placeholder="(00) 00000-0000"
            inputMode="numeric"
            maxLength={15}
          />

          <label htmlFor="cpf">CPF</label>
          <input
            id="cpf"
            value={cpf}
            onChange={(e) => setCpf(formatCpf(e.target.value))}
            placeholder="123.456.789-00"
            inputMode="numeric"
            maxLength={14}
          />

          {error && <p className="auth-error">{error}</p>}

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? "Criando..." : "Criar conta"}
          </button>
        </form>

        <p className="auth-switch">
          Já tem uma conta? <Link href="/login">Entrar</Link>
        </p>
      </div>
    </div>
  );
}