"use client";
import Link from "next/link";
import styles from "./Home.module.css";
import { useGuestOnly } from "@/lib/auth_context";


export default function Home() {

  const {loading:guestOnlyLoading} = useGuestOnly();
  
  if (guestOnlyLoading) return null;
  
  return (
    <div className="home">

      <header className={styles.navbar}>
        <div className={styles.logo}>
          <h2>Vitrio System</h2>
        </div>

        <nav className={styles.nav}>
          <Link href="/login" className={styles.btnLogin}>Login</Link>
          <Link href="/register" className={styles.btnRegister}>Criar Conta</Link>
        </nav>
      </header>

      <section className={styles.hero}>

        <div className={styles.heroText}>

          <h1>Crie e gerencie sua loja de forma simples.</h1>

          <p>
            Controle produtos, estoque, pedidos, clientes e vendas
            em um único lugar. Tudo em um sistema moderno,
            rápido e seguro.
          </p>

          <Link href="/register" className={styles.btnPrimary}>
            Começar Agora
          </Link>

        </div>

        <div className={styles.heroImage}>

          <img
            src="https://placehold.co/650x450"
            alt="Sistema"
          />

        </div>

      </section>

      <section className={styles.features}>

        <div className={styles.card}>
          <h3>📦 Produtos</h3>

          <p>
            Cadastre produtos com imagens,
            categorias e estoque.
          </p>

        </div>

        <div className={styles.card}>

          <h3>🧾 Pedidos</h3>

          <p>
            Controle pedidos e acompanhe
            todo o processo de venda.
          </p>

        </div>

        <div className={styles.card}>

          <h3>👥 Clientes</h3>

          <p>
            Gerencie seus clientes e acompanhe
            seu histórico de compras.
          </p>

        </div>

      </section>

      <footer className={styles.footer}>

        <div>

          <h3>Vitrio System</h3>

          <p>
            Plataforma completa para gestão
            de pequenas e médias empresas.
          </p>

        </div>

        <div>

          <h4>Links</h4>

          <p>Sobre</p>
          <p>Contato</p>
          <p>Suporte</p>

        </div>

        <div>

          <h4>Contato</h4>

          <p>contato@vitrio.com</p>
          <p>Brasil</p>

        </div>

      </footer>

    </div>
  );
}