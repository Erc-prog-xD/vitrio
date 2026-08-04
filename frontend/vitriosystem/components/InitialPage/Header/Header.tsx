"use client";

import "./Header.css";
import { Search, Bell } from "lucide-react";
import { useAuth } from "@/lib/auth_context";

const ROLE_LABELS: Record<string, string> = {
  Client: "Cliente",
  Admin: "Administrador",
  Shopkeeper: "Lojista",
};

function getInitials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export default function Header() {
  const { user } = useAuth();

  return (
    <header className="header">
      <div className="searchBar">
        <Search size={18} />
        <input placeholder="Pesquisar..." />
      </div>

      <div className="headerRight">
        <button className="notification">
          <Bell size={18} />
        </button>

        <div className="profile">
          <div className="avatar">{user ? getInitials(user.name) : "…"}</div>

          <div>
            <strong>{user?.name ?? "Carregando..."}</strong>
            <span>{user ? (ROLE_LABELS[user.role] ?? user.role) : ""}</span>
          </div>
        </div>
      </div>
    </header>
  );
}