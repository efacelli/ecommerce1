import type { SelectHTMLAttributes } from "react";
import styles from "./SelectField.module.css";

type Opcion = { valor: string; label: string };

type Props = SelectHTMLAttributes<HTMLSelectElement> & {
  label: string;
  name: string;
  opciones: Opcion[];
  error?: string;
  requerido?: boolean;
  placeholder?: string;
};

export function SelectField({
  label,
  name,
  opciones,
  error,
  requerido = false,
  placeholder = "Seleccioná una opción",
  ...props
}: Props) {
  const id = `field-${name}`;
  const errorId = `${id}-error`;

  return (
    <div className={[styles.campo, error ? styles.campoError : ""].filter(Boolean).join(" ")}>
      <label htmlFor={id} className={styles.label}>
        {label}
        {requerido && <span className={styles.requerido} aria-hidden="true"> *</span>}
      </label>

      <div className={styles.selectWrapper}>
        <select
          id={id}
          name={name}
          className={styles.select}
          aria-describedby={error ? errorId : undefined}
          aria-invalid={!!error}
          {...props}
        >
          <option value="">{placeholder}</option>
          {opciones.map((op) => (
            <option key={op.valor} value={op.valor}>
              {op.label}
            </option>
          ))}
        </select>
        <span className={styles.chevron} aria-hidden="true">▾</span>
      </div>

      {error && (
        <p id={errorId} className={styles.error} role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
