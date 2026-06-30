import styles from "./StatCard.module.css";

type Props = {
  titulo: string;
  valor: string | number;
  subtexto?: string;
  variante?: "default" | "primary" | "success" | "warning" | "error";
  icono?: React.ReactNode;
};

export function StatCard({
  titulo,
  valor,
  subtexto,
  variante = "default",
  icono,
}: Props) {
  return (
    <div className={[styles.card, styles[variante]].join(" ")}>
      <div className={styles.top}>
        <p className={styles.titulo}>{titulo}</p>
        {icono && <span className={styles.icono}>{icono}</span>}
      </div>
      <p className={styles.valor}>{valor}</p>
      {subtexto && <p className={styles.subtexto}>{subtexto}</p>}
    </div>
  );
}
