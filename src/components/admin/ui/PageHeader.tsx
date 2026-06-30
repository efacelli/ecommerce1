import styles from "./PageHeader.module.css";

type Props = {
  titulo: string;
  subtitulo?: string;
  acciones?: React.ReactNode;
};

export function PageHeader({ titulo, subtitulo, acciones }: Props) {
  return (
    <div className={styles.header}>
      <div>
        <h2 className={styles.titulo}>{titulo}</h2>
        {subtitulo && <p className={styles.subtitulo}>{subtitulo}</p>}
      </div>
      {acciones && <div className={styles.acciones}>{acciones}</div>}
    </div>
  );
}
