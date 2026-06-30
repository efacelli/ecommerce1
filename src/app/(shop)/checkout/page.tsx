import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { CheckoutForm } from "@/components/checkout/CheckoutForm";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Checkout — Completar pedido",
  robots: { index: false, follow: false },
};

function CheckoutSkeleton() {
  return (
    <div className={styles.skeleton}>
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className={styles.skeletonBloque} />
      ))}
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <div className={styles.pagina}>
      <div className="container">

        {/* ── Encabezado ──────────────────────────── */}
        <div className={styles.header}>
          <Link href="/" className={styles.logo}>
            La Tienda
          </Link>

          <nav className={styles.pasos} aria-label="Pasos del proceso">
            <span className={styles.paso}>
              <Link href="/carrito" className={styles.pasoLink}>
                Carrito
              </Link>
            </span>
            <span className={styles.pasoDivisor} aria-hidden="true">›</span>
            <span className={[styles.paso, styles.pasoActivo].join(" ")} aria-current="step">
              Datos y envío
            </span>
            <span className={styles.pasoDivisor} aria-hidden="true">›</span>
            <span className={[styles.paso, styles.pasoPendiente].join(" ")}>
              Confirmación
            </span>
          </nav>
        </div>

        {/* ── Contenido ────────────────────────────── */}
        <div className={styles.contenido}>
          <Suspense fallback={<CheckoutSkeleton />}>
            <CheckoutForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
