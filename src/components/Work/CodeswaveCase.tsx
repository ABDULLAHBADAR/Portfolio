import { WORK_CASES } from '../../data/content'
import { rv } from '../../hooks/useReveal'
import CaseInfo from './CaseInfo'
import Frame from './Frame'
import styles from './Work.module.css'

/**
 * Case 03 — no screenshots by design. A wireframe site draws itself inside
 * the frame in the portfolio's drafting language: dashed strokes appear in
 * four passes (chrome → hero → columns → marks), hold, fade, loop. Pure SVG;
 * `pathLength={1}` normalizes every shape so one dash math fits all.
 */

const draw = (group: string) => ({
  pathLength: 1,
  className: `${styles.cw} ${group}`,
})

export default function CodeswaveCase() {
  const c = WORK_CASES[2]
  return (
    <article className={styles.case} id={`work-${c.slug}`}>
      <CaseInfo c={c} />
      <div className={styles.stage}>
        <div ref={rv} className={styles.stageMain}>
          <div className="wipe">
            <Frame label="codeswave.com · wireframe, drawing itself">
            <svg
              className={styles.cwSvg}
              viewBox="0 0 800 470"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              aria-label="Animated wireframe of a website assembling"
              role="img"
            >
              {/* pass 1 — chrome */}
              <rect x="24" y="22" width="752" height="42" rx="8" {...draw(styles.cw1)} />
              <circle cx="52" cy="43" r="9" {...draw(styles.cw1)} />
              <line x1="600" y1="43" x2="648" y2="43" {...draw(styles.cw1)} />
              <line x1="668" y1="43" x2="716" y2="43" {...draw(styles.cw1)} />
              <line x1="736" y1="43" x2="760" y2="43" {...draw(styles.cw1)} />

              {/* pass 2 — hero */}
              <line x1="60" y1="130" x2="420" y2="130" strokeWidth="10" {...draw(styles.cw2)} />
              <line x1="60" y1="162" x2="330" y2="162" strokeWidth="10" {...draw(styles.cw2)} />
              <line x1="60" y1="204" x2="380" y2="204" {...draw(styles.cw2)} />
              <line x1="60" y1="224" x2="300" y2="224" {...draw(styles.cw2)} />
              <rect x="60" y="252" width="132" height="38" rx="19" {...draw(`${styles.cw2} ${styles.cwAccent}`)} />
              <rect x="480" y="108" width="260" height="182" rx="10" {...draw(styles.cw2)} />
              <line x1="480" y1="108" x2="740" y2="290" {...draw(styles.cw2)} />
              <line x1="740" y1="108" x2="480" y2="290" {...draw(styles.cw2)} />

              {/* pass 3 — three columns */}
              {[0, 1, 2].map((i) => {
                const x = 60 + i * 240
                return (
                  <g key={i}>
                    <rect x={x} y={330} width={200} height={104} rx={10} {...draw(styles.cw3)} />
                    <line x1={x + 22} y1={362} x2={x + 118} y2={362} strokeWidth="5" {...draw(styles.cw3)} />
                    <line x1={x + 22} y1={388} x2={x + 168} y2={388} {...draw(styles.cw3)} />
                    <line x1={x + 22} y1={406} x2={x + 140} y2={406} {...draw(styles.cw3)} />
                  </g>
                )
              })}

              {/* pass 4 — drafting marks */}
              <g className={styles.cwMarks}>
                <line x1="436" y1="120" x2="436" y2="134" {...draw(`${styles.cw4} ${styles.cwAccent}`)} />
                <line x1="429" y1="127" x2="443" y2="127" {...draw(`${styles.cw4} ${styles.cwAccent}`)} />
                <circle cx="436" cy="127" r="4.5" {...draw(`${styles.cw4} ${styles.cwAccent}`)} />
                <line x1="60" y1="308" x2="740" y2="308" strokeDasharray="4 7" {...draw(styles.cw4)} />
              </g>
            </svg>
            </Frame>
          </div>
        </div>
      </div>
    </article>
  )
}
