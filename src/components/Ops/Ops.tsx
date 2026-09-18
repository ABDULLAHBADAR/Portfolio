import { rv } from '../../hooks/useReveal'
import AriveIntakeCard from './AriveIntakeCard'
import AriveStageSyncCard from './AriveStageSyncCard'
import FbGroupCard from './FbGroupCard'
import FmlsCard from './FmlsCard'
import MindbodySyncCard from './MindbodySyncCard'
import SeniorLifeCard from './SeniorLifeCard'
import TildaCard from './TildaCard'
import styles from './Ops.module.css'

/**
 * Automation jobs presented as live operations: each card's stage performs
 * the work it describes (a scan pass extracting a page, the real scraper on
 * tape, a sync current between two products, an extension clicking itself,
 * the ARIVE ⇄ GHL loan pipeline replaying itself). Frame chrome is shared
 * with the Work section (../Work/Frame). Seven cards: 2×2 grid, the
 * full-width Tilda router, then the ARIVE intake/stage-router diptych.
 */
export default function Ops() {
  return (
    <section id="ops" className={styles.ops}>
      <div ref={rv} className={`${styles.header} rv`}>
        <h2 className={styles.title}>The quiet machinery</h2>
        <div className={styles.label}>(05) · Ops</div>
      </div>
      <div className={styles.grid}>
        <FmlsCard />
        <SeniorLifeCard />
        <MindbodySyncCard />
        <FbGroupCard />
        <TildaCard />
        <AriveIntakeCard />
        <AriveStageSyncCard />
      </div>
    </section>
  )
}
