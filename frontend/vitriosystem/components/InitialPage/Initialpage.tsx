"use client";

import "./Initialpage.css";

import SidebarInitialPage from "./Sidebar/SidebarInitialPage";
import Header from "./Header/Header";
import Storelist from "./Storelist/Storelist";
import { useRequireAuth } from "@/lib/auth_context";

export default function Initial() {
    const { user, loading } = useRequireAuth();

    // Enquanto verifica o token / busca o usuário, evita "piscar" a
    // dashboard antes de saber se a pessoa está mesmo logada.
    if (loading) {
        return (
            <div className="dashboard">
                <p style={{ padding: 40 }}>Carregando...</p>
            </div>
        );
    }

    // useRequireAuth já disparou o redirect pro /login; não renderiza nada
    // nesse frame pra não mostrar a dashboard vazia por um instante.
    if (!user) {
        return null;
    }

    const firstName = user.name.split(" ")[0];

    return (
        <div className="dashboard">

            <SidebarInitialPage />

            {/* MAIN */}

            <main className="content">

                <Header />

                {/* BODY */}

                <section className="body">

                    <div className="welcome">

                        <h1>
                            Bem-vindo, {firstName} 👋
                        </h1>

                        <p>
                            Gerencie sua conta e todas as suas lojas em um único lugar.
                        </p>

                    </div>

                    <Storelist />


                </section>

            </main>

        </div>
    );
}