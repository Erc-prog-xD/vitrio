"use client";

import { useState, FormEvent } from "react";
import { X, Store as StoreIcon } from "lucide-react";
import { createStore, type Store, type CreateStorePayload } from "@/lib/api";
import { formatCnpj, isValidCnpj } from "@/lib/validators";
import styles from "./CreateStoreModal.module.css";

interface CreateStoreModalProps {
  onClose: () => void;
  onCreated: (store: Store) => void;
}

const DEFAULT_PRIMARY = "#2563eb";
const DEFAULT_SECONDARY = "#1d4ed8";
const DEFAULT_TERTIARY = "#eff6ff";

export default function CreateStoreModal({ onClose, onCreated }: CreateStoreModalProps) {
  const [name, setName] = useState("");
  const [cnpj, setCnpj] = useState("");
  const [description, setDescription] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [primaryColor, setPrimaryColor] = useState(DEFAULT_PRIMARY);
  const [secondaryColor, setSecondaryColor] = useState(DEFAULT_SECONDARY);
  const [tertiaryColor, setTertiaryColor] = useState(DEFAULT_TERTIARY);

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("Informe o nome da loja.");
      return;
    }

    // CNPJ é opcional (MEI pode usar só o CPF do dono), mas se preenchido
    // precisa ser válido.
    if (cnpj.trim() && !isValidCnpj(cnpj)) {
      setError("CNPJ inválido. Confira os números digitados.");
      return;
    }

    setLoading(true);

    try {
      const payload: CreateStorePayload = {
        name: name.trim(),
        cnpj: cnpj.trim() || undefined,
        description: description.trim() || undefined,
        logoUrl: logoUrl.trim() || undefined,
        primaryColor,
        secondaryColor,
        tertiaryColor,
      };

      const { dados } = await createStore(payload);

      if (dados) {
        onCreated(dados);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao criar loja.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <div className={styles.modalTitle}>
            <div className={styles.modalIcon}>
              <StoreIcon size={20} />
            </div>
            <h2>Nova Loja</h2>
          </div>

          <button type="button" className={styles.closeButton} onClick={onClose} aria-label="Fechar">
            <X size={20} />
          </button>
        </div>

        <p className={styles.modalSubtitle}>
          Preencha os dados abaixo para criar sua loja. Você pode ajustar tudo isso depois.
        </p>

        <form onSubmit={handleSubmit} className={styles.modalForm} noValidate>
          <label htmlFor="storeName">Nome da loja *</label>
          <input
            id="storeName"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex: Loja da Maria"
            required
          />

          <label htmlFor="storeCnpj">CNPJ (opcional)</label>
          <input
            id="storeCnpj"
            value={cnpj}
            onChange={(e) => setCnpj(formatCnpj(e.target.value))}
            placeholder="00.000.000/0000-00"
            inputMode="numeric"
            maxLength={18}
          />

          <label htmlFor="storeDescription">Descrição</label>
          <textarea
            id="storeDescription"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Conte um pouco sobre sua loja"
            rows={3}
          />

          <label htmlFor="storeLogo">URL do logo</label>
          <input
            id="storeLogo"
            value={logoUrl}
            onChange={(e) => setLogoUrl(e.target.value)}
            placeholder="https://..."
          />

          <div className={styles.colorRow}>
            <div className={styles.colorField}>
              <label htmlFor="primaryColor">Cor primária</label>
              <input
                id="primaryColor"
                type="color"
                value={primaryColor}
                onChange={(e) => setPrimaryColor(e.target.value)}
              />
            </div>

            <div className={styles.colorField}>
              <label htmlFor="secondaryColor">Cor secundária</label>
              <input
                id="secondaryColor"
                type="color"
                value={secondaryColor}
                onChange={(e) => setSecondaryColor(e.target.value)}
              />
            </div>

            <div className={styles.colorField}>
              <label htmlFor="tertiaryColor">Cor terciária</label>
              <input
                id="tertiaryColor"
                type="color"
                value={tertiaryColor}
                onChange={(e) => setTertiaryColor(e.target.value)}
              />
            </div>
          </div>

          {error && <p className={styles.modalError}>{error}</p>}

          <div className={styles.modalActions}>
            <button type="button" className={styles.cancelButton} onClick={onClose} disabled={loading}>
              Cancelar
            </button>

            <button type="submit" className={styles.submitButton} disabled={loading}>
              {loading ? "Criando..." : "Criar loja"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}