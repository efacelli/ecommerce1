"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useRef, useEffect, useTransition, Suspense } from "react";
import styles from "./SearchBar.module.css";

type Props = {
  compacta?: boolean;
  placeholder?: string;
};

function SearchBarInterno({
  compacta = false,
  placeholder = "Buscar prendas…",
}: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [valor, setValor] = useState(searchParams.get("q") ?? "");
  const [abierta, setAbierta] = useState(false);
  const [, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setValor(searchParams.get("q") ?? "");
  }, [searchParams]);

  useEffect(() => {
    if (abierta && compacta) {
      inputRef.current?.focus();
    }
  }, [abierta, compacta]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const q = valor.trim();
    if (!q) return;
    startTransition(() => {
      router.push(`/buscar?q=${encodeURIComponent(q)}`);
    });
    if (compacta) setAbierta(false);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Escape") {
      setAbierta(false);
      setValor("");
    }
  }

  if (compacta) {
    return (
      <div className={styles.compacta}>
        {abierta ? (
          <form onSubmit={handleSubmit} className={styles.formCompacta} role="search">
            <input
              ref={inputRef}
              type="search"
              value={valor}
              onChange={(e) => setValor(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              className={styles.inputCompacto}
              aria-label="Buscar productos"
            />
            <button type="submit" className={styles.btnIcono} aria-label="Buscar">
              <IconoBuscar />
            </button>
            <button
              type="button"
              onClick={() => { setAbierta(false); setValor(""); }}
              className={styles.btnIcono}
              aria-label="Cerrar búsqueda"
            >
              <IconoCerrar />
            </button>
          </form>
        ) : (
          <button onClick={() => setAbierta(true)} className={styles.btnIcono} aria-label="Abrir búsqueda">
            <IconoBuscar />
          </button>
        )}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={styles.form} role="search">
      <div className={styles.inputWrapper}>
        <span className={styles.iconoIzq} aria-hidden="true"><IconoBuscar /></span>
        <input
          ref={inputRef}
          type="search"
          value={valor}
          onChange={(e) => setValor(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={styles.input}
          aria-label="Buscar productos"
          autoFocus
        />
        {valor && (
          <button type="button" onClick={() => setValor("")} className={styles.btnLimpiar} aria-label="Limpiar búsqueda">
            <IconoCerrar />
          </button>
        )}
      </div>
      <button type="submit" className={styles.btnBuscar}>Buscar</button>
    </form>
  );
}

// El componente exportado se envuelve a sí mismo en Suspense.
// Así, cualquier página que use <SearchBar /> (directa o indirectamente
// vía el Header del layout) queda protegida automáticamente sin tener
// que recordar envolverlo manualmente en cada lugar donde se use.
export function SearchBar(props: Props) {
  return (
    <Suspense fallback={<div className={props.compacta ? styles.btnIcono : styles.input} />}>
      <SearchBarInterno {...props} />
    </Suspense>
  );
}

function IconoBuscar() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"
      strokeLinejoin="round" aria-hidden="true">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

function IconoCerrar() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"
      strokeLinejoin="round" aria-hidden="true">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}