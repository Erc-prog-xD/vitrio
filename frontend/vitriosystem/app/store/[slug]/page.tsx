"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth_context";
import { ROLES } from "@/lib/api";
import styles from "./SlugPage.module.css";

export default function GerenciarLojaPage() {
  const { slug } = useParams<{ slug: string }>();
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    // Não logado: manda pro login. Depois do login, o ideal é o fluxo
    // devolver o usuário pra essa mesma URL (/store/[slug]) pra cair
    // aqui de novo e ser roteado certo.
    if (!user) {
      router.replace("/auth/login");
      return;
    }

    const destination =
      user.role === ROLES.SHOPKEEPER || user.role === ROLES.ADMIN
        ? `/store/${slug}/shopkeeper`
        : `/store/${slug}/client`;

    router.replace(destination);
  }, [loading, user, slug, router]);

  // Enquanto decide/redireciona, evita flash de tela vazia.
  return (
    <div className={styles.page}>
      <div className={styles.loading}>
        Carregando...
      </div>
    </div>
  );
}