"use client";

import styles from "./Initialpage.module.css";

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
            <div className={styles.dashboard}>
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
        <div className={styles.dashboard}>

            <SidebarInitialPage />

            {/* MAIN */}

            <main className={styles.content}>

                <Header />

                {/* BODY */}

                <section className={styles.body}>

                    <div className={styles.welcome}>

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