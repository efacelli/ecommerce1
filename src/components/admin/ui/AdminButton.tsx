import type { ButtonHTMLAttributes, ReactNode } from "react";
import styles from "./AdminButton.module.css";

type Variante = "primary" | "secondary" | "ghost" | "danger";
type Tamaño   = "sm" | "md";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variante?: Variante;
  tamaño?: Tamaño;
  cargando?: boolean;
  icono?: ReactNode;
  children: ReactNode;
};

export function AdminButton({
  variante = "primary",
  tamaño = "md",
  cargando = false,
  icono,
  children,
  disabled,
  className,
  ...props
}: Props) {
  return (
    <button
      {...props}
      disabled={disabled || cargando}
      className={[
        styles.btn,
        styles[variante],
        styles[tamaño],
        cargando ? styles.cargando : "",
        className ?? "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {cargando ? (
        <span className={styles.spinner} aria-hidden="true" />
      ) : icono ? (
        <span className={styles.icono}>{icono}</span>
      ) : null}
      {children}
    </button>
  );
}
