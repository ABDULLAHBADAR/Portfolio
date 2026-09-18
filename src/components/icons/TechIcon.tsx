import styles from './TechIcon.module.css'

interface TechIconProps {
  /** simpleicons slug — rendered as an <img> filled with ink (#1A1712). */
  slug?: string
  /** Fallback letter chip (Make.com "M", Vapi "V") when no simpleicon exists. */
  letter?: string
  alt?: string
  /** Square size in px. */
  size: number
  /** Font size for the letter-chip variant. */
  letterFontSize?: number
}

/**
 * Renders a technology glyph — either a simpleicons CDN image (matching the
 * original design) or a rounded letter chip for brands with no icon.
 */
export default function TechIcon({
  slug,
  letter,
  alt = '',
  size,
  letterFontSize = 11,
}: TechIconProps) {
  if (slug) {
    return (
      <img
        src={`https://cdn.simpleicons.org/${slug}/1A1712`}
        alt={alt}
        width={size}
        height={size}
        style={{ width: size, height: size }}
      />
    )
  }
  return (
    <span
      className={styles.letter}
      style={{ width: size, height: size, fontSize: letterFontSize }}
      aria-hidden="true"
    >
      {letter}
    </span>
  )
}
