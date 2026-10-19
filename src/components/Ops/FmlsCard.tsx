import { OPS } from '../../data/content'
import { rv } from '../../hooks/useReveal'
import Frame from '../Work/Frame'
import OpsCaption from './OpsCaption'
import styles from './Ops.module.css'

/** Fake but plausible extraction feed; duplicated once for the marquee. */
const ROWS = [
  'MLS# 7412083 · $412,000 · Marietta ✓',
  'MLS# 7412117 · $655,000 · Decatur ✓',
  'MLS# 7412158 · $329,900 · Smyrna ✓',
  'MLS# 7412201 · $1,180,000 · Buckhead ✓',
  'MLS# 7412244 · $498,500 · Roswell ✓',
  'MLS# 7412290 · $274,000 · Austell ✓',
]

/**
 * OP-06: the scrape, performed. A terracotta scan line sweeps the FMLS
 * homepage; dashed extraction boxes flash as it passes their region; the
 * ticker under the frame streams the rows it "lifted". One shared 7s loop,
 * reset masked while everything is dark.
 */
export default function FmlsCard() {
  return (
    <article className={styles.card} id="ops-fmls">
      <div ref={rv} className="rv">
        <div className="wipe">
          <Frame label="firstmls.com · extraction pass">
            <div
              className={styles.scanStage}
              role="img"
              aria-label="Animated scrape pass over the FMLS homepage"
            >
              <img
                className={styles.scanShot}
                src={`${import.meta.env.BASE_URL}work/fmls/web/fmls-home.jpg`}
                alt=""
                loading="lazy"
              />
              <i className={styles.scanLine} aria-hidden="true" />
              <span
                className={`${styles.exBox} ${styles.exB1}`}
                style={{ top: '0.6%', left: '28%', width: '62%', height: '4.2%' }}
                aria-hidden="true"
              >
                <b>nav.search</b>
              </span>
              <span
                className={`${styles.exBox} ${styles.exB2}`}
                style={{ top: '37.5%', left: '23.5%', width: '53%', height: '11.5%' }}
                aria-hidden="true"
              >
                <b>listing.hero</b>
              </span>
              <span
                className={`${styles.exBox} ${styles.exB3}`}
                style={{ top: '79%', left: '9.5%', width: '81%', height: '19%' }}
                aria-hidden="true"
              >
                <b>market.stats</b>
              </span>
            </div>
          </Frame>
        </div>
        <div className={styles.ticker} aria-hidden="true">
          <div className={styles.tickerTrack}>
            {[...ROWS, ...ROWS].map((r, i) => (
              <span key={i} className={styles.tickRow}>
                {r}
              </span>
            ))}
          </div>
        </div>
      </div>
      <OpsCaption c={OPS[5]} d={0.12} />
    </article>
  )
}
