import { useEffect, useRef } from 'react'
import { WORK_CASES } from '../../data/content'
import { rv } from '../../hooks/useReveal'
import CaseInfo from './CaseInfo'
import Frame from './Frame'
import styles from './Work.module.css'

/** Fake but plausible scrape log — duplicated once for a seamless marquee. */
const LOG = [
  ['GET', '/catalog?page=214', '200', '312ms', '480 rows'],
  ['GET', '/listings/atlanta', '200', '288ms', '96 rows'],
  ['RETRY', '/listings/austin', '429→200', 'backoff 2.1s', '96 rows'],
  ['GET', '/pricing/snapshot', '200', '190ms', '1,204 cells'],
  ['GET', '/reviews?since=24h', '200', '341ms', '2,318 rows'],
  ['PARSE', 'variants · sizes · stock', '·', '44ms', 'ok'],
  ['GET', '/catalog?page=215', '200', '297ms', '480 rows'],
  ['DEDUPE', 'batch #1148', '·', '12ms', '−214 dupes'],
  ['GET', '/sitemap/delta.xml', '200', '141ms', '38 urls'],
  ['WRITE', 's3://pipeline/out.csv', '·', '88ms', 'flushed'],
  ['GET', '/listings/boston', '200', '265ms', '96 rows'],
  ['HEALTH', 'proxies 42/44 · queue 3.1k', '·', '·', 'ok'],
] as const

/**
 * Case 04 — a dark terminal streaming a scrape run: a vertical marquee of
 * log lines and a row counter that keeps ticking while the frame is on
 * screen. No assets — the animation IS the exhibit.
 */
export default function PuppeteerCase() {
  const c = WORK_CASES[3]
  const counter = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const el = counter.current
    if (!el || matchMedia('(prefers-reduced-motion: reduce)').matches) return
    let rows = 47_812
    let raf = 0
    let last = 0
    let running = false
    const tick = (ts: number) => {
      if (!running) return
      const dt = last ? (ts - last) / 1000 : 0
      last = ts
      rows += dt * (900 + Math.sin(ts / 700) * 400)
      el.textContent = Math.floor(rows).toLocaleString('en-US')
      raf = requestAnimationFrame(tick)
    }
    const obs = new IntersectionObserver(
      ([e]) => {
        const on = !!e?.isIntersecting
        if (on && !running) {
          running = true
          last = 0
          raf = requestAnimationFrame(tick)
        } else if (!on) {
          running = false
          cancelAnimationFrame(raf)
        }
      },
      { threshold: 0.3 },
    )
    obs.observe(el)
    return () => {
      running = false
      cancelAnimationFrame(raf)
      obs.disconnect()
    }
  }, [])

  const rows = [...LOG, ...LOG]
  return (
    <article className={`${styles.case} ${styles.caseFlip}`} id={`work-${c.slug}`}>
      <CaseInfo c={c} />
      <div className={styles.stage}>
        <div ref={rv} className={styles.stageMain}>
          <div className="wipe">
            <Frame dark label="node scrape.js --fleet">
            <div className={styles.term} aria-hidden="true">
              <div className={styles.termStat}>
                rows scraped{' '}
                <span ref={counter} className={styles.termCount}>
                  47,812
                </span>
              </div>
              <div className={styles.termViewport}>
                <div className={styles.termScroll}>
                  {rows.map((l, i) => (
                    <div key={i} className={styles.termLine}>
                      <span className={styles.termVerb}>{l[0]}</span>
                      <span className={styles.termPath}>{l[1]}</span>
                      <span className={styles.termMeta}>{l[2]}</span>
                      <span className={styles.termMeta}>{l[3]}</span>
                      <span className={styles.termOk}>{l[4]}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className={styles.termPrompt}>
                $ node scrape.js --all --resume<span className={styles.caret}>▍</span>
              </div>
            </div>
            </Frame>
          </div>
        </div>
      </div>
    </article>
  )
}
