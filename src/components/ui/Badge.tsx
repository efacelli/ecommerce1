import styles from "./Badge.module.css";

type Props = {
  texto: string;
  color?: string; // hex del background
  variante?: "default" | "outline" | "sale";
};

export function Badge({ texto, color, variante = "default" }: Props) {
  return (
    <span
      className={[styles.badge, styles[variante]].join(" ")}
      style={color ? ({ "--badge-color": color } as React.CSSProperties) : undefined}
    >
      {texto}
    </span>
  );
}
