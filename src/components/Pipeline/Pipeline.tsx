import type { CSSProperties } from 'react'
import {
  PIPELINE_ASIDE,
  PIPELINE_PLATFORMS,
  PIPELINE_STAGES,
} from '../../data/content'
import type { PipeStage } from '../../data/content'
import { rv, useScrollProgress } from '../../hooks/useReveal'
import Frame from '../Work/Frame'
import NurtureTabs from './NurtureTabs'
import styles from './Pipeline.module.css'

/**
 * "(05) · Pipeline" — one client system traced end to end: GHL intake form →
 * booking calendar → workflow webhook → Make.com scenario → ServiceTitan →
 * status sync home.
 * Stages hang off a center rail that draws with scroll while a lead "packet"
 * rides it down; each stage's screenshot performs its own step with overlay
 * choreography (highlight cascades, module-run pulses, filter chips).
 *
 * Overlay hotspot coordinates are % of the shipped derivatives in
 * public/work/make-ghl/web (identifiers blurred / Make title bars cropped at
 * derivation). Re-shooting a screenshot means re-tuning its spots.
 */

type Spot = { x: number; y: number; d: number; big?: boolean }
type RunChip = { x: number; y: number; d: number; t: string }

/* Stage 03 · make.com GHL → ServiceTitan: webhook chain marches left to
   right, then the three branch POST /jobs fire, then the GHL updates. */
const SPOTS_ST: Spot[] = [
  { x: 9.5, y: 49.9, d: 0, big: true }, // webhook in
  { x: 15.6, y: 48.7, d: 0.3 },
  { x: 22.4, y: 48.7, d: 0.6 },
  { x: 28.2, y: 48.7, d: 0.9 },
  { x: 34.2, y: 48.7, d: 1.2 },
  { x: 40.0, y: 48.7, d: 1.5 },
  { x: 45.8, y: 48.7, d: 1.8 }, // POST /customers
  { x: 51.7, y: 42.5, d: 2.1 },
  { x: 57.6, y: 42.5, d: 2.4 },
  { x: 63.4, y: 42.5, d: 2.7 },
  { x: 69.3, y: 42.5, d: 3.0 },
  { x: 75.1, y: 42.5, d: 3.3 }, // router
  { x: 80.9, y: 17.4, d: 3.8, big: true }, // POST /jobs · install
  { x: 80.9, y: 42.4, d: 3.8, big: true }, // POST /jobs · service
  { x: 80.9, y: 67.7, d: 3.8, big: true }, // POST /jobs · maintenance
  { x: 86.8, y: 23.6, d: 4.4 },
  { x: 86.8, y: 49.1, d: 4.4 },
  { x: 86.8, y: 74.0, d: 4.4 },
]

/* Stage 04 · make.com Get Jobs: scheduled poll walks home, filter chips
   blink as their router branch passes. */
const SPOTS_JOBS: Spot[] = [
  { x: 6.6, y: 43.6, d: 0, big: true }, // scheduled data store
  { x: 12.9, y: 43.4, d: 0.3 },
  { x: 19.3, y: 43.4, d: 0.6 },
  { x: 28.2, y: 43.4, d: 0.9 },
  { x: 37.0, y: 43.4, d: 1.2 },
  { x: 51.6, y: 43.4, d: 1.6, big: true }, // GET jobs
  { x: 61.7, y: 43.6, d: 2.1 }, // router
  { x: 67.9, y: 29.6, d: 2.6 },
  { x: 71.2, y: 52.1, d: 3.0 },
  { x: 67.5, y: 65.5, d: 3.4 },
  { x: 75.1, y: 43.8, d: 3.8 }, // GET invoice
  { x: 81.3, y: 43.8, d: 4.2 }, // router
  { x: 93.5, y: 37.0, d: 4.7 },
  { x: 93.6, y: 52.2, d: 4.7 },
]
const CHIPS_JOBS: RunChip[] = [
  { x: 64, y: 20, d: 2.6, t: 'invoice sent' },
  { x: 78, y: 60, d: 3.0, t: 'progress' },
  { x: 60, y: 74, d: 3.4, t: 'complete' },
  { x: 89, y: 28, d: 4.7, t: 'invoice paid' },
]

function RunOverlay({ spots, chips }: { spots: Spot[]; chips?: RunChip[] }) {
  return (
    <div className={styles.ovl} aria-hidden="true">
      {spots.map((s, i) => (
        <i
          key={i}
          className={`${styles.ring} ${s.big ? styles.ringBig : ''}`}
          style={{ left: `${s.x}%`, top: `${s.y}%`, '--pd': `${s.d}s` } as CSSProperties}
        />
      ))}
      {chips?.map((c) => (
        <span
          key={c.t}
          className={styles.runChip}
          style={{ left: `${c.x}%`, top: `${c.y}%`, '--pd': `${c.d}s` } as CSSProperties}
        >
          {c.t}
        </span>
      ))}
    </div>
  )
}

/* pinned to the frame corner, outside the mobile pan */
function OpsChip({ ops }: { ops: string }) {
  return (
    <span className={styles.opsChip} aria-hidden="true">
      <i className={styles.opsDot} />
      {ops}
    </span>
  )
}

/* Stage 01 · the intake form fills itself: option picked, Next pressed. */
function FormOverlay() {
  return (
    <div className={styles.ovl} aria-hidden="true">
      <i className={styles.pick}>
        <em className={styles.pickTick}>✓</em>
      </i>
      <i className={styles.nextRing} />
    </div>
  )
}

/* Stage 02 · the booking calendar books itself: date pulses, slot locks. */
function CalOverlay() {
  return (
    <div className={styles.ovl} aria-hidden="true">
      <i className={styles.calRing} />
      <i className={styles.calPick}>
        <em className={styles.pickTick}>✓</em>
      </i>
    </div>
  )
}

/* Stage 02 · the GHL workflow walks trigger → tag → webhook, then the
   payload chip fires off toward Make.com. */
function TriggerOverlay() {
  return (
    <div className={styles.ovl} aria-hidden="true">
      <i className={`${styles.hl} ${styles.hlTrig}`} />
      <i className={`${styles.hl} ${styles.hlTag}`} />
      <i className={`${styles.hl} ${styles.hlHook}`} />
      <i className={styles.hookRing} />
      <span className={styles.postChip}>payload → make.com</span>
    </div>
  )
}

function Stage({ st, i }: { st: PipeStage; i: number }) {
  return (
    <div
      ref={rv}
      className={`${styles.stage} ${i % 2 === 1 ? styles.stageR : ''} rv`}
    >
      <div className="wipe">
        <Frame label={st.frameLabel}>
          <div
            className={`${styles.shotBox} ${i >= 3 ? styles.shotWide : ''}`}
            style={{ aspectRatio: st.ratio }}
          >
            {/* overlay lives INSIDE the panner so hotspot %s survive the
                mobile zoom-and-pan */}
            <div className={styles.panner}>
              <img
                className={styles.shot}
                src={st.img}
                alt={st.alt}
                loading="lazy"
              />
              {i === 0 && <FormOverlay />}
              {i === 1 && <CalOverlay />}
              {i === 2 && <TriggerOverlay />}
              {i === 3 && <RunOverlay spots={SPOTS_ST} />}
              {i === 4 && <RunOverlay spots={SPOTS_JOBS} chips={CHIPS_JOBS} />}
            </div>
            {i === 3 && <OpsChip ops="prod · 38 modules" />}
            {i === 4 && <OpsChip ops="ops 240 · 1.1 mb" />}
          </div>
        </Frame>
      </div>
      <div className={styles.meta}>
        <span className={styles.tchip}>{st.t}</span>
        <span className={styles.stepNum}>
          step {st.num} / 0{PIPELINE_STAGES.length}
        </span>
      </div>
      <h3 className={styles.stTitle}>{st.title}</h3>
      <p className={styles.stDesc}>{st.desc}</p>
    </div>
  )
}

export default function Pipeline() {
  const spine = useScrollProgress<HTMLDivElement>()

  return (
    <section id="pipeline" className={styles.pipeline}>
      <div ref={rv} className={`${styles.header} rv`}>
        <h2 className={styles.title}>One lead, end to end</h2>
        <div className={styles.label}>(05) · Pipeline</div>
      </div>
      <p ref={rv} className={`${styles.sub} rv`}>
        A live client system for a trades company: GoHighLevel up front,
        Make.com in the middle, ServiceTitan on the trucks. Follow one lead
        through it.
      </p>

      <div ref={spine} className={styles.spine}>
        <div className={styles.packetTrack} aria-hidden="true">
          <span className={styles.packet}>lead · #4127</span>
        </div>
        {PIPELINE_STAGES.map((st, i) => (
          <Stage key={st.num} st={st} i={i} />
        ))}
      </div>

      <div className={styles.tail}>
        <div ref={rv} className={`${styles.aside} rv`}>
          <div className="wipe">
            <Frame label={PIPELINE_ASIDE.frameLabel}>
              <div
                className={styles.shotBox}
                style={{ aspectRatio: PIPELINE_ASIDE.ratio }}
              >
                <img
                  className={styles.shot}
                  src={PIPELINE_ASIDE.img}
                  alt={PIPELINE_ASIDE.alt}
                  loading="lazy"
                />
                <div className={styles.ovl} aria-hidden="true">
                  <i className={styles.tokRingA} />
                  <i className={styles.tokRingB} />
                  <i className={styles.tokTrack}>
                    <em className={styles.tokDot} />
                  </i>
                  <span className={styles.opsChip}>
                    <i className={styles.opsDot} />
                    ops 9,267 · 46.9 mb
                  </span>
                </div>
              </div>
            </Frame>
          </div>
          <div className={styles.meta}>
            <span className={styles.tchip}>every 15 min</span>
            <span className={styles.stepNum}>keeper</span>
          </div>
          <h3 className={styles.stTitle}>{PIPELINE_ASIDE.title}</h3>
          <p className={styles.stDesc}>{PIPELINE_ASIDE.desc}</p>
        </div>

        <div ref={rv} className={`${styles.platforms} rv`} style={{ '--d': '0.1s' } as CSSProperties}>
          <div className={styles.platKicker}>same spine, other platforms</div>
          <p className={styles.platDesc}>
            The pattern is portable: swap the field-service API, keep the
            spine. Shipped for:
          </p>
          <ul className={styles.platRow}>
            {PIPELINE_PLATFORMS.map((p, i) => (
              <li
                key={p.label}
                className={`${styles.plat} ${p.live ? styles.platLive : ''}`}
                style={{ '--d': `${0.15 + i * 0.08}s` } as CSSProperties}
              >
                <i className={styles.platLetter}>{p.label[0]}</i>
                {p.label}
                {p.live && <em className={styles.platTick}>live</em>}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <NurtureTabs />
    </section>
  )
}
