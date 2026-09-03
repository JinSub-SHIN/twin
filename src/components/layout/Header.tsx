import styles from "./Header.module.css";

type HeaderProps = {
  immersive?: boolean;
};

export function Header({ immersive = false }: HeaderProps) {
  if (immersive) {
    return (
      <header className={styles.immersive}>
        <p className={styles.immersiveLabel}>월세, 살짝 나눠요</p>
      </header>
    );
  }

  return (
    <header className={styles.header}>
      <h1 className={styles.brand}>살짝</h1>
    </header>
  );
}
