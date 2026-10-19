import { useEffect, useRef, useState } from 'react'
import { WORK_CASES } from '../../data/content'
import { rv } from '../../hooks/useReveal'
import CaseInfo from './CaseInfo'
import Frame from './Frame'
import styles from './Work.module.css'

const VIEWS = [
  { key: 'landing', label: 'Landing', src: `${import.meta.env.BASE_URL}work/callyniq/callyniq-landing-16x9.mp4`, poster: `${import.meta.env.BASE_URL}work/callyniq/web/landing-poster.jpg` },
  { key: 'dashboard', label: 'Dashboard', src: `${import.meta.env.BASE_URL}work/callyniq/callyniq-dashboard-tour.mp4`, poster: `${import.meta.env.BASE_URL}work/callyniq/web/dashboard-poster.jpg` },
] as const

/**
 * Case 02 — two product tours in one frame. A mono segmented control
 * crossfades between the landing and dashboard recordings; only the visible
 * one plays, and only while the stage is on screen. An animated waveform
 * next to the copy carries the "voice" read.
 */
export default function CallyniqCase() {
  const c = WORK_CASES[1]
  const [active, setActive] = useState<(typeof VIEWS)[number]['key']>('landing')
  const [inView, setInView] = useState(false)
  const stageRef = useRef<HTMLDivElement>(null)
  const vids = useRef<Record<string, HTMLVideoElement | null>>({})

  useEffect(() => {
    const stage = stageRef.current
    if (!stage) return
    const obs = new IntersectionObserver(
      ([e]) => setInView(!!e?.isIntersecting),
      { threshold: 0.3 },
    )
    obs.observe(stage)
    return () => obs.disconnect()
  }, [])

  useEffect(() => {
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches
    // dataset.want marks the video that SHOULD be playing, so the deferred
    // canplay retry (data not buffered / decoder pressure) can check intent
    // instead of resurrecting a video the user has toggled away from.
    const start = (el: HTMLVideoElement) => {
      el.dataset.want = '1'
      if (el.preload === 'none') el.preload = 'auto'
      el.muted = true
      el.play().catch(() => {
        el.addEventListener(
          'canplay',
          () => {
            if (el.dataset.want === '1' && el.paused) el.play().catch(() => {})
          },
          { once: true },
        )
      })
    }
    for (const v of VIEWS) {
      const el = vids.current[v.key]
      if (!el) continue
      if (!reduced && inView && v.key === active) start(el)
      else {
        delete el.dataset.want
        el.pause()
      }
      if (reduced) el.controls = v.key === active
    }
    if (reduced) return
    // resume after a tab hide/freeze pauses media (observer won't refire)
    const onVis = () => {
      const el = vids.current[active]
      if (!document.hidden && inView && el && el.paused) start(el)
    }
    document.addEventListener('visibilitychange', onVis)
    return () => document.removeEventListener('visibilitychange', onVis)
  }, [inView, active])

  return (
    <article className={`${styles.case} ${styles.caseFlip}`} id={`work-${c.slug}`}>
      <CaseInfo c={c}>
        <div ref={rv} className={`${styles.wave} rv`} style={{ '--d': '0.15s' } as React.CSSProperties} aria-hidden="true">
          {Array.from({ length: 7 }, (_, i) => (
            <i key={i} style={{ '--wi': i } as React.CSSProperties} />
          ))}
          <span className={styles.waveLabel}>on call · 24/7</span>
        </div>
      </CaseInfo>
      <div ref={stageRef} className={styles.stage}>
        <div ref={rv} className={styles.stageMain}>
          <div className="wipe">
            <Frame label={`callyniq.onrender.com · ${active}`}>
            <div className={styles.mediaStack}>
              {VIEWS.map((v) => (
                <video
                  key={v.key}
                  ref={(el) => {
                    vids.current[v.key] = el
                  }}
                  className={`${styles.media} ${styles.mediaLayer} ${
                    active === v.key ? styles.mediaOn : ''
                  }`}
                  src={v.src}
                  poster={v.poster}
                  muted
                  loop
                  playsInline
                  preload="none"
                  disablePictureInPicture
                />
              ))}
            </div>
            </Frame>
          </div>
          <div className={styles.segmented} role="tablist" aria-label="Callyniq views">
            {VIEWS.map((v) => (
              <button
                key={v.key}
                role="tab"
                aria-selected={active === v.key}
                className={`${styles.segBtn} ${active === v.key ? styles.segOn : ''}`}
                onClick={() => setActive(v.key)}
              >
                {v.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </article>
  )
}
