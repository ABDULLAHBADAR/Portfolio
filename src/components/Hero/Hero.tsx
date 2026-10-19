import type { CSSProperties } from 'react'
import { CUTOUT_SRC, useScanReveal } from '../../hooks/useScanReveal'
import styles from './Hero.module.css'

/* The six morphing background blobs (unique per element → inline styles).
   Blurred gradient blobs animate TRANSFORM ONLY (ar-drift*): morphing
   border-radius under a 30px blur re-rasterizes the layer every frame and
   tanked the whole hero to ~22fps on integrated GPUs. The blur hides the
   radius morph anyway; the two crisp border-outline shapes keep ar-morph. */
const BG_BLOBS: CSSProperties[] = [
  {
    left: -170,
    top: 30,
    width: 560,
    height: 520,
    background:
      'radial-gradient(circle at 50% 50%,rgba(26,23,18,.075),rgba(26,23,18,0) 70%)',
    filter: 'blur(30px)',
    borderRadius: '50%',
    willChange: 'transform',
    animation: 'ar-drift1 16s ease-in-out infinite',
  },
  {
    right: -130,
    top: -70,
    width: 600,
    height: 560,
    background:
      'radial-gradient(circle at 50% 50%,rgba(26,23,18,.06),rgba(26,23,18,0) 72%)',
    filter: 'blur(34px)',
    borderRadius: '50%',
    willChange: 'transform',
    animation: 'ar-drift2 21s ease-in-out infinite',
  },
  {
    left: '30%',
    bottom: -170,
    width: 520,
    height: 480,
    background:
      'radial-gradient(circle at 50% 50%,rgba(154,90,62,.13),rgba(154,90,62,0) 68%)',
    filter: 'blur(32px)',
    borderRadius: '50%',
    willChange: 'transform',
    animation: 'ar-drift3 18s ease-in-out infinite',
  },
  {
    left: '34%',
    top: 60,
    width: 360,
    height: 340,
    background:
      'radial-gradient(circle at 50% 50%,rgba(206,156,116,.14),rgba(206,156,116,0) 66%)',
    filter: 'blur(26px)',
    borderRadius: '50%',
    willChange: 'transform',
    animation: 'ar-drift1 23s ease-in-out infinite reverse',
  },
  {
    left: '6%',
    top: '38%',
    width: 520,
    height: 470,
    border: '1px solid rgba(26,23,18,.06)',
    borderRadius: '42% 58% 60% 40%/45% 42% 58% 55%',
    willChange: 'transform',
    animation: 'ar-drift2 25s ease-in-out infinite',
  },
  {
    right: '9%',
    top: '26%',
    width: 620,
    height: 540,
    border: '1px solid rgba(26,23,18,.05)',
    borderRadius: '50% 50% 40% 60%/55% 45% 55% 45%',
    willChange: 'transform',
    animation: 'ar-drift3 28s ease-in-out infinite reverse',
  },
]

export default function Hero() {
  const {
    heroRef,
    canvasRef,
    revealRef,
    hintRef,
    photoRef,
    onMouseMove,
    onMouseEnter,
    onMouseLeave,
  } = useScanReveal()

  return (
    <section
      ref={heroRef}
      className={styles.hero}
      onMouseMove={onMouseMove}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {/* bubbly morphing background */}
      {BG_BLOBS.map((style, i) => (
        <div
          key={i}
          className={styles.bgBlob}
          style={{ position: 'absolute', zIndex: 0, ...style }}
        />
      ))}

      {/* wordmark (replaces nav) */}
      <div className={styles.wordmark}>
        <span className={styles.wordmarkChip}>A</span>Abdullah
      </div>
      <a href="#contact" className={styles.navPill}>
        Let&apos;s talk →
      </a>

      {/* default content — data-bp marks what the blueprint redraws in place */}
      <div className={styles.contentGrid}>
        <div>
          <div className={styles.role} data-bp="role">
            AI &amp; Automation Expert
          </div>
          <div className={styles.eyebrow} data-bp="eyebrow">
            Automation · GHL · n8n · Make · 4+ years
          </div>
          <div className={styles.eyebrow} data-bp="eyebrow">
            Full-stack developer · 6+ years
          </div>
          <div className={styles.serifSub} data-bp="serifSub">
            building since 2020
          </div>
          <h1 className={styles.title} data-bp="title">
            Abdullah
          </h1>
          <p className={styles.lead} data-bp="lead">
            I build full-stack web products, and the{' '}
            <span className={styles.leadItalic}>automation</span> that quietly runs
            them.
          </p>
          <div className={styles.btnRow} data-bp="btnRow">
            <a href="#work" className={styles.btnPrimary}>
              View work ↘
            </a>
            <a href="#contact" className={styles.btnSecondary}>
              Get in touch
            </a>
          </div>
        </div>
        <div />
      </div>

      {/* portrait cut-out — sits directly on the paper, no photo rectangle */}
      <img
        ref={photoRef}
        src={CUTOUT_SRC}
        alt="Abdullah"
        className={styles.photo}
      />

      {/* three.js layer — paints the blueprint state inside the scanner field
          (pointer-events pass through; DOM below stays live) */}
      <canvas ref={canvasRef} className={styles.glCanvas} aria-hidden="true" />

      {/* DOM blueprint layer — only for the no-WebGL clip fallback and the
          reduced-motion CSS pass; hidden entirely while the GL layer runs.
          It duplicates the hero text with the SAME classes (identical layout
          by construction) plus schematic overrides, so the reveal reads as
          the same hero turning into its blueprint — chrome-free. */}
      <div ref={revealRef} className={styles.reveal} aria-hidden="true">
        <div className={styles.fbGrid} />
        <div className={styles.revealLabel}>// under the hood</div>
        <div className={`${styles.contentGrid} ${styles.fbText}`}>
          <div>
            <div className={styles.role}>AI &amp; Automation Expert</div>
            <div className={styles.eyebrow}>Automation · GHL · n8n · Make · 4+ years</div>
            <div className={styles.eyebrow}>Full-stack developer · 6+ years</div>
            <div className={styles.serifSub}>building since 2020</div>
            <h1 className={styles.title}>
              Abdullah
            </h1>
            <p className={styles.lead}>
              I build full-stack web products, and the{' '}
              <span className={styles.leadItalic}>automation</span> that quietly
              runs them.
            </p>
            <div className={styles.btnRow}>
              <span className={styles.btnPrimary}>View work ↘</span>
              <span className={styles.btnSecondary}>Get in touch</span>
            </div>
          </div>
          <div />
        </div>
        <div className={styles.fbModules}>
          modules: [ subdesk ] [ callyniq ] [ codeswave ]
        </div>
      </div>

      {/* cue */}
      <div ref={hintRef} className={styles.hint}>
        <span className={styles.hintStar}>✦</span> move anywhere · see what&apos;s
        underneath
      </div>
    </section>
  )
}
