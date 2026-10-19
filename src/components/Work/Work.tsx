import { rv } from '../../hooks/useReveal'
import CallyniqCase from './CallyniqCase'
import CodeswaveCase from './CodeswaveCase'
import PuppeteerCase from './PuppeteerCase'
import SubdeskCase from './SubdeskCase'
import styles from './Work.module.css'

/**
 * Selected work as full-width "case files": each project gets a bespoke
 * media stage (video showcase / dual-tour toggle / self-drawing wireframe /
 * terminal stream) beside the shared copy column. Alternating sides.
 */
export default function Work() {
  return (
    <section id="work" className={styles.work}>
      <div ref={rv} className={`${styles.header} rv`}>
        <h2 className={styles.title}>Selected work</h2>
        <div className={styles.label}>(04) · Work</div>
      </div>
      <SubdeskCase />
      <CallyniqCase />
      <CodeswaveCase />
      <PuppeteerCase />
    </section>
  )
}
