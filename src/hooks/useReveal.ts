import { useEffect, useRef } from 'react'

/**
 * Shared scroll animation utilities for the below-hero sections.
 *
 * One IntersectionObserver and one rAF-throttled scroll loop serve the whole
 * page. Elements opt in via the global `rv` classes (see global.css) or read
 * the `--prog` custom property this file maintains. Everything stays
 * transform/opacity-only (the bgBlob lesson) and fully inert under
 * prefers-reduced-motion: the CSS gates every hidden state, and the JS
 * side-effects (autoplay, progress) check the media query themselves.
 */

const reduced = () =>
  typeof matchMedia !== 'undefined' &&
  matchMedia('(prefers-reduced-motion: reduce)').matches

/* ---------------- reveal-on-scroll (adds .on once) ---------------- */

let io: IntersectionObserver | null = null
function ensureIO(): IntersectionObserver {
  if (!io) {
    io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add('on')
            io!.unobserve(e.target)
          }
        }
      },
      { threshold: 0.16, rootMargin: '0px 0px -7% 0px' },
    )
  }
  return io
}

/**
 * Ref callback — attach to any element carrying an `rv`/`wipe` class:
 *   <div ref={rv} className="rv" style={{ '--d': '0.1s' }}>
 * Safe to reuse for many elements.
 */
export function rv(el: Element | null): void {
  if (el) ensureIO().observe(el)
}

/* ---------------- scroll progress (--prog 0..1 on the element) ----- */

const progEls = new Set<HTMLElement>()
let progBound = false
let progQueued = false

function progTick(): void {
  progQueued = false
  const vh = window.innerHeight
  for (const el of progEls) {
    const r = el.getBoundingClientRect()
    const p = (vh - r.top) / (vh + r.height)
    el.style.setProperty('--prog', Math.min(1, Math.max(0, p)).toFixed(4))
  }
}
function onScrollOrResize(): void {
  if (!progQueued) {
    progQueued = true
    requestAnimationFrame(progTick)
  }
}

/**
 * Keeps `--prog` (0 = element top at viewport bottom, 1 = element bottom at
 * viewport top) updated on the referenced element while it is mounted.
 * No-op under prefers-reduced-motion.
 */
export function useScrollProgress<T extends HTMLElement>() {
  const ref = useRef<T>(null)
  useEffect(() => {
    const el = ref.current
    if (!el || reduced()) return
    progEls.add(el)
    if (!progBound) {
      progBound = true
      window.addEventListener('scroll', onScrollOrResize, { passive: true })
      window.addEventListener('resize', onScrollOrResize)
    }
    onScrollOrResize()
    return () => {
      progEls.delete(el)
    }
  }, [])
  return ref
}

/* ---------------- in-view video autoplay ---------------- */

/**
 * Plays a muted looping video only while it is on screen. Under reduced
 * motion the video never autoplays — it gets native controls instead.
 */
export function useInViewVideo(threshold = 0.3) {
  const ref = useRef<HTMLVideoElement>(null)
  useEffect(() => {
    const v = ref.current
    if (!v) return
    if (reduced()) {
      v.controls = true
      return
    }
    // "should play" intent — survives transient play() failures (data not
    // buffered yet, decoder pressure, tab frozen by the browser) that used
    // to leave the video stuck on its poster with the error swallowed.
    let wanted = false
    const onCanPlay = () => {
      if (wanted && v.paused) v.play().catch(() => {})
    }
    const tryPlay = () => {
      if (!wanted || !v.paused) return
      v.muted = true // re-assert: tab-restore paths can drop the property
      v.play().catch(() => {
        v.addEventListener('canplay', onCanPlay, { once: true })
      })
    }
    const obs = new IntersectionObserver(
      ([e]) => {
        if (!e) return
        wanted = e.isIntersecting
        if (wanted) {
          if (v.preload === 'none') v.preload = 'auto' // start buffering now
          tryPlay()
        } else {
          v.pause()
        }
      },
      { threshold },
    )
    obs.observe(v)
    // browsers pause media when the tab hides/freezes and do NOT resume it;
    // the observer never refires (the element never left the viewport)
    const onVis = () => {
      if (!document.hidden) tryPlay()
    }
    document.addEventListener('visibilitychange', onVis)
    return () => {
      obs.disconnect()
      document.removeEventListener('visibilitychange', onVis)
      v.removeEventListener('canplay', onCanPlay)
    }
  }, [threshold])
  return ref
}
