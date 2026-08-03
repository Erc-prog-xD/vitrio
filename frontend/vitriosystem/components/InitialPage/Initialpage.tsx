import "./Initialpage.css";

import SidebarInitialPage from "./Sidebar/SidebarInitialPage";
import Header from "./Header/Header";
import Storelist from "./Storelist/Storelist";

export default function Initial() {
    return (
        <div className="dashboard">

            <SidebarInitialPage />

            {/* MAIN */}

            <main className="content">

                <Header />

                {/* BODY */}

                <section className="body">

                    <div className="welcome">

                        <h1>
                            Bem-vindo, Eric 👋
                        </h1>

                        <p>
                            Gerencie sua conta e todas as suas lojas em um único lugar.
                        </p>

                    </div>

                    <Storelist />


                </section>

            </main>

        </div>
    );
}
