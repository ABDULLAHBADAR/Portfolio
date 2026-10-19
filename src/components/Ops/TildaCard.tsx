import type { CSSProperties } from 'react'
import { OPS } from '../../data/content'
import { rv } from '../../hooks/useReveal'
import Frame from '../Work/Frame'
import OpsCaption from './OpsCaption'
import styles from './Ops.module.css'

/**
 * OP-01: the Tilda → n8n → GHL router, full-width at the head of the grid. Drawn
 * natively in the site's drafting language (no screenshots: the originals in
 * work-src/n8n read too small and too cool-toned for the paper theme). Two
 * rows in one frame: a paper-toned Tilda form strip and the n8n topology as
 * an ink-and-terracotta schematic on the drafting grid. One 11s loop replays
 * a submission: fields fill, SEND pulses, the webhook wakes, the run walks
 * the spine, the eight source-form branches cascade, everything converges on
 * the GHL POST, the pipeline switch fans out and the ghl chip lights up.
 *
 * Wires reuse the OP-04 sync recipes (.syncWire draw / .syncFlow current,
 * same module file); node flashes and rings ride --pd delays on the shared
 * cycle. Geometry lives in % / a 1600×560 viewBox: nodes are HTML (crisp
 * text), wires are SVG with non-scaling strokes.
 */

/* branch rows (which-form fan) and pipeline rows, as % of canvas height */
const BRANCH_Y = [9, 20.7, 32.4, 44.1, 55.9, 67.6, 79.3, 91]
const END_Y = [12, 27.2, 42.4, 57.6, 72.8, 88]

/* svg-unit helpers (viewBox 1600 × 560) */
const BY = BRANCH_Y.map((p) => +(p * 5.6).toFixed(1))
const EY = END_Y.map((p) => +(p * 5.6).toFixed(1))

const WIRES: string[] = [
  'M 80 280 H 480', // webhook → filter → code → switch spine
  ...BY.map((y) => `M 480 280 C 600 280 640 ${y} 752 ${y}`), // switch fan
  ...BY.map((y) => `M 752 ${y} C 872 ${y} 900 280 992 280`), // converge
  'M 992 280 H 1360', // post → code → if → switch spine
  ...EY.map((y) => `M 1360 280 C 1432 280 1452 ${y} 1520 ${y}`), // pipelines
]

const FIELDS: { label: string; w: number }[] = [
  { label: 'name', w: 72 },
  { label: 'last name', w: 58 },
  { label: 'email', w: 84 },
  { label: 'phone', w: 66 },
  { label: 'city', w: 52 },
]

function Node({
  x,
  y,
  glyph,
  name,
  sub,
  d,
  accent,
  ring,
  mini,
}: {
  x: number
  y: number
  glyph: string
  name?: string
  sub?: string
  d: number
  accent?: boolean
  ring?: boolean
  mini?: boolean
}) {
  return (
    <div
      className={`${styles.tiNode} ${mini ? styles.tiNodeMini : ''}`}
      style={{ left: `${x}%`, top: `${y}%`, '--pd': `${d}s` } as CSSProperties}
    >
      <span className={`${styles.tiChip} ${accent ? styles.tiChipAccent : ''}`}>
        {glyph}
        <i className={styles.tiFlash} aria-hidden="true" />
        {ring && <i className={styles.tiNodeRing} aria-hidden="true" />}
      </span>
      {name && <span className={styles.tiName}>{name}</span>}
      {sub && <span className={styles.tiSub}>{sub}</span>}
    </div>
  )
}

export default function TildaCard() {
  return (
    <article
      className={`${styles.card} ${styles.tiCard}`}
      id="ops-tilda-n8n-ghl"
    >
      <div ref={rv} className="rv">
        <div className="wipe">
          <Frame label="tilda form → n8n → gohighlevel">
            <div
              className={styles.tiStage}
              role="img"
              aria-label="Schematic replay of a Tilda form submission routed through an n8n switch into GoHighLevel pipelines"
            >
              {/* ---- the source: a paper-toned Tilda form strip ---- */}
              <div className={styles.tiForm}>
                <div className={styles.tiFormKicker}>
                  step 4 of 4 · tilda form
                </div>
                <div className={styles.tiFields}>
                  {FIELDS.map((f, i) => (
                    <span key={f.label} className={styles.tiField}>
                      <em className={styles.tiFieldLabel}>{f.label}</em>
                      <i className={styles.tiFieldLine}>
                        <b
                          className={styles.tiFill}
                          style={
                            {
                              '--w': `${f.w}%`,
                              '--pd': `${0.2 + i * 0.16}s`,
                            } as CSSProperties
                          }
                        />
                      </i>
                    </span>
                  ))}
                  <span className={styles.tiSend}>
                    send
                    <i className={styles.tiSendRing} aria-hidden="true" />
                  </span>
                </div>
              </div>

              {/* ---- the route: n8n topology on the drafting grid ---- */}
              <div className={styles.tiCanvasRow}>
                <div className={styles.tiPanner}>
                  <div className={styles.tiCanvas}>
                    <svg
                      className={styles.tiWires}
                      viewBox="0 0 1600 560"
                      preserveAspectRatio="none"
                      aria-hidden="true"
                    >
                      {WIRES.map((d) => (
                        <path key={d} className={styles.syncWire} d={d} pathLength={1} />
                      ))}
                      {WIRES.map((d) => (
                        <path key={`f${d}`} className={styles.syncFlow} d={d} pathLength={1} />
                      ))}
                    </svg>

                    <span className={styles.tiLeadChip} aria-hidden="true">
                      lead · new
                    </span>

                    <Node x={5} y={50} glyph="W" name="webhook" sub="all tilda forms" d={1.6} accent ring />
                    <Node x={13} y={50} glyph="≡" name="filter" d={2.0} mini />
                    <Node x={21} y={50} glyph="{}" name="code" d={2.3} mini />
                    <Node x={30} y={50} glyph="»" name="switch" sub="which form?" d={2.7} ring />
                    {BRANCH_Y.map((y, i) => (
                      <Node
                        key={y}
                        x={47}
                        y={y}
                        glyph="{}"
                        d={3.1 + i * 0.15}
                        mini
                        name={i === 0 ? 'code · post' : undefined}
                      />
                    ))}
                    <Node x={62} y={50} glyph="G" name="post → ghl" sub="/contacts" d={4.7} accent ring />
                    <Node x={70.5} y={50} glyph="{}" name="code" d={5.1} mini />
                    <Node x={77.5} y={50} glyph="?" name="if" d={5.4} mini />
                    <Node x={85} y={50} glyph="»" name="switch" sub="pipeline" d={5.8} ring />
                    {END_Y.map((y, j) => (
                      <span
                        key={y}
                        className={styles.tiPill}
                        style={
                          {
                            left: '95%',
                            top: `${y}%`,
                            '--pd': `${6.3 + j * 0.1}s`,
                          } as CSSProperties
                        }
                      >
                        <i className={styles.tiPillChip}>G</i>
                        pipeline 0{j + 1}
                        <b className={styles.tiFlash} aria-hidden="true" />
                      </span>
                    ))}
                  </div>
                </div>
                <span className={styles.tiGhlChip} aria-hidden="true">
                  <i />→ ghl pipelines
                </span>
              </div>
            </div>
          </Frame>
        </div>
      </div>
      <OpsCaption c={OPS[0]} d={0.12} />
    </article>
  )
}
