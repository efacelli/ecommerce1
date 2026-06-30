import type { Metadata } from "next";
import "@/app/globals.css";

export const metadata: Metadata = {
  title: {
    default: "Nombre del Local — Ropa",
    template: "%s | Nombre del Local",
  },
  description: "Tienda de ropa online. Encontrá las últimas colecciones.",
  openGraph: {
    type: "website",
    locale: "es_AR",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
