import type { InputHTMLAttributes, ReactNode } from "react";
import styles from "./FormField.module.css";

type Props = InputHTMLAttributes<HTMLInputElement | HTMLTextAreaElement> & {
  label: string;
  name: string;
  error?: string;
  requerido?: boolean;
  multilinea?: boolean;
  filas?: number;
  ayuda?: ReactNode;
};

export function FormField({
  label,
  name,
  error,
  requerido = false,
  multilinea = false,
  filas = 3,
  ayuda,
  className,
  ...props
}: Props) {
  const id = `field-${name}`;
  const errorId = `${id}-error`;

  return (
    <div className={[styles.campo, error ? styles.campoError : "", className ?? ""].filter(Boolean).join(" ")}>
      <label htmlFor={id} className={styles.label}>
        {label}
        {requerido && <span className={styles.requerido} aria-hidden="true"> *</span>}
      </label>

      {multilinea ? (
        <textarea
          id={id}
          name={name}
          rows={filas}
          className={styles.textarea}
          aria-describedby={error ? errorId : undefined}
          aria-invalid={!!error}
          {...(props as InputHTMLAttributes<HTMLTextAreaElement>)}
        />
      ) : (
        <input
          id={id}
          name={name}
          className={styles.input}
          aria-describedby={error ? errorId : undefined}
          aria-invalid={!!error}
          {...(props as InputHTMLAttributes<HTMLInputElement>)}
        />
      )}

      {ayuda && !error && (
        <p className={styles.ayuda}>{ayuda}</p>
      )}

      {error && (
        <p id={errorId} className={styles.error} role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
