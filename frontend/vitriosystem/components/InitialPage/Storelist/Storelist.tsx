"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import styles from "./Storelist.module.css";

import { Plus, Store as StoreIcon, ChevronRight } from "lucide-react";
import { getMyStores, type Store } from "@/lib/api";
import CreateStoreModal from "./CreateStoreModal";

export default function Storelist() {
    const [stores, setStores] = useState<Store[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showCreateModal, setShowCreateModal] = useState(false);

    useEffect(() => {
        let cancelled = false;

        getMyStores()
            .then(({ dados }) => {
                if (!cancelled) setStores(dados ?? []);
            })
            .catch((err) => {
                if (!cancelled) {
                    setError(err instanceof Error ? err.message : "Erro ao carregar lojas.");
                }
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });

        return () => {
            cancelled = true;
        };
    }, []);

    function handleStoreCreated(store: Store) {
        // Insere a nova loja no topo da lista sem precisar refazer o fetch.
        setStores((prev) => [store, ...prev]);
        setShowCreateModal(false);
    }

    return (
        <div className={styles.storesContainer}>
            <div className={styles.sectionTitle}>
                <h2>Minhas Lojas</h2>

                <button onClick={() => setShowCreateModal(true)}>
                    <Plus size={18} />
                    Nova Loja
                </button>
            </div>

            {/* "text-muted" e "error-text" são utilitários globais (globals.css),
                por isso usam className como string simples, não styles.* */}
            {loading && <p className="text-muted">Carregando lojas...</p>}

            {!loading && error && <p className="error-text">{error}</p>}

            {!loading && !error && stores.length === 0 && (
                <p className="text-muted">
                    Você ainda não tem nenhuma loja. Clique em &quot;Nova Loja&quot; para criar a primeira.
                </p>
            )}

            {!loading &&
                !error &&
                stores.map((store) => (
                    <div key={store.id} className={styles.storeCard}>
                        <div className={styles.storeLeft}>
                            <div className={styles.storeIcon}>
                                <StoreIcon size={24} />
                            </div>

                            <div>
                                <h3>{store.name}</h3>
                                <p>{store.slug}.vitrio.com</p>
                                <span className={styles.status}>
                                    ● {store.isActive ? "Ativa" : "Pausada"}
                                </span>
                            </div>
                        </div>

                        <Link href={`/store/${store.slug}`} className={styles.manageButton}>
                            Gerenciar
                            <ChevronRight size={18} />
                        </Link>
                    </div>
                ))}

            {showCreateModal && (
                <CreateStoreModal
                    onClose={() => setShowCreateModal(false)}
                    onCreated={handleStoreCreated}
                />
            )}
        </div>
    );
}
