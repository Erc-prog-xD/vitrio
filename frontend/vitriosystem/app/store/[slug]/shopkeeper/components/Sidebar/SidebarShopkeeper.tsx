"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useParams } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Palette,
  Settings,
  Store as StoreIcon,
  ExternalLink,
  LogOut,
} from "lucide-react";
import { getMyStores, type Store } from "@/lib/api";
import { useAuth } from "@/lib/auth_context";
import styles from "./SidebarShopkeeper.module.css";

interface NavItem {
  label: string;
  href: string;
  icon: typeof LayoutDashboard;
  /** true = precisa ser rota exata; false = também ativa em sub-rotas */
  exact?: boolean;
}


export default function SidebarShopkeeper() {
  const pathname = usePathname();
  const params = useParams<{ slug: string }>();
  const slug = params?.slug ?? "";
  const { logout } = useAuth();

  const [store, setStore] = useState<Store | null>(null);
  const [loadingStore, setLoadingStore] = useState(true);

  useEffect(() => {
    let active = true;

    async function loadStore() {
      setLoadingStore(true);
      try {
        // getMyStores() retorna só as lojas do usuário logado — então,
        // de quebra, se o slug da URL não bater com nenhuma delas
        // (ex: shopkeeper tentando acessar loja de outro dono), `found`
        // fica null e o sidebar não expõe dados/cores daquela loja.
        const { dados } = await getMyStores();
        if (!active) return;
        setStore(dados?.find((s) => s.slug === slug) ?? null);
      } catch {
        if (active) setStore(null);
      } finally {
        if (active) setLoadingStore(false);
      }
    }

    if (slug) loadStore();
    return () => {
      active = false;
    };
  }, [slug]);

  const basePath = `/store/${slug}/shopkeeper`;

  const navItems: NavItem[] = [
    { label: "Início", href: basePath, icon: LayoutDashboard, exact: true },
    { label: "Produtos", href: `${basePath}/products`, icon: Package },
    { label: "Pedidos", href: `${basePath}/pedidos`, icon: ShoppingCart },
    { label: "Personalização", href: `${basePath}/personalizacao`, icon: Palette },
    { label: "Configurações", href: `${basePath}/configuracoes`, icon: Settings },
  ];

  const isItemActive = (item: NavItem) => {
    if (!pathname) return false;
    return item.exact ? pathname === item.href : pathname.startsWith(item.href);
  };


  return (
    <aside className={styles.sidebar} >
      <div className={styles.header}>
        <div className={styles.logoBadge} aria-hidden="true">
          {store?.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={store.logoUrl} alt="" className={styles.logoImg} />
          ) : (
            <StoreIcon size={18} strokeWidth={2.25} />
          )}
        </div>
        <div className={styles.storeInfo}>
          <span className={styles.storeName}>
            {loadingStore ? "Carregando..." : store?.name || slug}
          </span>
          {store && (
            <span
              className={`${styles.statusPill} ${
                store.isActive ? styles.statusActive : styles.statusPaused
              }`}
            >
              <span className={styles.statusDot} aria-hidden="true" />
              {store.isActive ? "Ativa" : "Pausada"}
            </span>
          )}
        </div>
      </div>

      <nav className={styles.nav}>
        <span className={styles.navEyebrow}>Gerenciar</span>
        <ul className={styles.navList}>
          {navItems.map((item) => {
            const active = isItemActive(item);
            const Icon = item.icon;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`${styles.navLink} ${active ? styles.navLinkActive : ""}`}
                  aria-current={active ? "page" : undefined}
                >
                  <Icon size={22} strokeWidth={2} className={styles.navIcon} />
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className={styles.footer}>
        <Link
          href={`/store/${slug}`}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.footerLink}
        >
          <ExternalLink size={17} strokeWidth={2} className={styles.navIcon} />
          <span>Ver vitrine</span>
        </Link>
        <button type="button" onClick={logout} className={styles.footerLink}>
          <LogOut size={17} strokeWidth={2} className={styles.navIcon} />
          <span>Sair</span>
        </button>
      </div>
    </aside>
  );
}