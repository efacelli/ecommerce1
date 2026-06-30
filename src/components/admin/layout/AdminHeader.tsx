"use client";

import { usePathname } from "next/navigation";
import styles from "./AdminHeader.module.css";

const TITULOS: Record<string, string> = {
  "/admin/dashboard":      "Dashboard",
  "/admin/productos":      "Productos",
  "/admin/productos/nuevo":"Nuevo producto",
  "/admin/pedidos":        "Pedidos",
};

function getTitulo(pathname: string): string {
  if (TITULOS[pathname]) return TITULOS[pathname];
  if (pathname.includes("/editar")) return "Editar producto";
  if (pathname.includes("/stock"))  return "Gestión de stock";
  if (pathname.match(/\/admin\/pedidos\/\d+/)) return "Detalle del pedido";
  return "Admin";
}

export function AdminHeader() {
  const pathname = usePathname();
  const titulo = getTitulo(pathname);
  const ahora = new Date().toLocaleDateString("es-AR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <header className={styles.header}>
      <div className={styles.izq}>
        <h1 className={styles.titulo}>{titulo}</h1>
        <p className={styles.fecha}>{ahora}</p>
      </div>
      <div className={styles.der}>
        <div className={styles.avatar} aria-label="Admin">A</div>
      </div>
    </header>
  );
}
