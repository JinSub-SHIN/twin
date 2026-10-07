import styles from './ListingDetail.module.css'

export function PreferTags({ tags }: { tags: string[] }) {
  if (tags.length === 0) return null
  return (
    <section className={styles.block} aria-labelledby="prefer-title">
      <h3 id="prefer-title" className={styles.blockTitle}>
        이런 분이면 좋겠어요
      </h3>
      <ul className={styles.tags}>
        {tags.map((tag) => (
          <li key={tag}>#{tag.replace(/\s+/g, '')}</li>
        ))}
      </ul>
    </section>
  )
}
