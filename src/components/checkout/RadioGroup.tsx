import styles from "./RadioGroup.module.css";

type Opcion = {
  valor: string;
  label: string;
  descripcion?: string;
  icono?: string;
};

type Props = {
  label: string;
  name: string;
  opciones: Opcion[];
  valorActual?: string;
  onChange?: (valor: string) => void;
  error?: string;
  requerido?: boolean;
};

export function RadioGroup({
  label,
  name,
  opciones,
  valorActual,
  onChange,
  error,
  requerido = false,
}: Props) {
  return (
    <fieldset className={styles.fieldset}>
      <legend className={styles.legend}>
        {label}
        {requerido && <span className={styles.requerido} aria-hidden="true"> *</span>}
      </legend>

      <div className={styles.opciones}>
        {opciones.map((op) => (
          <label
            key={op.valor}
            className={[
              styles.opcion,
              valorActual === op.valor ? styles.opcionActiva : "",
            ]
              .filter(Boolean)
              .join(" ")}
          >
            <input
              type="radio"
              name={name}
              value={op.valor}
              checked={valorActual === op.valor}
              onChange={() => onChange?.(op.valor)}
              className={styles.radio}
              required={requerido}
            />
            <div className={styles.opcionContenido}>
              {op.icono && (
                <span className={styles.icono} aria-hidden="true">
                  {op.icono}
                </span>
              )}
              <div className={styles.textos}>
                <span className={styles.opcionLabel}>{op.label}</span>
                {op.descripcion && (
                  <span className={styles.opcionDescripcion}>
                    {op.descripcion}
                  </span>
                )}
              </div>
            </div>
            <div className={styles.check} aria-hidden="true" />
          </label>
        ))}
      </div>

      {error && (
        <p className={styles.error} role="alert">
          {error}
        </p>
      )}
    </fieldset>
  );
}
