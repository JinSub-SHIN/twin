import styles from './Header.module.css'

type HeaderProps = {
  immersive?: boolean
}

export function Header({ immersive = false }: HeaderProps) {
  if (immersive) {
    return (
      <header className={styles.immersive}>
        <p className={styles.immersiveLabel}>Roommate match</p>
      </header>
    )
  }

  return (
    <header className={styles.header}>
      <h1 className={styles.brand}>
        Twin
        <span className={styles.brandDot}>.</span>
      </h1>
    </header>
  )
}
