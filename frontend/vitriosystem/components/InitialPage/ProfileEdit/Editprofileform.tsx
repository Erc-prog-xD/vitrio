"use client";

import { useState, type FormEvent, type ChangeEvent, type HTMLAttributes } from "react";
import styles from "./Editprofileform.module.css";

import { User, Mail, Phone, Loader2, Check, AlertCircle, type LucideIcon } from "lucide-react";
import { updateMyProfile } from "@/lib/api";
import {formatPhone, isvalidEmail, isValidPhone } from "@/lib/validators";

export interface ProfileData {
    name: string;
    email: string;
    phone: string;
}

interface EditProfileFormProps {
    initialData?: ProfileData;
    onUpdated?: (data: ProfileData) => void;
}

type Status = "idle" | "loading" | "success" | "error";
type FieldErrors = Partial<Record<keyof ProfileData, string>>;


export default function EditProfileForm({
    initialData = { name: "", email: "", phone: "" },
    onUpdated,
}: EditProfileFormProps) {
    const [form, setForm] = useState<ProfileData>(initialData);
    const [errors, setErrors] = useState<FieldErrors>({});
    const [status, setStatus] = useState<Status>("idle");
    const [message, setMessage] = useState("");



    function validate() {
        const next: FieldErrors = {};
        if (form.email.trim() && !isvalidEmail(form.email.trim())) {
            next.email = "Informe um e-mail válido.";
        }
        if (form.phone.trim() && !isValidPhone(form.phone.trim())) {
            next.phone = "Informe um telefone válido. Ex: (00) 00000-0000.";
        }
        setErrors(next);
        return Object.keys(next).length === 0;
    }

    async function handleSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        if (!validate()) return;

        setStatus("loading");
        setMessage("");

        try {
            // Só manda o que foi preenchido; o backend ignora campos vazios/whitespace.
            const { mensagem } = await updateMyProfile({
                name: form.name.trim() || "",
                email: form.email.trim() || "",
                phone: form.phone.trim() || "",
            });

            setStatus("success");
            setMessage(mensagem ?? "Perfil atualizado com sucesso.");
            onUpdated?.(form);
        } catch (err) {
            setStatus("error");
            setMessage(err instanceof Error ? err.message : "Erro ao atualizar perfil.");
        }
    }

    const isLoading = status === "loading";

    return (
        <div className={styles.formContainer}>
            <div className={styles.sectionTitle}>
                <h2>Editar perfil</h2>
                <p>Atualize seus dados. Deixe em branco o que não quiser alterar.</p>
            </div>

            {status === "success" && (
                <div className={`${styles.message} ${styles.messageSuccess}`}>
                    <Check size={18} />
                    <span>{message}</span>
                </div>
            )}

            {status === "error" && (
                <div className={`${styles.message} ${styles.messageError}`}>
                    <AlertCircle size={18} />
                    <span>{message}</span>
                </div>
            )}

            <form onSubmit={handleSubmit}>
                <Field
                    id="name"
                    label="Nome"
                    icon={User}
                    value={form.name}
                    onChange={e => setForm((prev) => ({ ...prev, name: e.target.value }))}
                    placeholder="Seu nome completo"
                    error={errors.name}
                    disabled={isLoading}
                />

                <Field
                    id="email"
                    label="E-mail"
                    icon={Mail}
                    type="email"
                    value={form.email}
                    onChange={e => setForm((prev) => ({ ...prev, email: e.target.value }))}
                    placeholder="voce@exemplo.com"
                    error={errors.email}
                    disabled={isLoading}
                />

                <Field
                    id="phone"
                    label="Telefone"
                    icon={Phone}
                    type="tel"
                    inputMode="numeric"
                    maxLength={15}
                    value={form.phone}
                    onChange={e => setForm((prev) => ({ ...prev, phone: formatPhone(e.target.value) }))}
                    placeholder="(00) 00000-0000"
                    error={errors.phone}
                    disabled={isLoading}
                />

                <button type="submit" disabled={isLoading} className={styles.submitButton}>
                    {isLoading && <Loader2 size={18} className={styles.spinner} />}
                    {isLoading ? "Salvando..." : "Salvar alterações"}
                </button>
            </form>
        </div>
    );
}

interface FieldProps {
    id: string;
    label: string;
    icon: LucideIcon;
    value: string;
    onChange: (e: ChangeEvent<HTMLInputElement>) => void;
    placeholder: string;
    error?: string;
    disabled?: boolean;
    type?: string;
    inputMode?: HTMLAttributes<HTMLInputElement>["inputMode"];
    maxLength?: number;
}

function Field({
    id,
    label,
    icon: Icon,
    value,
    onChange,
    placeholder,
    error,
    disabled,
    type = "text",
    inputMode,
    maxLength,
}: FieldProps) {
    return (
        <div className={styles.field}>
            <label htmlFor={id}>{label}</label>
            <div className={styles.inputWrapper}>
                <Icon size={18} />
                <input
                    id={id}
                    type={type}
                    inputMode={inputMode}
                    maxLength={maxLength}
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    disabled={disabled}
                    className={error ? styles.inputError : undefined}
                />
            </div>
            {error && <p className={styles.errorText}>{error}</p>}
        </div>
    );
}