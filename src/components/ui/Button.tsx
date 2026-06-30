import type { ButtonHTMLAttributes, ReactNode } from "react";
import styles from "./Button.module.css";

type Variante = "primary" | "secondary" | "ghost" | "danger";
type Tamaño = "sm" | "md" | "lg";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variante?: Variante;
  tamaño?: Tamaño;
  cargando?: boolean;
  fullWidth?: boolean;
  children: ReactNode;
};

export function Button({
  variante = "primary",
  tamaño = "md",
  cargando = false,
  fullWidth = false,
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
        fullWidth ? styles.fullWidth : "",
        cargando ? styles.cargando : "",
        className ?? "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {cargando ? (
        <span className={styles.spinner} aria-hidden="true" />
      ) : null}
      <span className={cargando ? styles.textoCargando : ""}>{children}</span>
    </button>
  );
}
