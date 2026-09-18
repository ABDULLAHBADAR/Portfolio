import { Fragment, useEffect, useRef } from 'react'
import { STATS } from '../../data/content'
import { rv } from '../../hooks/useReveal'
import styles from './About.module.css'

/* The statement rises word by word from behind line masks (the `wm`
   primitive in global.css); the emphasised phrase then underlines itself.
   Split into segments so the em words carry their own style. */
const SEG_A =
  "I'm a full-stack developer with 3+ years turning rough ideas into production web apps. I work end-to-end in React, Next.js and Node, then wire everything together with"
const SEG_EM = 'automation and AI'
const SEG_B = 'so the product keeps moving without me.'

function Words({
  text,
  from,
  em = false,
}: {
  text: string
  from: number
  em?: boolean
}) {
  return (
    <>
      {text.split(' ').map((w, i) => (
        <Fragment key={i}>
          <span className="wm">
            <span
              className={em ? styles.em : undefined}
              style={{ '--d': `${(from + i) * 0.024}s` } as React.CSSProperties}
            >
              {w}
            </span>
          </span>{' '}
        </Fragment>
      ))}
    </>
  )
}

/** Counts a leading integer up from 0 the first time it scrolls into view;
 *  non-numeric values ("Full", "AI") just reveal. */
function StatValue({ value }: { value: string }) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const m = /^(\d+)(.*)$/.exec(value)
    if (!m || matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const target = parseInt(m[1], 10)
    const suffix = m[2]
    const obs = new IntersectionObserver(
      ([e]) => {
        if (!e?.isIntersecting) return
        obs.disconnect()
        const t0 = performance.now()
        const dur = 1100
        const tick = (ts: number) => {
          const p = Math.min(1, (ts - t0) / dur)
          const eased = 1 - Math.pow(1 - p, 3)
          el.textContent = Math.round(eased * target) + suffix
          if (p < 1) requestAnimationFrame(tick)
        }
        requestAnimationFrame(tick)
      },
      { threshold: 0.6 },
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [value])
  return (
    <div ref={ref} className={styles.statValue}>
      {value}
    </div>
  )
}

export default function About() {
  const aWords = SEG_A.split(' ').length
  const emWords = SEG_EM.split(' ').length
  return (
    <section id="about" className={styles.about}>
      <div className={styles.grid}>
        <div ref={rv} className={`${styles.label} rv`}>
          (01) · About
        </div>
        <div>
          <p ref={rv} className={styles.statement}>
            <Words text={SEG_A} from={0} />
            <Words text={SEG_EM} from={aWords} em />
            <Words text={SEG_B} from={aWords + emWords} />
          </p>
          <div className={styles.stats}>
            {STATS.map((s, i) => (
              <div
                key={s.label}
                ref={rv}
                className={`${styles.stat} rv`}
                style={{ '--d': `${0.55 + i * 0.11}s` } as React.CSSProperties}
              >
                <div className="wm">
                  <StatValue value={s.value} />
                </div>
                <div className={styles.statLabel}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
