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


export default function SidebarInitialPage() {
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

                <button className="logoutButton">
                    <LogOut size={18} />
                    Sair
                </button>

            </aside>
    );
}