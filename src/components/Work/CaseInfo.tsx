import type { ReactNode } from 'react'
import type { WorkCase } from '../../data/content'
import { rv } from '../../hooks/useReveal'
import styles from './Work.module.css'

/**
 * The copy column every case shares: index, title, serif tagline, blurb,
 * three mono-ticked proof points, tag chips, and the outbound link.
 * Children (optional) render extras like the Callyniq waveform.
 */
export default function CaseInfo({
  c,
  children,
}: {
  c: WorkCase
  children?: ReactNode
}) {
  return (
    <div className={styles.info}>
      <div ref={rv} className={`${styles.caseNum} rv`}>
        ({c.num})
      </div>
      <h3 ref={rv} className={`${styles.caseTitle} rv`} style={{ '--d': '0.06s' } as React.CSSProperties}>
        {c.title}
      </h3>
      <div ref={rv} className={`${styles.caseTagline} rv`} style={{ '--d': '0.12s' } as React.CSSProperties}>
        {c.tagline}
      </div>
      {children}
      <p ref={rv} className={`${styles.caseDesc} rv`} style={{ '--d': '0.18s' } as React.CSSProperties}>
        {c.desc}
      </p>
      <ul className={styles.feats}>
        {c.feats.map((f, i) => (
          <li
            key={f}
            ref={rv}
            className={`${styles.feat} rv`}
            style={{ '--d': `${0.24 + i * 0.07}s` } as React.CSSProperties}
          >
            <span className={styles.featTick}>▸</span>
            {f}
          </li>
        ))}
      </ul>
      <div ref={rv} className={`${styles.caseFoot} rv`} style={{ '--d': '0.45s' } as React.CSSProperties}>
        <div className={styles.tags}>
          {c.tags.map((t) => (
            <span key={t} className={styles.tagChip}>
              {t}
            </span>
          ))}
        </div>
        {c.href && (
          <a href={c.href} target="_blank" rel="noopener noreferrer" className={styles.visit}>
            Visit site <span className={styles.visitArrow}>↗</span>
          </a>
        )}
      </div>
    </div>
  )
}
