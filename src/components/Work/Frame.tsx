import type { ReactNode } from 'react'
import styles from './Work.module.css'

/**
 * Browser-chrome frame the case media sits in — paper-toned top bar, three
 * dots, a mono address label. `dark` flips the chrome for ink-background
 * media (the terminal). The frame itself carries no animation; callers wrap
 * it with the global `wipe` reveal.
 */
export default function Frame({
  label,
  dark = false,
  children,
}: {
  label: string
  dark?: boolean
  children: ReactNode
}) {
  return (
    <figure className={`${styles.frame} ${dark ? styles.frameDark : ''}`}>
      <figcaption className={styles.frameBar}>
        <span className={styles.frameDots} aria-hidden="true">
          <i />
          <i />
          <i />
        </span>
        <span className={styles.frameLabel}>{label}</span>
      </figcaption>
      <div className={styles.frameBody}>{children}</div>
    </figure>
  )
}
