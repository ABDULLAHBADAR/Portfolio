import { AGENCY_CASE as c } from '../../data/content'
import { rv } from '../../hooks/useReveal'
import work from '../Work/Work.module.css'
import styles from './AgencyCase.module.css'

/**
 * The white-label agency story as its own case file: the copy column shares
 * Work's typography, the stage is a drafting-sheet board of the headline
 * numbers. The Loom walkthrough link renders once its URL is set.
 */
export default function AgencyCase() {
  return (
    <section id="agency" className={styles.agency}>
      <div ref={rv} className={`${work.header} rv`}>
        <h2 className={work.title}>The agency build</h2>
        <div className={work.label}>(02) · Case study</div>
      </div>
      <article className={`${work.case} ${styles.case}`}>
        <div className={work.info}>
          <div ref={rv} className={`${work.caseNum} rv`}>
            (white-label · ghl)
          </div>
          <h3 ref={rv} className={`${work.caseTitle} rv`} style={{ '--d': '0.06s' } as React.CSSProperties}>
            {c.name}
          </h3>
          <div ref={rv} className={`${work.caseTagline} rv`} style={{ '--d': '0.12s' } as React.CSSProperties}>
            {c.tagline}
          </div>
          <p ref={rv} className={`${work.caseDesc} rv`} style={{ '--d': '0.18s' } as React.CSSProperties}>
            {c.desc}
          </p>
          <ul className={work.feats}>
            {c.feats.map((f, i) => (
              <li
                key={f}
                ref={rv}
                className={`${work.feat} rv`}
                style={{ '--d': `${0.24 + i * 0.07}s` } as React.CSSProperties}
              >
                <span className={work.featTick}>▸</span>
                {f}
              </li>
            ))}
          </ul>
          <div ref={rv} className={`${work.caseFoot} rv`} style={{ '--d': '0.45s' } as React.CSSProperties}>
            <div className={work.tags}>
              {c.tags.map((t) => (
                <span key={t} className={work.tagChip}>
                  {t}
                </span>
              ))}
            </div>
            {c.loom && (
              <a href={c.loom} target="_blank" rel="noopener noreferrer" className={work.visit}>
                Watch the walkthrough <span className={work.visitArrow}>↗</span>
              </a>
            )}
          </div>
        </div>
        <div className={`${work.stage} ${styles.board}`}>
          {c.numbers.map((n, i) => (
            <div
              key={n.label}
              ref={rv}
              className={`${styles.cell} rv`}
              style={{ '--d': `${0.15 + i * 0.1}s` } as React.CSSProperties}
            >
              <div className={styles.value}>{n.value}</div>
              <div className={styles.cellLabel}>{n.label}</div>
            </div>
          ))}
        </div>
      </article>
    </section>
  )
}
