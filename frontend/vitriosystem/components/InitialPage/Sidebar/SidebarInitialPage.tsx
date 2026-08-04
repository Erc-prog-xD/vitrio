"use client";

import { useState } from "react";
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
    key: string;
    label: string;
    icon: LucideIcon;
}

// Sem rotas reais ainda — só controla qual item fica marcado como ativo.
// Quando as páginas existirem, dá pra trocar esse estado por usePathname()
// e cada item virar um <Link href="...">, aí o "ativo" passa a ser
// determinado pela URL atual em vez de clique.
const NAV_ITEMS: NavItem[] = [
    { key: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { key: "account", label: "Minha Conta", icon: User },
    { key: "stores", label: "Lojas", icon: Store },
    { key: "domains", label: "Domínios", icon: Globe },
    { key: "subscription", label: "Assinatura", icon: CreditCard },
    { key: "settings", label: "Configurações", icon: Settings },
    { key: "support", label: "Suporte", icon: CircleHelp },
];

export default function SidebarInitialPage() {
    const { logout } = useAuth();
    const [activeKey, setActiveKey] = useState<string>("dashboard");

    return (
        <aside className={styles.sidebar}>

            <div className={styles.logo}>
                <span>VITRIO</span>
            </div>

            <nav className={styles.nav}>
                {NAV_ITEMS.map(({ key, label, icon: Icon }) => (
                    <a
                        key={key}
                        className={key === activeKey ? styles.navActive : undefined}
                        onClick={() => setActiveKey(key)}
                    >
                        <Icon size={20} />
                        <span>{label}</span>
                    </a>
                ))}
            </nav>

            <button className={styles.logoutButton} onClick={logout}>
                <LogOut size={18} />
                <span>Sair</span>
            </button>

        </aside>
    );
}