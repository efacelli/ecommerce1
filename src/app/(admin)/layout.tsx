import type { Metadata } from "next";
import { AdminSidebar } from "@/components/admin/layout/AdminSidebar";
import { AdminHeader } from "@/components/admin/layout/AdminHeader";
import "./admin.tokens.css";
import styles from "./layout.module.css";

export const metadata: Metadata = {
  title: { default: "Admin", template: "%s | Admin — La Tienda" },
  robots: { index: false, follow: false },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={styles.shell}>
      <AdminSidebar />
      <div className={styles.main}>
        <AdminHeader />
        <main className={styles.contenido}>{children}</main>
      </div>
    </div>
  );
}
