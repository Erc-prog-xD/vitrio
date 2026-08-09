"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Package, Info, Phone, type LucideIcon } from "lucide-react";
import styles from "./StoreSidebar.module.css";

interface StoreSidebarProps {
    slug: string;
    storeName: string;
}

interface NavItem {
    label: string;
    href: string;
    icon: LucideIcon;
}

export default function StoreSidebar({ slug, storeName }: StoreSidebarProps) {
    const pathname = usePathname();

    // Navegação básica da vitrine pública. As rotas de produtos/sobre/contato
    // ainda não existem — só a estrutura do componente foi pedida aqui.
    const NAV_ITEMS: NavItem[] = [
        { label: "Início", href: `/store/${slug}`, icon: Home },
        { label: "Produtos", href: `/store/${slug}/produtos`, icon: Package },
        { label: "Sobre", href: `/store/${slug}/sobre`, icon: Info },
        { label: "Contato", href: `/store/${slug}/contato`, icon: Phone },
    ];

    return (
        <aside className={styles.sidebar}>
            <div className={styles.storeName}>
                <span>{storeName}</span>
            </div>

            <nav className={styles.nav}>
                {NAV_ITEMS.map(({ label, href, icon: Icon }) => (
                    <Link
                        key={href}
                        href={href}
                        className={pathname === href ? styles.navActive : ""}
                    >
                        <Icon size={20} />
                        <span>{label}</span>
                    </Link>
                ))}
            </nav>
        </aside>
    );
}