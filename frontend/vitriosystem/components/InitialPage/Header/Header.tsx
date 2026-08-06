"use client";

import styles from "./Header.module.css";
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
    <header className={styles.header}>

      <div className={styles.headerRight}>
        <button className={styles.notification}>
          <Bell size={18} />
        </button>

        <div className={styles.profile}>
          <div className={styles.avatar}>{user ? getInitials(user.name) : "…"}</div>

          <div>
            <strong>{user?.name ?? "Carregando..."}</strong>
            <span>{user ? (ROLE_LABELS[user.role] ?? user.role) : ""}</span>
          </div>
        </div>
      </div>
    </header>
  );
}