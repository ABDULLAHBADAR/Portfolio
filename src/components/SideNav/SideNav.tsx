import { useEffect, useRef, useState } from 'react'
import styles from './SideNav.module.css'

/**
 * The survey rail: a fixed drafting-ruler nav on the right edge. Ticks and
 * mono indices per section; hovering the rail (or keyboard focus) reveals
 * the label chips; the active section reads terracotta with its label held
 * open. Hidden while the hero is on screen (the hero stays chrome-free) and
 * on phones. Clicking glides to the section; reduced motion jumps.
 *
 * Indices mirror the on-page section labels ((01) About … (09) Contact);
 * `child` rows are specific pieces of work worth direct access.
 */

interface NavItem {
  id: string
  num?: string // omitted on child rows
  label: string
  child?: boolean
}

const ITEMS: NavItem[] = [
  { id: 'about', num: '01', label: 'about' },
  { id: 'stack', num: '02', label: 'toolkit' },
  { id: 'work', num: '03', label: 'products' },
  { id: 'builds', num: '04', label: 'site rebuilds' },
  { id: 'ops', num: '05', label: 'scrapers · ops' },
  { id: 'ops-tilda-n8n-ghl', label: 'n8n · tilda', child: true },
  { id: 'ops-arive-ghl-intake', label: 'zapier · arive', child: true },
  { id: 'pipeline', num: '06', label: 'make · servicetitan' },
  { id: 'experience', num: '07', label: 'experience' },
  { id: 'services', num: '08', label: 'services' },
  { id: 'contact', num: '09', label: 'contact' },
]

export default function SideNav() {
  const [shown, setShown] = useState(false)
  const [active, setActive] = useState('')
  const ratios = useRef<Map<string, number>>(new Map())

  /* appear only once the hero has left the viewport */
  useEffect(() => {
    const hero = document.querySelector('#top > section')
    if (!hero) return
    const io = new IntersectionObserver(
      ([e]) => setShown(!e?.isIntersecting),
      { threshold: 0 },
    )
    io.observe(hero)
    return () => io.disconnect()
  }, [])

  /* scrollspy: the most-visible target wins; child targets outrank their
     section while they dominate the viewport */
  useEffect(() => {
    const els = ITEMS.map((i) => document.getElementById(i.id)).filter(
      (el): el is HTMLElement => !!el,
    )
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries)
          ratios.current.set(e.target.id, e.isIntersecting ? e.intersectionRatio : 0)
        let best = ''
        let bestR = 0.08 // ignore slivers
        for (const [id, r] of ratios.current) {
          if (r > bestR) {
            best = id
            bestR = r
          }
        }
        if (best) setActive(best)
      },
      { threshold: [0.1, 0.25, 0.5, 0.75] },
    )
    els.forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [])

  const go = (id: string) => (ev: React.MouseEvent) => {
    ev.preventDefault()
    const el = document.getElementById(id)
    if (!el) return
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches
    el.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' })
    history.replaceState(null, '', `#${id}`)
  }

  return (
    <nav
      className={`${styles.rail} ${shown ? styles.railOn : ''}`}
      aria-label="Section index"
    >
      {ITEMS.map((item, i) => (
        <a
          key={item.id}
          href={`#${item.id}`}
          onClick={go(item.id)}
          className={`${styles.item} ${item.child ? styles.itemChild : ''} ${
            active === item.id ? styles.itemOn : ''
          }`}
          style={{ '--d': `${i * 0.045}s` } as React.CSSProperties}
          aria-current={active === item.id ? 'true' : undefined}
        >
          <span className={styles.lbl}>{item.label}</span>
          {item.num && <span className={styles.num}>{item.num}</span>}
          <i className={styles.tick} aria-hidden="true" />
        </a>
      ))}
    </nav>
  )
}
