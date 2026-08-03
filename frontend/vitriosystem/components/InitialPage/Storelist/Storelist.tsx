
import "./Storelist.css";

import {
    Plus,
    Store,
    ChevronRight
} from "lucide-react";


const stores = [
    {
        id: 1,
        name: "Tech Store",
        domain: "techstore.vitrio.com",
        status: "Ativa",
    },
    {
        id: 2,
        name: "Gamer Store",
        domain: "gamerstore.vitrio.com",
        status: "Ativa",
    },
];

export default function Storelist() {
    return (


                    <div className="storesContainer">

                        <div className="sectionTitle">

                            <h2>
                                Minhas Lojas
                            </h2>

                            <button>

                                <Plus size={18} />

                                Nova Loja

                            </button>

                        </div>

                        {stores.map(store => (

                            <div
                                key={store.id}
                                className="storeCard"
                            >

                                <div className="storeLeft">

                                    <div className="storeIcon">

                                        <Store size={24} />

                                    </div>

                                    <div>

                                        <h3>
                                            {store.name}
                                        </h3>

                                        <p>
                                            {store.domain}
                                        </p>

                                        <span className="status">
                                            ● {store.status}
                                        </span>

                                    </div>

                                </div>

                                <button className="manageButton">

                                    Gerenciar

                                    <ChevronRight size={18} />

                                </button>

                            </div>

                        ))}

                    </div>

    );
}