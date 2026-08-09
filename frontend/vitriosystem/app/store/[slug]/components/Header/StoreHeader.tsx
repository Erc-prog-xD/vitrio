"use client";

import Link from "next/link";
import { Store as StoreIcon, LogIn, UserPlus } from "lucide-react";
import styles from "./StoreHeader.module.css";

interface StoreHeaderProps {
    slug: string;
    storeName: string;
    logoUrl?: string | null;
}

export default function StoreHeader({ slug, storeName, logoUrl }: StoreHeaderProps) {
    return (
        <header className={styles.header}>
            <Link href={`/store/${slug}`} className={styles.brand}>
                {logoUrl ? (
                    <img src={logoUrl} alt={storeName} className={styles.logoImg} />
                ) : (
                    <div className={styles.logoIcon}>
                        <StoreIcon size={22} />
                    </div>
                )}
            </Link>

            {/* Login/cadastro aqui são do CLIENTE da loja (Role.Client),
                diferente do login/cadastro do lojista em /auth/*. */}
            <nav className={styles.nav}>
                <Link href={`/store/${slug}/login`} className={styles.loginLink}>
                    <LogIn size={18} />
                    Entrar
                </Link>

                <Link href={`/store/${slug}/register`} className={styles.registerButton}>
                    <UserPlus size={18} />
                    Criar conta
                </Link>
            </nav>
        </header>
    );
}