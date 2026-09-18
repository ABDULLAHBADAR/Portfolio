import { SERVICES } from '../../data/content'
import { rv } from '../../hooks/useReveal'
import styles from './Services.module.css'

export default function Services() {
  return (
    <section id="services" className={styles.services}>
      <div ref={rv} className={`${styles.header} rv`}>
        <h2 className={styles.title}>How I can help</h2>
        <div className={styles.label}>(08) · Services</div>
      </div>
      <div className={styles.grid}>
        {SERVICES.map((s, i) => (
          <div
            key={s.num}
            ref={rv}
            className={`${styles.card} rv`}
            style={{ '--d': `${i * 0.09}s` } as React.CSSProperties}
          >
            <div className={styles.num}>{s.num}</div>
            <div className={styles.cardTitle}>{s.title}</div>
            <div className={styles.desc}>{s.desc}</div>
            <div className={styles.tag}>{s.tag}</div>
          </div>
        ))}
      </div>
    </section>
  )
}
