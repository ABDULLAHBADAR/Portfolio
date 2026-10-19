import { useEffect, useMemo, useRef, useState } from 'react'
import { rv } from '../../hooks/useReveal'
import Frame from '../Work/Frame'
import {
  ALL_SPECIMENS,
  DEFAULT_SPECIMEN,
  SPECIMEN_BASE,
  SPECIMEN_GROUPS,
  specimenUrl,
} from '../../data/specimens'
import styles from './Specimens.module.css'

/**
 * Forty-six spec rebuilds, shown as live specimens rather than screenshots.
 *
 * A drafting index on the left lists every build; the stage on the right
 * loads the selected one into a real iframe inside the shared browser frame
 * (../Work/Frame), rendered at DESIGN_WIDTH and scaled down so the frame
 * shows each site's desktop design instead of its tablet fallback.
 *
 * Three things keep that honest: the iframe mounts only once the section is
 * near the viewport, only one is ever mounted, and it starts inert behind a
 * shield so scrolling past the section never gets captured by the preview.
 * Below VIEWER_MQ the stage is dropped entirely and the index rows act as
 * what they already are, plain links to the live previews.
 */

/** width each preview is rendered at before being scaled to fit */
const DESIGN_WIDTH = 1440

/** narrower than this, a desktop-width preview is not worth showing.
    Mirrors the 860px mobile breakpoint the rest of the page uses. */
const VIEWER_MQ = '(min-width: 861px)'

const STATS = [
  { v: '46', k: 'rebuilds published' },
  { v: '21 / 25', k: 'Ontario / United States' },
  { v: '58k', k: 'lines of HTML and CSS' },
  { v: '0', k: 'frameworks or build steps' },
]

const matches = () =>
  typeof matchMedia === 'undefined' || matchMedia(VIEWER_MQ).matches

export default function Specimens() {
  const [active, setActive] = useState(DEFAULT_SPECIMEN)
  /* Tracked as state, not sampled once: the viewport crosses this breakpoint
     without a reload every time a tablet is rotated (iPad portrait 820px ->
     landscape 1180px), and the CSS reveals the stage on its own. If this
     were read only at mount, that rotation would expose a stage that can
     never arm. */
  const [wide, setWide] = useState(matches)
  /** section is close enough to be worth loading a preview for */
  const [armed, setArmed] = useState(false)
  const [loaded, setLoaded] = useState(false)
  /** shield lifted: the preview now takes pointer and wheel events */
  const [live, setLive] = useState(false)
  const viewer = useRef<HTMLDivElement>(null)
  const screen = useRef<HTMLDivElement>(null)
  const rail = useRef<HTMLDivElement>(null)
  const centered = useRef(false)

  const current = useMemo(
    () => ALL_SPECIMENS.find((s) => s.slug === active) ?? ALL_SPECIMENS[0],
    [active],
  )

  useEffect(() => {
    if (typeof matchMedia === 'undefined') return
    const mq = matchMedia(VIEWER_MQ)
    const onChange = () => {
      setWide(mq.matches)
      /* dropping below the breakpoint unmounts the preview, so come back up
         with a clean loading state rather than a stale "already loaded" one */
      if (!mq.matches) {
        setLoaded(false)
        setLive(false)
      }
    }
    mq.addEventListener('change', onChange)
    onChange()
    return () => mq.removeEventListener('change', onChange)
  }, [])

  /* mount the first preview only once the section is nearly on screen, and
     never on phones, where the stage is not rendered at all */
  useEffect(() => {
    const el = viewer.current
    if (!el || !wide || armed) return
    const io = new IntersectionObserver(
      ([e]) => {
        if (e?.isIntersecting) {
          setArmed(true)
          io.disconnect()
        }
      },
      { rootMargin: '300px 0px' },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [wide, armed])

  /* the previews are built for desktop, so render one at DESIGN_WIDTH and
     scale it to whatever the stage is actually wide */
  useEffect(() => {
    const el = screen.current
    if (!el) return
    const ro = new ResizeObserver(([e]) => {
      const w = e?.contentRect.width ?? el.clientWidth
      if (w) el.style.setProperty('--scale', String(w / DESIGN_WIDTH))
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  /* open with the active row in view. The default specimen sits partway down
     the index, and a highlighted row nobody can see reads as a bug. Only once,
     and only where a selection means anything: below the breakpoint nothing is
     selected, so centering there would just open the list at a random row.
     Scrolls the rail, never the page. */
  useEffect(() => {
    if (!wide || centered.current) return
    const r = rail.current
    const row = r?.querySelector<HTMLElement>(`[data-slug="${DEFAULT_SPECIMEN}"]`)
    if (!r || !row) return
    centered.current = true
    r.scrollTop +=
      row.getBoundingClientRect().top -
      r.getBoundingClientRect().top -
      (r.clientHeight - row.clientHeight) / 2
  }, [wide])

  const select = (slug: string) => {
    /* re-picking the row already on stage must not clear `loaded`: the iframe
       keeps its key and src, so it never reloads and onLoad never fires again,
       which would strand the loading overlay over a working preview */
    if (slug === active) return
    setActive(slug)
    setLoaded(false)
    setLive(false)
  }

  /* rows are real links to the preview. On a wide screen a plain left click
     loads it into the stage instead; modified clicks keep opening a tab. */
  const pick = (slug: string) => (e: React.MouseEvent) => {
    if (!wide || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
    e.preventDefault()
    select(slug)
  }

  /* Steps from the row that actually holds focus, not from the selected one.
     Those differ the moment someone tabs into the rail, and stepping from the
     selection would fling focus across the list. */
  const onKey = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if ((e.key !== 'ArrowDown' && e.key !== 'ArrowUp') || !wide) return
    const from = (e.target as HTMLElement).closest?.('[data-slug]')
    const i = from
      ? ALL_SPECIMENS.findIndex((s) => s.slug === (from as HTMLElement).dataset.slug)
      : -1
    if (i < 0) return
    e.preventDefault()
    const n =
      (i + (e.key === 'ArrowDown' ? 1 : -1) + ALL_SPECIMENS.length) %
      ALL_SPECIMENS.length
    const next = ALL_SPECIMENS[n]
    select(next.slug)
    const row = rail.current?.querySelector<HTMLAnchorElement>(
      `[data-slug="${next.slug}"]`,
    )
    row?.focus({ preventScroll: true })
    row?.scrollIntoView({ block: 'nearest' })
  }

  let n = 0

  return (
    <section id="builds" className={styles.builds}>
      <div ref={rv} className={`${styles.header} rv`}>
        <h2 className={styles.title}>Rebuilt before the pitch</h2>
        <div className={styles.label}>(09) · Builds</div>
      </div>

      <div className={styles.intro}>
        <p ref={rv} className={`${styles.lede} rv`}>
          Forty six heating and cooling companies, each one rebuilt from scratch
          before I ever wrote to them. No framework, no build step, no
          dependencies: hand written HTML and CSS, one shared 125 line motion
          script, and a design that belongs to that business alone. Nobody
          commissioned these. They are how I open the conversation.
        </p>
        <dl className={styles.stats}>
          {STATS.map((s, i) => (
            <div
              key={s.k}
              ref={rv}
              className={`${styles.stat} rv`}
              style={{ '--d': `${0.1 + i * 0.07}s` } as React.CSSProperties}
            >
              <dt className={styles.statV}>{s.v}</dt>
              <dd className={styles.statK}>{s.k}</dd>
            </div>
          ))}
        </dl>
      </div>

      <div ref={viewer} className={styles.viewer}>
        {/* ---- the index ---- */}
        <div
          ref={rv}
          className={`${styles.indexCol} rv rv-left`}
          onKeyDown={onKey}
        >
          <div className={styles.indexHead}>
            <span>Index</span>
            <span className={styles.indexCount}>46</span>
          </div>
          <div ref={rail} className={styles.rail}>
            {SPECIMEN_GROUPS.map((g) => (
              <div key={g.key} className={styles.group}>
                <div className={styles.groupLabel}>
                  {g.label}
                  <i className={styles.groupRule} />
                  <span>{g.items.length}</span>
                </div>
                {g.items.map((s) => {
                  n += 1
                  const on = s.slug === active
                  return (
                    <a
                      key={s.slug}
                      href={specimenUrl(s)}
                      target="_blank"
                      rel="noopener noreferrer nofollow"
                      data-slug={s.slug}
                      onClick={pick(s.slug)}
                      aria-current={on ? 'true' : undefined}
                      className={`${styles.row} ${on ? styles.rowOn : ''}`}
                    >
                      <span className={styles.rowNum}>
                        {String(n).padStart(2, '0')}
                      </span>
                      <span className={styles.rowName}>{s.name}</span>
                      <span className={styles.rowLoc}>
                        {s.city}, {s.region}
                      </span>
                    </a>
                  )
                })}
              </div>
            ))}
          </div>
        </div>

        {/* ---- the stage ---- */}
        <div className={styles.stageCol}>
          <div ref={rv} className={styles.stageMain}>
            <div className="wipe">
              <Frame label={`${SPECIMEN_BASE.replace('https://', '')}/${current.slug}/`}>
                <div ref={screen} className={styles.screen}>
                  {wide && armed && (
                    <iframe
                      key={current.slug}
                      className={styles.pane}
                      src={specimenUrl(current)}
                      title={`${current.name} preview`}
                      loading="lazy"
                      referrerPolicy="no-referrer"
                      sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"
                      onLoad={() => setLoaded(true)}
                      tabIndex={live ? 0 : -1}
                    />
                  )}
                  {!loaded && (
                    <div className={styles.loading}>
                      <i className={styles.loadingBar} />
                      <span>loading {current.slug}</span>
                    </div>
                  )}
                  {/* keeps the page scrolling past the section until asked */}
                  {loaded && !live && (
                    <button
                      type="button"
                      className={styles.shield}
                      onClick={() => setLive(true)}
                    >
                      <span className={styles.shieldHint}>
                        click to scroll inside
                      </span>
                    </button>
                  )}
                </div>
              </Frame>
            </div>
          </div>

          <div ref={rv} className={`${styles.meta} rv`} style={{ '--d': '0.1s' } as React.CSSProperties}>
            <div className={styles.metaMain}>
              <span className={styles.metaName}>{current.name}</span>
              {current.line && (
                <span className={styles.metaLine}>{current.line}</span>
              )}
            </div>
            <div className={styles.metaFacts}>
              <span>
                {current.city}, {current.region}
              </span>
              <span className={styles.metaDot} aria-hidden="true">
                ·
              </span>
              <span>{current.sections} sections</span>
              {current.video && (
                <>
                  <span className={styles.metaDot} aria-hidden="true">
                    ·
                  </span>
                  <span>video</span>
                </>
              )}
              <a
                className={styles.metaLink}
                href={specimenUrl(current)}
                target="_blank"
                rel="noopener noreferrer nofollow"
              >
                open preview <span aria-hidden="true">↗</span>
              </a>
              {current.source && (
                <a
                  className={`${styles.metaLink} ${styles.metaLinkQuiet}`}
                  href={current.source}
                  target="_blank"
                  rel="noopener noreferrer nofollow"
                >
                  original site <span aria-hidden="true">↗</span>
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
