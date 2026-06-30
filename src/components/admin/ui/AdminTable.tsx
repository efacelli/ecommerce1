import styles from "./AdminTable.module.css";

type Props = {
  headers: string[];
  children: React.ReactNode;
  vacio?: string;
  sinFilas?: boolean;
};

export function AdminTable({ headers, children, vacio = "Sin resultados", sinFilas }: Props) {
  return (
    <div className={styles.wrapper}>
      <table className={styles.tabla}>
        <thead className={styles.thead}>
          <tr>
            {headers.map((h) => (
              <th key={h} className={styles.th}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className={styles.tbody}>
          {sinFilas ? (
            <tr>
              <td colSpan={headers.length} className={styles.vacio}>
                {vacio}
              </td>
            </tr>
          ) : (
            children
          )}
        </tbody>
      </table>
    </div>
  );
}

export function Td({
  children,
  muted,
  mono,
}: {
  children: React.ReactNode;
  muted?: boolean;
  mono?: boolean;
}) {
  return (
    <td
      className={[styles.td, muted ? styles.tdMuted : "", mono ? styles.tdMono : ""]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </td>
  );
}

export function Tr({
  children,
  onClick,
}: {
  children: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <tr
      className={[styles.tr, onClick ? styles.trClickable : ""].join(" ")}
      onClick={onClick}
    >
      {children}
    </tr>
  );
}
