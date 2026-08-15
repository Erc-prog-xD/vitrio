"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Store as StoreIcon, Pencil } from "lucide-react";
import { getMyStores, type Store } from "@/lib/api";
import styles from "./SlugPage.module.css";

export default function GerenciarLojaPage() {
    const { slug } = useParams<{ slug: string }>();
    const router = useRouter();

    const [store, setStore] = useState<Store | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;

        // TODO: quando existir um endpoint dedicado (ex: getStoreBySlug),
        // trocar essa busca por uma chamada direta em vez de filtrar a
        // lista inteira de lojas do usuário.
        getMyStores()
            .then(({ dados }) => {
                if (cancelled) return;

                const found = (dados ?? []).find((s) => s.slug === slug);

                if (!found) {
                    setError("Loja não encontrada.");
                } else {
                    setStore(found);
                }
            })
            .catch((err) => {
                if (!cancelled) {
                    setError(err instanceof Error ? err.message : "Erro ao carregar loja.");
                }
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });

        return () => {
            cancelled = true;
        };
    }, [slug]);

    if (loading) {
        return <p className="text-muted">Carregando loja...</p>;
    }

    if (error || !store) {
        return (
            <div>
                <button className={styles.backButton} onClick={() => router.push("/dashboard/initialpage")}>
                    <ArrowLeft size={18} />
                    Voltar
                </button>
                <p className="error-text">{error ?? "Loja não encontrada."}</p>
            </div>
        );
    }

    return (
        <div className={styles.page}>
            <div className={styles.header}>
                <div className={styles.headerLeft}>
                    <div
                        className={styles.storeIcon}
                        style={{color: "#2563eb" }}
                    >
                        <StoreIcon size={32} />
                    </div>

                    <div>
                        <h1>{store.name}</h1>
                    </div>
                </div>
            </div>

            <div className={styles.card}>
                <div className={styles.cardHeader}>
                    <h2>Informações da loja</h2>

                    <button
                        className={styles.editButton}
                        onClick={() => alert("Edição ainda não conectada — falta o endpoint de atualização da loja.")}
                    >
                        <Pencil size={16} />
                        Editar
                    </button>
                </div>

                <dl className={styles.infoGrid}>
                    <div>
                        <dt>Nome</dt>
                        <dd>{store.name}</dd>
                    </div>

                    <div>
                        <dt>CNPJ</dt>
                        <dd>{store.cnpj || "—"}</dd>
                    </div>

                    <div>
                        <dt>Descrição</dt>
                        <dd>{store.description || "—"}</dd>
                    </div>

                    <div>
                        <dt>URL do logo</dt>
                        <dd>{store.logoUrl || "—"}</dd>
                    </div>
                </dl>
            </div>

            <div className={styles.card}>
                <div className={styles.cardHeader}>
                    <h2>Cores da loja</h2>
                </div>

                <div className={styles.colorGrid}>
                    <div className={styles.colorItem}>
                        <span className={styles.swatch} style={{ background: store.primaryColor }} />
                        <div>
                            <strong>Primária</strong>
                            <span>{store.primaryColor}</span>
                        </div>
                    </div>

                    <div className={styles.colorItem}>
                        <span className={styles.swatch} style={{ background: store.secondaryColor }} />
                        <div>
                            <strong>Secundária</strong>
                            <span>{store.secondaryColor}</span>
                        </div>
                    </div>

                    <div className={styles.colorItem}>
                        <span className={styles.swatch} style={{ background: store.tertiaryColor }} />
                        <div>
                            <strong>Terciária</strong>
                            <span>{store.tertiaryColor}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
