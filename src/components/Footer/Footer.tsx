import styles from './Footer.module.css'

export default function Footer() {
  return (
    <div className={styles.footer}>
      <span>Abdullah · Full-stack automation developer</span>
      <span>© 2026 · Built with care</span>
      <a href="#top" className={styles.backToTop}>
        Back to top ↑
      </a>
    </div>
  )
}
