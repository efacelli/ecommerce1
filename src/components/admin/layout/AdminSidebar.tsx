"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./AdminSidebar.module.css";

const NAV = [
  {
    grupo: "General",
    items: [
      { href: "/admin/dashboard", label: "Dashboard", icono: <IconoDash /> },
    ],
  },
  {
    grupo: "Catálogo",
    items: [
      { href: "/admin/productos", label: "Productos", icono: <IconoProductos /> },
      { href: "/admin/productos/nuevo", label: "Nuevo producto", icono: <IconoMas /> },
    ],
  },
  {
    grupo: "Ventas",
    items: [
      { href: "/admin/pedidos", label: "Pedidos", icono: <IconoPedidos /> },
    ],
  },
];

export function AdminSidebar() {
  const pathname = usePathname();

  function esActivo(href: string) {
    if (href === "/admin/dashboard") return pathname === href;
    return pathname.startsWith(href);
  }

  return (
    <aside className={styles.sidebar}>
      {/* Logo */}
      <div className={styles.logo}>
        <Link href="/admin/dashboard" className={styles.logoLink}>
          <span className={styles.logoIcono}>👔</span>
          <span className={styles.logoTexto}>La Tienda</span>
        </Link>
        <span className={styles.logoTag}>Admin</span>
      </div>

      {/* Nav */}
      <nav className={styles.nav} aria-label="Navegación del panel">
        {NAV.map((grupo) => (
          <div key={grupo.grupo} className={styles.grupo}>
            <p className={styles.grupoLabel}>{grupo.grupo}</p>
            {grupo.items.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={[
                  styles.navLink,
                  esActivo(item.href) ? styles.navLinkActivo : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                aria-current={esActivo(item.href) ? "page" : undefined}
              >
                <span className={styles.navIcono}>{item.icono}</span>
                {item.label}
              </Link>
            ))}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className={styles.footer}>
        <Link href="/" className={styles.footerLink} target="_blank">
          <IconoExterior />
          Ver tienda
        </Link>
      </div>
    </aside>
  );
}

function IconoDash() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>;
}
function IconoProductos() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>;
}
function IconoMas() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>;
}
function IconoPedidos() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>;
}
function IconoExterior() {
  return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>;
}
