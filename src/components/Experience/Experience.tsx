import { EXPERIENCE } from '../../data/content'
import { rv, useScrollProgress } from '../../hooks/useReveal'
import styles from './Experience.module.css'

/**
 * Timeline with a rail that draws itself as you scroll (scaleY follows
 * --prog) and a terracotta node that pings when each row reveals.
 */
export default function Experience() {
  const rows = useScrollProgress<HTMLDivElement>()

  return (
    <section id="experience" className={styles.experience}>
      <div ref={rv} className={`${styles.header} rv`}>
        <h2 className={styles.title}>The path so far</h2>
        <div className={styles.label}>(07) · Experience</div>
      </div>
      <div ref={rows} className={styles.rows}>
        {EXPERIENCE.map((row, i) => (
          <div
            key={row.title}
            ref={rv}
            className={`${styles.row} ${
              i === EXPERIENCE.length - 1 ? styles.rowLast : ''
            } rv rv-left`}
            style={{ '--d': `${i * 0.1}s` } as React.CSSProperties}
          >
            <div className={styles.period}>{row.period}</div>
            <div>
              <div className={styles.rowTitle}>{row.title}</div>
              <div className={styles.desc}>{row.desc}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
