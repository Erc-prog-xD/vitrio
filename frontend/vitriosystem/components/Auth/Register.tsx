"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { register, SHOPKEEPER_ROLE } from "@/lib/api";
import { formatCpf, isValidCpf, formatPhone, isValidPhone } from "@/lib/validators";
import styles from "./Auth.module.css";
import { useGuestOnly } from "@/lib/auth_context";

export default function Register() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [cpf, setCpf] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { loading: guestOnlyLoading } = useGuestOnly();

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
      const response = await register({
        name,
        email,
        password,
        role: SHOPKEEPER_ROLE,
        phone: phone || undefined,
        cpf: cpf.trim(), // já validado acima e agora é obrigatório na API
      });

      // Assim como no login, o backend responde 200 OK mesmo quando a
      // regra de negócio falha (CPF/e-mail já cadastrado, CPF inválido
      // na revalidação do servidor, etc) — quem indica isso é "status",
      // não o HTTP status. Sem essa checagem o erro passava batido.
      if (!response.status) {
        setError(response.mensagem ?? "Não foi possível criar a conta.");
        return;
      }

      // RegisterAsync não gera token — só cria o usuário. Por isso aqui
      // manda pro login em vez de já autenticar direto.
      router.push("/auth/login");
    } catch (err) {
      // Chega aqui só em falha de rede/servidor, não em regra de negócio
      // (essa já foi tratada acima).
      setError(err instanceof Error ? err.message : "Erro ao criar conta.");
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

        <h1>Criar sua Conta</h1>
        <p className={styles.authSubtitle}>
          Cadastre-se para começar a usar o Vitrio System.
        </p>

        <form onSubmit={handleSubmit} className={styles.authForm} noValidate>
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

          {error && <p className={styles.authError}>{error}</p>}

          <button type="submit" className={styles.btnPrimary} disabled={loading}>
            {loading ? "Criando..." : "Criar conta"}
          </button>
        </form>

        <p className={styles.authSwitch}>
          Já tem uma conta? <Link href="/auth/login">Entrar</Link>
        </p>
      </div>
    </div>
  );
}