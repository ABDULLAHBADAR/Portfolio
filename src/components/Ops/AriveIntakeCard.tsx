import { useState } from 'react'
import type { CSSProperties } from 'react'
import { OPS } from '../../data/content'
import { rv } from '../../hooks/useReveal'
import Frame from '../Work/Frame'
import OpsCaption from './OpsCaption'
import styles from './Ops.module.css'

/**
 * OP-06: ARIVE → Zapier → GHL loan intake, shown through the real builder
 * captures (sanitized derivatives in public/work/arive-ghl/web/ — client
 * title bars and stage-name rows cropped at derivation; originals in
 * repo-root work-src/zapier-arive-ghl). A Callyniq-style segmented control
 * swaps three views inside one frame: the Zapier trigger Zap, the GHL
 * workflow (dedupe + GPT field mapping), and the lead-source branch fan.
 * Calm by design: slow auto-pans in a fixed window, two soft pulse rings on
 * the workflow's key nodes, nothing else moves.
 */

const VIEWS = [
  {
    key: 'zap',
    label: 'Zapier',
    src: `${import.meta.env.BASE_URL}work/arive-ghl/web/intake-zap.jpg`,
    alt: 'Zapier Zap: a new loan in ARIVE triggers an AI normalize step, a filter and a webhook post into GoHighLevel',
    pan: '-39%',
    axis: 'y',
  },
  {
    key: 'workflow',
    label: 'GHL workflow',
    src: `${import.meta.env.BASE_URL}work/arive-ghl/web/intake-workflow.jpg`,
    alt: 'GoHighLevel workflow receiving the webhook: find contact, then GPT field mapping and create contact for brand-new leads',
    pan: '-17%',
    axis: 'y',
  },
  {
    key: 'branches',
    label: 'Source branches',
    src: `${import.meta.env.BASE_URL}work/arive-ghl/web/intake-branches.jpg`,
    alt: 'Ten lead-source branches in the GoHighLevel workflow, each creating a source-tagged opportunity',
    pan: '-34%',
    axis: 'x',
  },
] as const

export default function AriveIntakeCard() {
  const [active, setActive] = useState<(typeof VIEWS)[number]['key']>('workflow')

  return (
    <article className={styles.card} id="ops-arive-ghl-intake">
      <div ref={rv} className="rv">
        <div className="wipe">
          <Frame label="arive → zapier → ghl · loan intake">
            <div className={styles.lcWin}>
              {VIEWS.map((v) => (
                <div
                  key={v.key}
                  className={`${styles.lcShot} ${active === v.key ? styles.lcShotOn : ''}`}
                >
                  <div
                    className={`${styles.lcPan} ${v.axis === 'x' ? styles.lcPanX : styles.lcPanY}`}
                    style={{ '--pan': v.pan } as CSSProperties}
                  >
                    <img src={v.src} alt={v.alt} loading="lazy" />
                    {v.key === 'workflow' && (
                      <>
                        <i
                          className={styles.lcPulse}
                          style={{ left: '36.4%', top: '6.5%' } as CSSProperties}
                          aria-hidden="true"
                        />
                        <i
                          className={styles.lcPulse}
                          style={{ left: '68%', top: '63%', '--pd': '3s' } as CSSProperties}
                          aria-hidden="true"
                        />
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Frame>
        </div>
        <div className={styles.lcSeg} role="tablist" aria-label="Loan intake views">
          {VIEWS.map((v) => (
            <button
              key={v.key}
              role="tab"
              aria-selected={active === v.key}
              className={`${styles.lcSegBtn} ${active === v.key ? styles.lcSegOn : ''}`}
              onClick={() => setActive(v.key)}
            >
              {v.label}
            </button>
          ))}
        </div>
      </div>
      <OpsCaption c={OPS[5]} d={0.12} />
    </article>
  )
}
