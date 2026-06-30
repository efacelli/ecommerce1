"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCarrito } from "@/context/CarritoContext";
import { SearchBar } from "@/components/shop/SearchBar";
import styles from "./Header.module.css";

const NAV_LINKS = [
  { href: "/productos", label: "Todo" },
  { href: "/categorias/mujer", label: "Mujer" },
  { href: "/categorias/hombre", label: "Hombre" },
  { href: "/categorias/ninos", label: "Niños" },
];

export function Header() {
  const pathname = usePathname();
  const { totalItems, abrirDrawer } = useCarrito();

  return (
    <header className={styles.header}>
      <div className={styles.inner}>

        {/* Marca */}
        <Link href="/" className={styles.logo}>
          La Tienda
        </Link>

        {/* Nav central */}
        <nav className={styles.nav} aria-label="Navegación principal">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={[
                styles.navLink,
                pathname.startsWith(link.href) ? styles.navLinkActivo : "",
              ]
                .filter(Boolean)
                .join(" ")}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Acciones */}
        <div className={styles.acciones}>
          <SearchBar compacta />

          <button
            onClick={abrirDrawer}
            className={styles.carritoBtn}
            aria-label={`Carrito — ${totalItems} ${totalItems === 1 ? "ítem" : "ítems"}`}
          >
            <IconoBolsa />
            {totalItems > 0 && (
              <span className={styles.carritoCount} aria-hidden="true">
                {totalItems > 99 ? "99+" : totalItems}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}

function IconoBolsa() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
      <line x1="3" y1="6" x2="21" y2="6" />
      <path d="M16 10a4 4 0 01-8 0" />
    </svg>
  );
}
