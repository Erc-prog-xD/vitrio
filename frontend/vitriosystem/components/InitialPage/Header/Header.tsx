import "./Header.css";
import {
    Search,
    Bell,
} from "lucide-react";



export default function Header() {

    return (
                <header className="header">

                    <div className="searchBar">

                        <Search size={18} />

                        <input
                            placeholder="Pesquisar..."
                        />

                    </div>

                    <div className="headerRight">

                        <button className="notification">
                            <Bell size={18} />
                        </button>

                        <div className="profile">

                            <div className="avatar">
                                EA
                            </div>

                            <div>

                                <strong>Eric Albuquerque</strong>

                                <span>Lojista</span>

                            </div>

                        </div>

                    </div>

                </header>
    );
}