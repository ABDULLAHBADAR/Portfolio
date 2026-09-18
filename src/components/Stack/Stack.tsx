import { useEffect, useRef, useState } from 'react'
import { STACK_COLUMNS } from '../../data/content'
import { rv } from '../../hooks/useReveal'
import TechIcon from '../icons/TechIcon'
import styles from './Stack.module.css'

interface Wireframe {
  w: number
  h: number
  bus: string
  rails: string[]
  stubs: string[]
}

/**
 * The toolkit as a LIVING SCHEMATIC. A signal bus runs above the columns;
 * on reveal the wires draw themselves column by column, every chip powers
 * on with a terracotta flash as its stub connects, and then a dashed
 * terracotta current flows through the whole diagram forever (with icons
 * that occasionally nudge, so the section never fully sits still).
 *
 * Wire geometry is MEASURED from the live layout (ResizeObserver + fonts
 * ready), so it survives any breakpoint. Paths are pathLength-normalized:
 * draw = dashoffset 1→0, flow = dash pattern sliding forever.
 */
export default function Stack() {
  const diagRef = useRef<HTMLDivElement | null>(null)
  const [wires, setWires] = useState<Wireframe | null>(null)

  useEffect(() => {
    const diag = diagRef.current
    if (!diag) return
    let raf = 0
    const build = () => {
      const wr = diag.getBoundingClientRect()
      if (wr.width < 10) return
      const busY = 12.5
      const rails: string[] = []
      const stubs: string[] = []
      let x1 = Infinity
      let x2 = -Infinity
      diag.querySelectorAll<HTMLElement>('[data-col]').forEach((col) => {
        const chips = col.querySelectorAll<HTMLElement>('[data-chip]')
        if (!chips.length) return
        const colR = col.getBoundingClientRect()
        const railX = Math.round(colR.left - wr.left - 12) + 0.5
        let lastY = busY
        chips.forEach((ch) => {
          const r = ch.getBoundingClientRect()
          const cy = Math.round(r.top - wr.top + r.height / 2) + 0.5
          stubs.push(`M ${railX} ${cy} H ${Math.round(r.left - wr.left)}`)
          lastY = Math.max(lastY, cy)
        })
        rails.push(`M ${railX} ${busY} V ${lastY}`)
        x1 = Math.min(x1, railX)
        x2 = Math.max(x2, railX)
      })
      if (rails.length) {
        setWires({
          w: Math.round(wr.width),
          h: Math.round(wr.height),
          bus: `M ${x1} ${busY} H ${x2}`,
          rails,
          stubs,
        })
      }
    }
    const queue = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(build)
    }
    queue()
    const ro = new ResizeObserver(queue)
    ro.observe(diag)
    document.fonts?.ready.then(queue).catch(() => {})
    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
    }
  }, [])

  return (
    <section id="stack" className={styles.stack}>
      <div ref={rv} className={`${styles.header} rv`}>
        <h2 className={styles.title}>The toolkit</h2>
        <div className={styles.label}>(02) · Stack</div>
      </div>
      <div
        ref={(el) => {
          diagRef.current = el
          rv(el)
        }}
        className={styles.diagram}
      >
        {wires && (
          <svg
            className={styles.wires}
            width={wires.w}
            height={wires.h}
            viewBox={`0 0 ${wires.w} ${wires.h}`}
            aria-hidden="true"
          >
            <path className={styles.wire} d={wires.bus} pathLength={1} />
            {wires.rails.map((d, i) => (
              <path
                key={`r${i}`}
                className={styles.wire}
                d={d}
                pathLength={1}
                style={{ '--wd': `${0.3 + i * 0.12}s` } as React.CSSProperties}
              />
            ))}
            {wires.stubs.map((d, i) => (
              <path
                key={`s${i}`}
                className={styles.wire}
                d={d}
                pathLength={1}
                style={{ '--wd': `${0.55 + i * 0.05}s` } as React.CSSProperties}
              />
            ))}
            <path className={styles.flow} d={wires.bus} pathLength={1} />
            {wires.rails.map((d, i) => (
              <path key={`f${i}`} className={styles.flow} d={d} pathLength={1} />
            ))}
          </svg>
        )}
        <div className={styles.busLabel}>
          signal · live <i />
        </div>
        <div className={styles.columns}>
          {STACK_COLUMNS.map((col, ci) => (
            <div key={col.title} data-col>
              <div
                ref={rv}
                className={`${styles.colLabel} rv`}
                style={{ '--d': `${ci * 0.12}s` } as React.CSSProperties}
              >
                {col.title}
              </div>
              <div className={styles.chips}>
                {col.chips.map((chip, i) => (
                  <div
                    key={chip.label}
                    ref={rv}
                    data-chip
                    className="rv rv-scale"
                    style={
                      { '--d': `${0.7 + ci * 0.12 + i * 0.07}s` } as React.CSSProperties
                    }
                  >
                    <div className={styles.chip}>
                      <TechIcon slug={chip.slug} letter={chip.letter} size={22} alt="" />
                      <span className={styles.chipLabel}>{chip.label}</span>
                    </div>
                  </div>
                ))}
                {col.note && (
                  <div
                    ref={rv}
                    className={`${styles.note} rv`}
                    style={{ '--d': `${0.95 + ci * 0.12}s` } as React.CSSProperties}
                  >
                    {col.note}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
