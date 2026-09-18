import { useEffect, useRef } from 'react'
import { OPS } from '../../data/content'
import { rv } from '../../hooks/useReveal'
import Frame from '../Work/Frame'
import OpsCaption from './OpsCaption'
import styles from './Ops.module.css'

/**
 * OP-03: the integration as a live sync diagram. The wire draws on reveal
 * (Stack's language), a dashed terracotta current flows forever, and payload
 * chips (bookings / clients / classes) ride the lane from Mindbody to
 * GoHighLevel on a 9s shared loop, each arrival ringing the G node. A slow
 * record counter keeps ticking while the card is on screen.
 */
export default function MindbodySyncCard() {
  const counter = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const el = counter.current
    if (!el || matchMedia('(prefers-reduced-motion: reduce)').matches) return
    let n = 12_847
    let raf = 0
    let last = 0
    let running = false
    const tick = (ts: number) => {
      if (!running) return
      const dt = last ? (ts - last) / 1000 : 0
      last = ts
      n += dt * 0.45
      el.textContent = Math.floor(n).toLocaleString('en-US')
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

  return (
    <article className={styles.card} id="ops-mindbody-ghl">
      <div ref={rv} className="rv" style={{ '--d': '0.08s' } as React.CSSProperties}>
        <div className="wipe">
          <Frame label="sync daemon · mindbody → gohighlevel">
            <div
              className={styles.syncStage}
              role="img"
              aria-label="Diagram of bookings, clients and classes syncing from Mindbody to GoHighLevel"
            >
              <div className={styles.syncRow}>
                <div className={styles.node}>
                  <span className={styles.nodeChip}>M</span>
                  <span className={styles.nodeName}>Mindbody</span>
                  <span className={styles.nodeSub}>source</span>
                </div>
                <div className={styles.lane} aria-hidden="true">
                  <svg
                    className={styles.laneSvg}
                    viewBox="0 0 100 10"
                    preserveAspectRatio="none"
                  >
                    <path d="M 0 5 H 100" pathLength={1} className={styles.syncWire} />
                    <path d="M 0 5 H 100" pathLength={1} className={styles.syncFlow} />
                  </svg>
                  <span className={`${styles.pTrack} ${styles.p1}`}>
                    <b className={styles.payload}>bookings</b>
                  </span>
                  <span className={`${styles.pTrack} ${styles.p2}`}>
                    <b className={styles.payload}>clients</b>
                  </span>
                  <span className={`${styles.pTrack} ${styles.p3}`}>
                    <b className={styles.payload}>classes</b>
                  </span>
                </div>
                <div className={styles.node}>
                  <span className={styles.nodeChip}>
                    G<i className={styles.ping} />
                    <em className={styles.arriveTick}>✓</em>
                  </span>
                  <span className={styles.nodeName}>GoHighLevel</span>
                  <span className={styles.nodeSub}>destination</span>
                </div>
              </div>
              <div className={styles.syncStat} aria-hidden="true">
                records synced{' '}
                <span ref={counter} className={styles.syncCount}>
                  12,847
                </span>
              </div>
            </div>
          </Frame>
        </div>
      </div>
      <OpsCaption c={OPS[2]} d={0.2} />
    </article>
  )
}
