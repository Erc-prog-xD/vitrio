// app/store/[slug]/(shopkeeper)/layout.tsx
"use client";

import { useRequireRole } from "@/lib/auth_context";
import { ROLES } from "@/lib/api";

export default function ShopkeeperLayout({ children }: { children: React.ReactNode }) {
  const { loading } = useRequireRole([ROLES.SHOPKEEPER, ROLES.ADMIN]);

  if (loading) return null; // ou um spinner

  return <>{children}</>;
}