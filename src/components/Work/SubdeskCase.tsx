import { WORK_CASES } from '../../data/content'
import { rv, useInViewVideo, useScrollProgress } from '../../hooks/useReveal'
import CaseInfo from './CaseInfo'
import Frame from './Frame'
import styles from './Work.module.css'

/**
 * Case 01 — the full product showcase. The 57s screen recording plays
 * (muted, in-view only) inside a browser frame; two screenshots ride behind
 * and in front of it at different parallax rates, each pinned by a drafting
 * leader-line annotation.
 */
export default function SubdeskCase() {
  const c = WORK_CASES[0]
  const video = useInViewVideo()
  const stage = useScrollProgress<HTMLDivElement>()

  return (
    <article className={styles.case} id={`work-${c.slug}`}>
      <CaseInfo c={c} />
      <div ref={stage} className={styles.stage}>
        {/* exhibit behind, drifting slower */}
        <div ref={rv} className={`${styles.exhibit} ${styles.exhibitBack} rv rv-scale`} style={{ '--d': '0.35s' } as React.CSSProperties}>
          <img src={`${import.meta.env.BASE_URL}work/subdesk/web/landing-hero.jpg`} alt="Subdesk landing page" loading="lazy" />
          <span className={styles.exhibitTag}>landing</span>
        </div>

        <div ref={rv} className={styles.stageMain}>
          <div className="wipe">
            <Frame label="subdesk.cc · showcase">
              <video
                ref={video}
                className={styles.media}
                src={`${import.meta.env.BASE_URL}work/subdesk/Subdesk-Showcase-1080p60.mp4`}
                poster={`${import.meta.env.BASE_URL}work/subdesk/web/showcase-poster.jpg`}
                muted
                loop
                playsInline
                preload="none"
                disablePictureInPicture
              />
              <span className={styles.liveChip}>
                <i className={styles.liveDot} /> live demo · 0:57
              </span>
            </Frame>
          </div>
        </div>

        {/* exhibit in front, drifting faster */}
        <div ref={rv} className={`${styles.exhibit} ${styles.exhibitFront} rv rv-scale`} style={{ '--d': '0.5s' } as React.CSSProperties}>
          <img src={`${import.meta.env.BASE_URL}work/subdesk/web/dash-customizer.jpg`} alt="Subdesk white-label customizer" loading="lazy" />
          <span className={styles.exhibitTag}>white-label engine</span>
        </div>
      </div>
    </article>
  )
}
