"use client";

import { useState, FormEvent, useEffect } from "react";
import { X, Package, Trash2 } from "lucide-react";
import { createProduct, type Product, type CreateProductPayload } from "@/lib/api_product";
import {getCategoriesByStore , type Category} from "@/lib/api_category"
import { uploadImage } from "@/app/api/upload/upload";
import styles from "./CreateProductModal.module.css";

interface CreateProductModalProps {
  storeId: number;
  onClose: () => void;
  onCreated: (product: Product) => void;
}

interface PendingImage {
  url: string;
  uploading: boolean;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

export default function CreateProductModal({ storeId, onClose, onCreated }: CreateProductModalProps) {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [description, setDescription] = useState("");
  const [sku, setSku] = useState("");
  const [price, setPrice] = useState("");
  const [promotionalPrice, setPromotionalPrice] = useState("");
  const [stockQuantity, setStockQuantity] = useState("0");
  const [isActive, setIsActive] = useState(true);
  const [isFeatured, setIsFeatured] = useState(false);
  const [images, setImages] = useState<PendingImage[]>([]);

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryId, setCategoryId] = useState<string>("");

  
    useEffect(() => {
        let active = true;

        async function loadCategories() {
            try {
            const { dados } = await getCategoriesByStore(storeId);
            if (active) setCategories(dados ?? []);
            } catch {
            if (active) setCategories([]);
            }
        }

        loadCategories();
        return () => {
            active = false;
        };
    }, [storeId]);

  function handleNameChange(value: string) {
    setName(value);
    if (!slugTouched) setSlug(slugify(value));
  }

  async function handleImagesSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;

    const startIndex = images.length;
    setImages((prev) => [...prev, ...files.map(() => ({ url: "", uploading: true }))]);

    for (let i = 0; i < files.length; i++) {
      try {
        const url = await uploadImage(files[i]);
        setImages((prev) => {
          const next = [...prev];
          next[startIndex + i] = { url, uploading: false };
          return next;
        });
      } catch {
        setImages((prev) => prev.filter((_, idx) => idx !== startIndex + i));
        setError("Falha ao enviar uma das imagens.");
      }
    }

    e.target.value = "";
  }

  function removeImage(index: number) {
    setImages((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("Informe o nome do produto.");
      return;
    }

    const priceValue = Number(price.replace(",", "."));
    if (!price || Number.isNaN(priceValue) || priceValue <= 0) {
      setError("Informe um preço válido.");
      return;
    }

    const promoValue = promotionalPrice ? Number(promotionalPrice.replace(",", ".")) : undefined;
    if (promoValue !== undefined && (Number.isNaN(promoValue) || promoValue >= priceValue)) {
      setError("O preço promocional precisa ser menor que o preço normal.");
      return;
    }

    if (images.some((img) => img.uploading)) {
      setError("Aguarde o envio das imagens terminar.");
      return;
    }

    setLoading(true);

    try {
        const payload: CreateProductPayload = {
        storeId,
        categoryId: categoryId ? Number(categoryId) : undefined,
        name: name.trim(),
        slug: slug.trim() || slugify(name),
        description: description.trim() || undefined,
        sku: sku.trim() || undefined,
        price: priceValue,
        promotionalPrice: promoValue,
        stockQuantity: Number(stockQuantity) || 0,
        isActive,
        isFeatured,
        images: images.map((img, index) => ({ url: img.url, order: index })),
        };

      const { dados } = await createProduct(payload);
      if (dados) onCreated(dados);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao criar produto.");
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
              <Package size={20} />
            </div>
            <h2>Novo Produto</h2>
          </div>
          <button type="button" className={styles.closeButton} onClick={onClose} aria-label="Fechar">
            <X size={20} />
          </button>
        </div>

        <p className={styles.modalSubtitle}>
          Preencha os dados do produto. Você pode ajustar tudo isso depois.
        </p>

        <form onSubmit={handleSubmit} className={styles.modalForm} noValidate>
          <label htmlFor="productName">Nome do produto *</label>
          <input
            id="productName"
            value={name}
            onChange={(e) => handleNameChange(e.target.value)}
            placeholder="Ex: Camiseta Básica"
            required
          />

          <label htmlFor="productSlug">Slug (URL)</label>
          <input
            id="productSlug"
            value={slug}
            onChange={(e) => {
              setSlugTouched(true);
              setSlug(slugify(e.target.value));
            }}
            placeholder="camiseta-basica"
          />

          <label htmlFor="productDescription">Descrição</label>
          <textarea
            id="productDescription"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Detalhes do produto"
            rows={3}
          />
          <label htmlFor="productCategory">Categoria</label>
            <select
            id="productCategory"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            >
            <option value="">Sem categoria</option>
            {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                {cat.name}
                </option>
            ))}
            </select>

          <div className={styles.row}>
            <div className={styles.field}>
              <label htmlFor="productSku">SKU</label>
              <input id="productSku" value={sku} onChange={(e) => setSku(e.target.value)} placeholder="Ex: CAM-001" />
            </div>
            <div className={styles.field}>
              <label htmlFor="productStock">Estoque</label>
              <input
                id="productStock"
                type="number"
                min={0}
                value={stockQuantity}
                onChange={(e) => setStockQuantity(e.target.value)}
              />
            </div>
          </div>

          <div className={styles.row}>
            <div className={styles.field}>
              <label htmlFor="productPrice">Preço (R$) *</label>
              <input
                id="productPrice"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="0,00"
                inputMode="decimal"
                required
              />
            </div>
            <div className={styles.field}>
              <label htmlFor="productPromoPrice">Preço promocional</label>
              <input
                id="productPromoPrice"
                value={promotionalPrice}
                onChange={(e) => setPromotionalPrice(e.target.value)}
                placeholder="0,00"
                inputMode="decimal"
              />
            </div>
          </div>

          <div className={styles.checkboxRow}>
            <label className={styles.checkboxLabel}>
              <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
              Ativo na vitrine
            </label>
            <label className={styles.checkboxLabel}>
              <input type="checkbox" checked={isFeatured} onChange={(e) => setIsFeatured(e.target.checked)} />
              Produto em destaque
            </label>
          </div>

          <label htmlFor="productImages">Imagens</label>
          <input id="productImages" type="file" accept="image/*" multiple onChange={handleImagesSelected} />

          {images.length > 0 && (
            <div className={styles.imageGrid}>
              {images.map((img, index) => (
                <div key={index} className={styles.imageThumb}>
                  {img.uploading ? (
                    <span className={styles.imageUploading}>Enviando...</span>
                  ) : (
                    <>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={img.url} alt={`Imagem ${index + 1}`} />
                      {index === 0 && <span className={styles.coverBadge}>Capa</span>}
                      <button
                        type="button"
                        className={styles.removeImageButton}
                        onClick={() => removeImage(index)}
                        aria-label="Remover imagem"
                      >
                        <Trash2 size={14} />
                      </button>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}

          {error && <p className={styles.modalError}>{error}</p>}

          <div className={styles.modalActions}>
            <button type="button" className={styles.cancelButton} onClick={onClose} disabled={loading}>
              Cancelar
            </button>
            <button type="submit" className={styles.submitButton} disabled={loading}>
              {loading ? "Criando..." : "Criar produto"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}