import type { CSSProperties } from 'react'
import { OPS } from '../../data/content'
import { rv } from '../../hooks/useReveal'
import Frame from '../Work/Frame'
import OpsCaption from './OpsCaption'
import styles from './Ops.module.css'

/**
 * OP-03: the ARIVE stage router. Top half: the real Zapier Zap (sanitized
 * derivative — eight path rules fanning out of the status-updated trigger)
 * slowly panning across a fixed window, one soft pulse on the paths node.
 * Bottom half: the seven per-stage GHL workflows as a live board (HTML rows,
 * sanitized stand-in names + counts — the real list carries client data
 * baked into the pixels, so it is rebuilt rather than doctored). A corridor
 * fan with the ambient sync current ties the Zap to the rows; the live dots
 * blink; nothing else moves.
 *
 * Board geometry is pixel-true: rows 56px + 10px gap (pitch 66), SVG height
 * 462 == content px so viewBox-y equals layout-y; preserveAspectRatio="none"
 * stretches x only (non-scaling strokes keep the ink crisp).
 */

const ROWS: { name: string; count: number }[] = [
  { name: 'Application Received', count: 12 },
  { name: 'Pre-Qual Review', count: 141 },
  { name: 'Pre-Approval Issued', count: 92 },
  { name: 'File Setup', count: 84 },
  { name: 'Disclosures Out', count: 68 },
  { name: 'Conditional Approval', count: 57 },
  { name: 'Resubmission', count: 6 },
]

/* fan: one drop from under the Zap's paths node into the left corridor, a
   trunk down the stack, and a short tap into each row */
const FAN = [
  'M 300 0 C 300 14 56 8 56 26',
  'M 56 26 V 429',
  ...ROWS.map((_, i) => `M 56 ${33 + 66 * i} H 88`),
]

export default function AriveStageSyncCard() {
  return (
    <article className={styles.card} id="ops-arive-ghl-stages">
      <div ref={rv} className="rv" style={{ '--d': '0.08s' } as CSSProperties}>
        <div className="wipe">
          <Frame label="arive → zapier → ghl · stage router">
            <div className={styles.suStage}>
              {/* ---- the real Zap: status update → eight path rules ---- */}
              <div className={styles.suWin}>
                <div
                  className={`${styles.lcPan} ${styles.lcPanX}`}
                  style={{ '--pan': '-36%' } as CSSProperties}
                >
                  <img
                    src={`${import.meta.env.BASE_URL}work/arive-ghl/web/stage-paths.jpg`}
                    alt="Zapier Zap splitting ARIVE loan status updates through eight path rules, each posting into its stage workflow"
                    loading="lazy"
                  />
                  <i
                    className={styles.lcPulse}
                    style={{ left: '50%', top: '40%' } as CSSProperties}
                    aria-hidden="true"
                  />
                </div>
              </div>

              {/* ---- the seven live stage workflows ---- */}
              <div className={styles.suCanvas}>
                <div className={styles.suBoard}>
                  <svg
                    className={styles.suWires}
                    viewBox="0 0 600 462"
                    preserveAspectRatio="none"
                    aria-hidden="true"
                  >
                    {FAN.map((d) => (
                      <path key={d} className={styles.syncWire} d={d} pathLength={1} />
                    ))}
                    {FAN.map((d) => (
                      <path key={`f${d}`} className={styles.syncFlow} d={d} pathLength={1} />
                    ))}
                  </svg>
                  <div className={styles.suRows}>
                    {ROWS.map((r) => (
                      <div className={styles.suRow} key={r.name}>
                        <i className={styles.suRowChip}>G</i>
                        <span className={styles.suName}>{r.name}</span>
                        <i className={styles.suLeader} aria-hidden="true" />
                        <span className={styles.suCount}>{r.count}</span>
                        <span className={styles.suLive}>
                          <i />
                          live
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className={styles.suFoot} aria-hidden="true">
                  enrolled across stage workflows · <b>460</b> contacts <i />
                </div>
              </div>
            </div>
          </Frame>
        </div>
      </div>
      <OpsCaption c={OPS[2]} d={0.2} />
    </article>
  )
}
