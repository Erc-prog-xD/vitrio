"use client";

import "./SidebarInitialPage.css";
import {
    LayoutDashboard,
    User,
    Store,
    Globe,
    CreditCard,
    Settings,
    CircleHelp,
    LogOut
} from "lucide-react";
import { useAuth } from "@/lib/auth_context";

export default function SidebarInitialPage() {
    const { logout } = useAuth();

    return (
            <aside className="sidebar">

                <div className="logo">
                    <span>VITRIO</span>
                </div>

                <nav>

                    <a className="active">
                        <LayoutDashboard size={20} />
                        Dashboard
                    </a>

                    <a>
                        <User size={20} />
                        Minha Conta
                    </a>

                    <a>
                        <Store size={20} />
                        Lojas
                    </a>

                    <a>
                        <Globe size={20} />
                        Domínios
                    </a>

                    <a>
                        <CreditCard size={20} />
                        Assinatura
                    </a>

                    <a>
                        <Settings size={20} />
                        Configurações
                    </a>

                    <a>
                        <CircleHelp size={20} />
                        Suporte
                    </a>

                </nav>

                <button className="logoutButton" onClick={logout}>
                    <LogOut size={18} />
                    <span>Sair</span>
                </button>

            </aside>
    );
}