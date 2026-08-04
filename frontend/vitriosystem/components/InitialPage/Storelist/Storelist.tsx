"use client";

import { useEffect, useState } from "react";
import "./Storelist.css";

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
        <div className="storesContainer">
            <div className="sectionTitle">
                <h2>Minhas Lojas</h2>

                <button onClick={() => setShowCreateModal(true)}>
                    <Plus size={18} />
                    Nova Loja
                </button>
            </div>

            {loading && <p className="text-muted">Carregando lojas...</p>}

            {!loading && error && <p className="auth-error">{error}</p>}

            {!loading && !error && stores.length === 0 && (
                <p className="text-muted">
                    Você ainda não tem nenhuma loja. Clique em &quot;Nova Loja&quot; para criar a primeira.
                </p>
            )}

            {!loading &&
                !error &&
                stores.map((store) => (
                    <div key={store.id} className="storeCard">
                        <div className="storeLeft">
                            <div className="storeIcon">
                                <StoreIcon size={24} />
                            </div>

                            <div>
                                <h3>{store.name}</h3>
                                <p>{store.slug}.vitrio.com</p>
                                <span className="status">
                                    ● {store.isActive ? "Ativa" : "Pausada"}
                                </span>
                            </div>
                        </div>

                        <button className="manageButton">
                            Gerenciar
                            <ChevronRight size={18} />
                        </button>
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