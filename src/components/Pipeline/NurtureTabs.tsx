import { useState } from 'react'
import { NURTURE_TABS } from '../../data/content'
import { rv } from '../../hooks/useReveal'
import Frame from '../Work/Frame'
import styles from './Pipeline.module.css'

/**
 * The messaging layer around the integration: three GHL workflow folders
 * behind a mono segmented control. Each tab shows the real builder tree in a
 * fixed window that slowly pans its full depth (the pan IS the demo: these
 * cadences are long). Folder facts render as native text, not screenshots.
 */
export default function NurtureTabs() {
  const [active, setActive] = useState(NURTURE_TABS[0].key)
  const tab = NURTURE_TABS.find((t) => t.key === active) ?? NURTURE_TABS[0]

  return (
    <div className={styles.nurture}>
      <div ref={rv} className={`${styles.nInfo} rv rv-left`}>
        <div className={styles.nKicker}>the nurture engine</div>
        <h3 className={styles.nTitle}>Around the spine, a messaging layer</h3>
        <p className={styles.nDesc}>
          One cadence per form, TCPA aware, split by install, service and
          water heater. Three folders run the client's whole calendar.
        </p>

        <div
          className={styles.segmented}
          role="tablist"
          aria-label="Nurture workflow folders"
        >
          {NURTURE_TABS.map((t) => (
            <button
              key={t.key}
              role="tab"
              aria-selected={active === t.key}
              className={`${styles.segBtn} ${active === t.key ? styles.segOn : ''}`}
              onClick={() => setActive(t.key)}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className={styles.folderRow}>
          <span className={styles.folderName}>{tab.folder}</span>
          <span className={styles.folderMeta}>
            {tab.meta.map((m) => (
              <em key={m}>{m}</em>
            ))}
          </span>
        </div>
        <p className={styles.nCaption}>{tab.caption}</p>
      </div>

      <div ref={rv} className={`${styles.nStage} rv`}>
        <div className="wipe">
          <Frame label={`ghl workflows · ${tab.folder.toLowerCase()}`}>
            <div className={styles.panWin}>
              {NURTURE_TABS.map((t) => (
                <img
                  key={t.key}
                  src={t.img}
                  alt={`${t.folder} builder tree`}
                  loading="lazy"
                  className={`${styles.panImg} ${t.wide ? styles.panWide : ''} ${
                    active === t.key ? styles.panOn : ''
                  }`}
                />
              ))}
            </div>
          </Frame>
        </div>
      </div>
    </div>
  )
}
