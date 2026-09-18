/**
 * Coverage invariant harness for the hero scan field.
 *
 * The GL field's boundary = rounded-rect SDF wobbled by ±DISTORT noise and
 * feathered by ±FEATHER. Guaranteed-covered core = SDF ≤ −(DISTORT+FEATHER),
 * i.e. the window inset by t = DISTORT+FEATHER on every side (radius −t).
 *
 * For each hero size: sweep one serpentine leg (steady state, entrance done),
 * stamp the core onto a coverage grid, then assert every cell of the hero is
 * stamped. The up leg retraces the same points, so one leg suffices.
 *
 * Run with: npm run check:coverage  (re-run whenever SCAN constants change)
 */
import { SCAN, LEG, serpentinePoint, scanSize, legProgress } from './scanReveal.bundle.mjs'

const t = SCAN.DISTORT + SCAN.FEATHER

function sdRoundRect(px, py, cx, cy, bx, by, r) {
  const qx = Math.abs(px - cx) - bx + r
  const qy = Math.abs(py - cy) - by + r
  const mx = Math.max(qx, 0)
  const my = Math.max(qy, 0)
  return Math.hypot(mx, my) + Math.min(Math.max(qx, qy), 0) - r
}

const SIZES = [
  [1920, 1000], [1512, 982], [1440, 900], [1280, 800], [1255, 681 < 760 ? 760 : 681], // hero min-height 760 desktop
  [1155, 760], [1024, 760], [834, 1000], [768, 760],
  [430, 932], [390, 844], [360, 620], // mobile (min 620)
]

const GRID = 4 // px per coverage cell
let allPass = true

for (const [W, H] of SIZES) {
  const { w, h } = scanSize(W, H)
  const bx = w / 2 - t
  const by = h / 2 - t
  const r = Math.max(1, SCAN.RADIUS - t)
  if (bx <= 0 || by <= 0) { console.log(`FAIL ${W}x${H}: core degenerate`); allPass = false; continue }

  const gw = Math.ceil(W / GRID)
  const gh = Math.ceil(H / GRID)
  const covered = new Uint8Array(gw * gh)

  // path sampling: fine enough that consecutive centres move < GRID px
  const steps = Math.ceil((LEG / SCAN.SWEEP) * (W * 1.6) / GRID) * 2
  for (let i = 0; i <= steps; i++) {
    const s = legProgress((i / steps) * LEG)
    const { x, y } = serpentinePoint(s, W, H)
    // stamp: cells whose centre lies inside the core
    const x0 = Math.max(0, Math.floor((x - w / 2) / GRID))
    const x1 = Math.min(gw - 1, Math.ceil((x + w / 2) / GRID))
    const y0 = Math.max(0, Math.floor((y - h / 2) / GRID))
    const y1 = Math.min(gh - 1, Math.ceil((y + h / 2) / GRID))
    for (let gy = y0; gy <= y1; gy++) {
      for (let gx = x0; gx <= x1; gx++) {
        if (covered[gy * gw + gx]) continue
        const px = gx * GRID + GRID / 2
        const py = gy * GRID + GRID / 2
        if (sdRoundRect(px, py, x, y, bx, by, r) <= 0) covered[gy * gw + gx] = 1
      }
    }
  }

  let miss = 0
  let worst = null
  for (let gy = 0; gy < gh; gy++) {
    for (let gx = 0; gx < gw; gx++) {
      if (!covered[gy * gw + gx]) {
        miss++
        if (!worst) worst = [gx * GRID, gy * GRID]
      }
    }
  }
  const pct = (100 * (1 - miss / (gw * gh))).toFixed(3)
  if (miss > 0) {
    allPass = false
    console.log(`FAIL ${W}x${H}: window ${Math.round(w)}x${Math.round(h)} core(-${t}) → ${pct}% covered, ${miss} cells missed, first at (${worst})`)
  } else {
    console.log(`pass ${W}x${H}: window ${Math.round(w)}x${Math.round(h)} core(-${t}) → 100% covered`)
  }
}

console.log(allPass ? '\nALL SIZES PASS' : '\nCOVERAGE REGRESSION — tune SCAN')
process.exit(allPass ? 0 : 1)
