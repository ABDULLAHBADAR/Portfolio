import { OPS } from '../../data/content'
import { rv, useInViewVideo } from '../../hooks/useReveal'
import Frame from '../Work/Frame'
import OpsCaption from './OpsCaption'
import styles from './Ops.module.css'

/**
 * OP-02: the real scraper on tape. The demo runs against seeded fake data,
 * and the user requires that disclaimer to sit VISIBLY ABOVE the video
 * (outside the wipe so it is never clipped, never motion-gated).
 */
export default function SeniorLifeCard() {
  const video = useInViewVideo()
  return (
    <article className={styles.card} id="ops-seniorlife">
      <div ref={rv} className="rv" style={{ '--d': '0.08s' } as React.CSSProperties}>
        <p className={styles.disclaimer}>
          <i aria-hidden="true" /> demo runs on seeded fake data · no real policy
          records
        </p>
        <div className="wipe">
          <Frame label="agent portal · scrape run">
            <video
              ref={video}
              className={styles.media}
              src={`${import.meta.env.BASE_URL}work/seniorlife/scraper-demo.mp4`}
              poster={`${import.meta.env.BASE_URL}work/seniorlife/web/demo-poster.jpg`}
              muted
              loop
              playsInline
              preload="none"
              disablePictureInPicture
            />
            <span className={styles.liveChip}>
              <i className={styles.liveDot} /> scrape run · 0:44
            </span>
          </Frame>
        </div>
      </div>
      <OpsCaption c={OPS[1]} d={0.2} />
    </article>
  )
}
