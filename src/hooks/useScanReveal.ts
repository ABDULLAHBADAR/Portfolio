import { useCallback, useEffect, useRef } from 'react'
import {
  SCAN,
  clipInset,
  legProgress,
  scanSize,
  serpentinePoint,
  smooth01,
} from './scanReveal'
import type { HeroScene } from '../three/heroScene'
import {
  composeAnnotations,
  composeBlueprint,
  loadBlueprintFonts,
  loadImage,
  makeSubjectMaps,
  type SubjectMaps,
} from '../three/blueprint'

export const CUTOUT_SRC = `${import.meta.env.BASE_URL}images/new-cutout.png`

/**
 * All animation state lives in one mutable object (never React state) — the
 * loop runs at 60fps, so re-rendering would tank perf.
 *
 * One always-on spring IS the scanner field's position. Its target switches
 * between the idle serpentine point and the cursor, so every transition
 * (enter, leave, beat end, path resume) is just a target change the spring
 * smooths — no teleports, no jump-cuts.
 *
 * Renderers, chosen once at mount:
 *  'gl'      — three.js layer paints the blueprint state inside the organic
 *              field (three/heroScene.ts). DOM is never touched per-frame.
 *  'clip'    — no WebGL: the DOM blueprint layer is clipped by the same
 *              window via clip-path (the old mechanism, chrome-free).
 *  'reduced' — prefers-reduced-motion: JS never animates; CSS plays one
 *              slow pass over the DOM blueprint layer.
 */
interface ScanState {
  alive: boolean
  raf: number
  last: number
  mode: 'gl' | 'clip' | 'reduced'
  ready: boolean // GL textures uploaded — until then the field stays hidden
  coarse: boolean // touch device → pointer handlers no-op (tap must not freeze the scan)
  // cursor target (hero-space px)
  cx: number
  cy: number
  hovering: boolean
  leaveBeatUntil: number // absolute s; field rests at the cursor until then
  // idle path clock — advances ONLY while idle (pausing it = freezing the scan)
  pathTime: number
  clockRunning: boolean // settle latch for resuming after hover
  // spring (the field centre)
  sx: number
  sy: number
  svx: number
  svy: number
  // entrance energy 0→1
  born: number
  e: number
  // smoothed relief tilt (GL parallax)
  tx: number
  ty: number
  // clip-mode style cache → zero writes/invalidations at rest
  lastClip: string
}

function makeState(): ScanState {
  return {
    alive: false,
    raf: 0,
    last: 0,
    mode: 'clip',
    ready: false,
    coarse: false,
    cx: 0,
    cy: 0,
    hovering: false,
    leaveBeatUntil: 0,
    pathTime: 0,
    clockRunning: true,
    sx: 0,
    sy: 0,
    svx: 0,
    svy: 0,
    born: 0,
    e: 0,
    tx: 0,
    ty: 0,
    lastClip: '',
  }
}

export function useScanReveal() {
  const heroRef = useRef<HTMLElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const revealRef = useRef<HTMLDivElement>(null) // DOM fallback layer
  const hintRef = useRef<HTMLDivElement>(null)
  const photoRef = useRef<HTMLImageElement>(null)
  const s = useRef<ScanState>(makeState())

  useEffect(() => {
    const hero = heroRef.current
    const reveal = revealRef.current
    const canvas = canvasRef.current
    if (!hero || !reveal || !canvas) return

    const st = s.current
    st.coarse = matchMedia('(hover: none), (pointer: coarse)').matches

    // Reduced motion: JS never animates — CSS plays one slow clip-path pass.
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
      st.mode = 'reduced'
      hero.dataset.mode = 'reduced'
      return () => {
        delete hero.dataset.mode
      }
    }

    // ---------- pick the renderer (probe on a throwaway canvas — three gets
    // the real one untouched; its module chunk loads lazily below) ----------
    const glOK = (() => {
      try {
        const probe = document.createElement('canvas')
        return !!(probe.getContext('webgl2') || probe.getContext('webgl'))
      } catch {
        return false
      }
    })()
    let scene: HeroScene | null = null
    st.mode = glOK ? 'gl' : 'clip'
    hero.dataset.mode = st.mode

    // Re-seed everything inside the effect so StrictMode's remount starts fresh.
    const W0 = hero.offsetWidth
    const H0 = hero.offsetHeight
    const p0 = serpentinePoint(0, W0, H0)
    st.sx = p0.x
    st.sy = p0.y
    st.svx = 0
    st.svy = 0
    st.cx = p0.x
    st.cy = p0.y
    st.pathTime = 0
    st.clockRunning = true
    st.hovering = false
    st.leaveBeatUntil = 0
    st.e = 0
    st.tx = 0
    st.ty = 0
    st.ready = false
    st.lastClip = ''

    st.alive = true
    const t0 = performance.now() / 1000
    st.born = t0
    st.last = t0

    // ---------- GL pipeline (async — chunk + textures; guarded for unmount) ----------
    let cancelled = false
    let subjectMaps: SubjectMaps | null = null

    // Portrait layout box (offset chain — transform-independent, so the
    // entrance animations can't skew the measurement).
    const measureSubject = () => {
      const photo = photoRef.current
      if (!photo) return { x: 0, y: 0, w: 1, h: 1 }
      let x = 0
      let y = 0
      let n: HTMLElement | null = photo
      while (n && n !== hero) {
        x += n.offsetLeft
        y += n.offsetTop
        n = n.offsetParent as HTMLElement | null
      }
      return { x, y, w: photo.offsetWidth, h: photo.offsetHeight }
    }

    const composeAll = () => {
      if (cancelled || !scene || !subjectMaps) return
      const W = hero.offsetWidth
      const H = hero.offsetHeight
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      const subject = measureSubject()
      scene.setBlueprint(
        composeBlueprint(hero, W, H, dpr, subject),
        composeAnnotations(W, H, dpr, subject),
      )
      scene.setRelief(subjectMaps.edge, subjectMaps.depth, subjectMaps.rim, subject)
      if (!st.ready) {
        st.ready = true
        // if assets arrived after the entrance window, restart the ramp so
        // the field grows in rather than popping at full size
        const now = performance.now() / 1000
        st.born = Math.max(st.born, now - SCAN.ENTRANCE_DELAY)
      }
    }

    const degradeToClip = () => {
      if (cancelled) return
      scene?.dispose()
      scene = null
      st.mode = 'clip'
      st.lastClip = ''
      hero.dataset.mode = 'clip'
    }

    let retryT = 0
    if (glOK) {
      const loadAssets = () =>
        Promise.all([
          import('../three/heroScene'), // three.js chunk loads lazily
          loadImage(CUTOUT_SRC),
          loadBlueprintFonts(),
        ])
      // A transient failure (CDN hiccup, dropped connection) must not lock
      // the hero into the schematic-only clip fallback for the whole visit —
      // retry with backoff before giving up on GL.
      const boot = (attempt: number) => {
        loadAssets()
          .then(([mod, img]) => {
            if (cancelled) return
            scene = mod.createHeroScene(canvas)
            if (!scene) {
              degradeToClip()
              return
            }
            scene.setSize(hero.offsetWidth, hero.offsetHeight)
            subjectMaps = makeSubjectMaps(img)
            composeAll()
          })
          .catch(() => {
            if (cancelled) return
            if (attempt < 2) {
              retryT = window.setTimeout(() => boot(attempt + 1), 600 * 3 ** attempt)
            } else {
              degradeToClip()
            }
          })
      }
      boot(0)
    }

    // ---------- resize: resync GL size now, recompose the sheet debounced ----------
    let recomposeT = 0
    const ro = new ResizeObserver(() => {
      if (!scene) return
      scene.setSize(hero.offsetWidth, hero.offsetHeight)
      clearTimeout(recomposeT)
      recomposeT = window.setTimeout(composeAll, 180)
    })
    ro.observe(hero)

    // ---------- GPU context loss → clip fallback, but RECOVERABLE ----------
    // Chrome under tab/GPU pressure drops WebGL contexts; before this the
    // hero degraded permanently to the schematic clip layer. preventDefault
    // asks the browser for webglcontextrestored; the DOM clip layer covers
    // the gap, and on restore the GL field grows back in.
    let glSuspended = false
    const onContextLost = (e: Event) => {
      e.preventDefault()
      if (!scene) return
      glSuspended = true
      st.mode = 'clip'
      st.lastClip = ''
      hero.dataset.mode = 'clip'
    }
    const onContextRestored = () => {
      if (cancelled || !scene || !glSuspended) return
      glSuspended = false
      // no recompose needed: three re-uploads retained textures into the
      // fresh context on the next render (recomposing here would dispose
      // handles that belonged to the dead context → GL warnings)
      st.mode = 'gl'
      hero.dataset.mode = 'gl'
      // replay the entrance ramp so the field grows in rather than popping
      st.born = Math.max(st.born, performance.now() / 1000 - SCAN.ENTRANCE_DELAY)
    }
    canvas.addEventListener('webglcontextlost', onContextLost)
    canvas.addEventListener('webglcontextrestored', onContextRestored)

    const loop = (ts: number) => {
      if (!st.alive) return
      const now = ts / 1000
      let dt = now - st.last
      st.last = now
      if (dt > 0.05) dt = 0.05 // clamp after tab-away
      const W = hero.offsetWidth
      const H = hero.offsetHeight
      const { w, h } = scanSize(W, H)

      // ---------- target: cursor while hovering/resting, else the serpentine ----------
      let tx: number
      let ty: number
      if (st.hovering || now < st.leaveBeatUntil) {
        tx = st.cx
        ty = st.cy
      } else {
        const p = serpentinePoint(legProgress(st.pathTime), W, H)
        tx = p.x
        ty = p.y
        if (
          !st.clockRunning &&
          Math.hypot(st.sx - tx, st.sy - ty) < SCAN.SETTLE_DIST &&
          Math.hypot(st.svx, st.svy) < SCAN.SETTLE_SPEED
        ) {
          st.clockRunning = true // spring has re-docked onto the path
        }
        if (st.clockRunning) st.pathTime += dt // frozen during hover/beat/return
      }

      // ---------- spring toward the target (semi-implicit Euler) ----------
      st.svx += (SCAN.K * (tx - st.sx) - SCAN.D * st.svx) * dt
      st.svy += (SCAN.K * (ty - st.sy) - SCAN.D * st.svy) * dt
      st.sx += st.svx * dt
      st.sy += st.svy * dt

      // ---------- entrance ----------
      st.e = smooth01((now - st.born - SCAN.ENTRANCE_DELAY) / SCAN.ENTRANCE_DUR)

      if (scene && !glSuspended) {
        // ---------- GL: uniforms only — zero DOM writes per frame ----------
        const kT = Math.min(1, dt * 6)
        st.ty += ((st.sx / W - 0.5) * 2 * SCAN.TILT_MAX - st.ty) * kT
        st.tx += ((st.sy / H - 0.5) * -1.4 * SCAN.TILT_MAX - st.tx) * kT

        // head-hint section sweep — a slow independent loop (pure clock math,
        // no state): the cut line descends over the head, amp fades in/out
        let hint = 0
        let hintAmp = 0
        const tH =
          now - st.born - SCAN.ENTRANCE_DELAY - SCAN.ENTRANCE_DUR - SCAN.HINT_DELAY
        if (st.ready && tH >= 0) {
          const tin = tH % SCAN.HINT_PERIOD
          if (tin < SCAN.HINT_DUR) {
            const p = tin / SCAN.HINT_DUR
            // brisk descent lands at p=0.6; the wrapped layer then SETTLES
            // around the figure for the remaining ~40% before dissolving
            hint = Math.min(1, p / 0.6)
            hintAmp = SCAN.HINT_A * smooth01(p / 0.12) * smooth01((1 - p) / 0.22)
          }
        }

        // silhouette-rim traveling light — its own slow loop, desynced from
        // the hint sweep and the ghost breath (pure clock math, no state)
        let rimPulse = 0
        let rimAmp = 0
        if (st.ready) {
          const tR =
            (now - st.born - SCAN.ENTRANCE_DELAY) % SCAN.RIM_PERIOD
          if (tR > 0 && tR < SCAN.RIM_DUR) {
            const p = tR / SCAN.RIM_DUR
            rimPulse = smooth01(p) // eased descent: slow-fast-slow
            rimAmp = smooth01(p / 0.14) * smooth01((1 - p) / 0.18)
          }
        }

        scene.frame({
          x: st.sx,
          y: st.sy,
          w,
          h,
          enter: st.ready ? st.e : 0,
          time: now - st.born,
          tiltX: st.tx,
          tiltY: st.ty,
          hint,
          hintAmp,
          rimPulse,
          rimAmp,
        })
      } else if (st.mode === 'clip') {
        // ---------- fallback: entrance-scaled clip window on the DOM layer ----------
        const we = w * (0.25 + 0.75 * st.e)
        const he = h * (0.25 + 0.75 * st.e)
        const clip = clipInset(st.sx, st.sy, we, he, W, H)
        if (clip !== st.lastClip) {
          st.lastClip = clip
          reveal.style.clipPath = clip
          reveal.style.setProperty('-webkit-clip-path', clip)
        }
      }

      st.raf = requestAnimationFrame(loop)
    }

    st.raf = requestAnimationFrame(loop)

    return () => {
      st.alive = false
      cancelled = true
      if (st.raf) cancelAnimationFrame(st.raf)
      clearTimeout(recomposeT)
      clearTimeout(retryT)
      ro.disconnect()
      canvas.removeEventListener('webglcontextlost', onContextLost)
      canvas.removeEventListener('webglcontextrestored', onContextRestored)
      scene?.dispose()
      scene = null
      delete hero.dataset.mode
    }
  }, [])

  // Convert pointer clientX/Y into hero-space (layout) px.
  const setCursorFromEvent = useCallback((e: React.MouseEvent<HTMLElement>) => {
    const h = e.currentTarget
    const r = h.getBoundingClientRect()
    const sx = h.offsetWidth / r.width
    const sy = h.offsetHeight / r.height
    s.current.cx = (e.clientX - r.left) * sx
    s.current.cy = (e.clientY - r.top) * sy
  }, [])

  const onMouseMove = useCallback(
    (e: React.MouseEvent<HTMLElement>) => {
      const st = s.current
      if (st.coarse || st.mode === 'reduced') return
      setCursorFromEvent(e)
      if (hintRef.current) hintRef.current.style.opacity = '0'
    },
    [setCursorFromEvent],
  )

  const onMouseEnter = useCallback(
    (e: React.MouseEvent<HTMLElement>) => {
      const st = s.current
      if (st.coarse || st.mode === 'reduced') return
      setCursorFromEvent(e)
      // No teleport: the field GLIDES from wherever it is toward the cursor.
      st.hovering = true
      st.clockRunning = false // freeze the serpentine where we left it
      if (hintRef.current) hintRef.current.style.opacity = '0'
    },
    [setCursorFromEvent],
  )

  const onMouseLeave = useCallback(() => {
    const st = s.current
    if (st.coarse || st.mode === 'reduced') return
    st.hovering = false
    // Rest at the cursor for a beat, then glide back to the frozen path point;
    // the settle latch in the loop restarts the clock once re-docked.
    st.leaveBeatUntil = performance.now() / 1000 + SCAN.LEAVE_BEAT
  }, [])

  return {
    heroRef,
    canvasRef,
    revealRef,
    hintRef,
    photoRef,
    onMouseMove,
    onMouseEnter,
    onMouseLeave,
  }
}
