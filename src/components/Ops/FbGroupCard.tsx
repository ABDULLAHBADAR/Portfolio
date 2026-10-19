import { OPS } from '../../data/content'
import { rv } from '../../hooks/useReveal'
import Frame from '../Work/Frame'
import OpsCaption from './OpsCaption'
import styles from './Ops.module.css'

/**
 * OP-05: the extension demonstrating itself, no JS. A schematic member-
 * request queue (deliberately paper-toned, no Facebook branding): a cursor
 * glides to the injected "Send to GHL" button, clicks, the payload flies to
 * the GHL node, the handled row leaves and the queue advances. One 10s CSS
 * timeline; the reset snap happens while the handled row is scrolled out of
 * the clip and every row is pixel-identical, so the seam is invisible.
 */
export default function FbGroupCard() {
  return (
    <article className={styles.card} id="ops-fb-ghl-extension">
      <div ref={rv} className="rv">
        <div className="wipe">
          <Frame label="group admin · member requests">
            <div
              className={styles.fbStage}
              role="img"
              aria-label="Animated mock of a Send to GHL button injected next to Approve on member requests"
            >
              <div className={styles.fbNode}>
                <span className={styles.fbNodeChip}>G</span> ghl
                <em className={styles.fbNodeTick}>✓</em>
              </div>
              <div className={styles.fbClip} aria-hidden="true">
                <div className={styles.fbRows}>
                  {[0, 1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className={`${styles.fbRow} ${i === 0 ? styles.fbRowTop : ''}`}
                    >
                      <i className={styles.fbAvatar} />
                      <div className={styles.fbLines}>
                        <b />
                        <b />
                      </div>
                      <span className={styles.fbApprove}>Approve</span>
                      <span className={styles.fbSend}>
                        Send to GHL
                        {i === 0 && <i className={styles.fbRipple} />}
                      </span>
                    </div>
                  ))}
                </div>
                <i className={styles.fbCursor} />
              </div>
              {/* payload lives on the STAGE (not in the clip) so its flight
                  to the GHL node above the clip window is never cut off */}
              <span className={styles.fbPayload}>name · answers → ghl</span>
            </div>
          </Frame>
        </div>
      </div>
      <OpsCaption c={OPS[4]} d={0.12} />
    </article>
  )
}
