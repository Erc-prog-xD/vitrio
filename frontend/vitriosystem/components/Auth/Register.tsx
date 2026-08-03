"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { register, saveToken, SHOPKEEPER_ROLE } from "@/lib/api";
import { formatCpf, formatCnpj, isValidCpf, isValidCnpj, formatPhone, isValidPhone } from "@/lib/validators";
import "./Auth.css";

export default function Register() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [storeName, setStoreName] = useState("");
  const [cpf, setCpf] = useState("");
  const [cnpj, setCnpj] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!cpf.trim() && !cnpj.trim()) {
      setError("Informe o CPF ou o CNPJ da loja.");
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

    if (cnpj.trim() && !isValidCnpj(cnpj)) {
      setError("CNPJ inválido. Confira os números digitados.");
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
        storeName,
        cpf: cpf.trim() || undefined,
        cnpj: cnpj.trim() || undefined,
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

        <h1>Criar sua loja</h1>
        <p className="auth-subtitle">
          Cadastre sua loja para começar a vender no Vitrio System.
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

          <label htmlFor="storeName">Nome da loja</label>
          <input
            id="storeName"
            value={storeName}
            onChange={(e) => setStoreName(e.target.value)}
            required
          />

          <label htmlFor="cpf">CPF (obrigatório se não tiver CNPJ)</label>
          <input
            id="cpf"
            value={cpf}
            onChange={(e) => setCpf(formatCpf(e.target.value))}
            placeholder="123.456.789-00"
            inputMode="numeric"
            maxLength={14}
          />

          <label htmlFor="cnpj">CNPJ (obrigatório se não tiver CPF)</label>
          <input
            id="cnpj"
            value={cnpj}
            onChange={(e) => setCnpj(formatCnpj(e.target.value))}
            placeholder="12.345.678/0001-90"
            inputMode="numeric"
            maxLength={18}
          />

          {error && <p className="auth-error">{error}</p>}

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? "Criando..." : "Criar loja"}
          </button>
        </form>

        <p className="auth-switch">
          Já tem uma conta? <Link href="/login">Entrar</Link>
        </p>
      </div>
    </div>
  );
}