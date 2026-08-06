"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./SidebarInitialPage.module.css";
import {
    LayoutDashboard,
    User,
    Store,
    Globe,
    CreditCard,
    Settings,
    CircleHelp,
    LogOut,
    type LucideIcon,
} from "lucide-react";
import { useAuth } from "@/lib/auth_context";

interface NavItem {
    label: string;
    href: string;
    icon: LucideIcon;
}

const NAV_ITEMS: NavItem[] = [
    {
        label: "Dashboard",
        href: "/menu/initialpage",
        icon: LayoutDashboard,
    },
    {
        label: "Minha Conta",
        href: "/menu/myaccount",
        icon: User,
    },
    {
        label: "Lojas",
        href: "/menu/stores",
        icon: Store,
    },
    {
        label: "Domínios",
        href: "/menu/domains",
        icon: Globe,
    },
    {
        label: "Assinatura",
        href: "/menu/subscription",
        icon: CreditCard,
    },
    {
        label: "Configurações",
        href: "/menu/settings",
        icon: Settings,
    },
    {
        label: "Suporte",
        href: "/menu/support",
        icon: CircleHelp,
    },
];

export default function SidebarInitialPage() {
    const pathname = usePathname();
    const { logout } = useAuth();

    return (
        <aside className={styles.sidebar}>
            <div className={styles.logo}>
                <span>VITRIO</span>
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

            <button className={styles.logoutButton} onClick={logout}>
                <LogOut size={18} />
                <span>Sair</span>
            </button>
        </aside>
    );
}