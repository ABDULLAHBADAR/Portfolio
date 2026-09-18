import type { OpsJob } from '../../data/content'
import { rv } from '../../hooks/useReveal'
import styles from './Ops.module.css'

/** Caption block every ops card shares: kind pill + index, title, one-liner,
 *  tag chips. A compact sibling of Work's CaseInfo. */
export default function OpsCaption({ c, d }: { c: OpsJob; d: number }) {
  return (
    <div
      ref={rv}
      className={`${styles.caption} rv`}
      style={{ '--d': `${d}s` } as React.CSSProperties}
    >
      <div className={styles.capMeta}>
        <span className={styles.kind}>{c.kind}</span>
        <span className={styles.capNum}>op-{c.num}</span>
      </div>
      <h3 className={styles.capTitle}>{c.title}</h3>
      <p className={styles.capDesc}>{c.desc}</p>
      <div className={styles.capTags}>
        {c.tags.map((t) => (
          <span key={t} className={styles.capTag}>
            {t}
          </span>
        ))}
      </div>
    </div>
  )
}
