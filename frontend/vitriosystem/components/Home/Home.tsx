"use client";
import Link from "next/link";
import "./Home.css";
import { useGuestOnly } from "@/lib/auth_context";


export default function Home() {

  const {loading:guestOnlyLoading} = useGuestOnly();
  
  if (guestOnlyLoading) return null;
  
  return (
    <div className="home">

      <header className="navbar">
        <div className="logo">
          <h2>Vitrio System</h2>
        </div>

        <nav>
          <Link href="/login" className="btn-login">Login</Link>
          <Link href="/register" className="btn-register">Criar Conta</Link>
        </nav>
      </header>

      <section className="hero">

        <div className="hero-text">

          <h1>Crie e gerencie sua loja de forma simples.</h1>

          <p>
            Controle produtos, estoque, pedidos, clientes e vendas
            em um único lugar. Tudo em um sistema moderno,
            rápido e seguro.
          </p>

          <Link href="/register" className="btn-primary">
            Começar Agora
          </Link>

        </div>

        <div className="hero-image">

          <img
            src="https://placehold.co/650x450"
            alt="Sistema"
          />

        </div>

      </section>

      <section className="features">

        <div className="card">
          <h3>📦 Produtos</h3>

          <p>
            Cadastre produtos com imagens,
            categorias e estoque.
          </p>

        </div>

        <div className="card">

          <h3>🧾 Pedidos</h3>

          <p>
            Controle pedidos e acompanhe
            todo o processo de venda.
          </p>

        </div>

        <div className="card">

          <h3>👥 Clientes</h3>

          <p>
            Gerencie seus clientes e acompanhe
            seu histórico de compras.
          </p>

        </div>

      </section>

      <footer className="footer">

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