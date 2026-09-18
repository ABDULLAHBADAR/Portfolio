/**
 * Pure math for the hero "scanning reveal".
 *
 * An organic scanner field (noise-distorted rounded window — no chrome)
 * travels the whole hero on a serpentine path — ROWS cosine-eased horizontal
 * sweeps while gliding down, then the same path retraced back up
 * (triangle-wave ping-pong, no reset). One always-on spring follows either
 * the path point or the cursor. Primary renderer: a three.js layer that
 * paints the "blueprint" state inside the field (see three/heroScene.ts).
 * Fallback (no WebGL): the same window as `clip-path: inset(...)` on a DOM
 * blueprint layer.
 *
 * COVERAGE MATH — read before tuning the constants below (and re-run the
 * invariant harness: transpile this file with esbuild and grid-sample a leg).
 * The GL field's boundary is wobbled by ±DISTORT px of noise, so coverage
 * must hold for the GUARANTEED CORE: the window inset by DISTORT on every
 * side (w−2·DISTORT × h−2·DISTORT). Two constraints must BOTH hold for 100%
 * core coverage in a single leg:
 *
 * 1. Edge columns (x ≈ 0 / x ≈ W), visited only near sweep ends. Row pitch
 *    Δ = (Y_BOT − Y_TOP)·H/ROWS = 0.16·H; mid-leg glide factor v = 1/(1 −
 *    TURN_EASE) = 1.25; dwell q = (w_core/2 − X_LEFT·W)/((X_RIGHT − X_LEFT)·W),
 *    eased p₁ = acos(1 − 2q)/π. Worst gap between visits:
 *    (2 − 2·p₁)·Δ·v ≤ h_core = h − 2·DISTORT — at H = 760 (min desktop
 *    hero) gap ≈ 0.317·H = 241px vs h_core = 282px ✓ ~15% margin
 *    (was ~24% pre-noise; re-verified by the harness at all clamp corners).
 *
 * 2. Far corners (top-right / bottom-right — the serpentine starts and ends
 *    on the LEFT, so the right extreme is reached only after y has glided).
 *    The core still covers column x ≈ W until sweep-0 progress p ≈ 0.75,
 *    i.e. s* ≈ 0.15; we need y(s*) ≤ h_core/2 so the top bleed still holds:
 *    glideY(0.15) ≈ 0.07 → y ≈ 0.156·H vs h_core/2 = 0.20·H − 11px ✓ at
 *    all clamped sizes (harness-checked). TURN_EASE spans the whole
 *    first/last sweep (1/ROWS): a shorter ease lets y escape the bleed zone
 *    before the window reaches the far side, leaving permanently-missed
 *    corner slivers (caught by the harness with ROWS=4/TURN_EASE=0.125).
 *
 * Bleed: Y_TOP·H ≤ h_core/2 and X_LEFT·W ≤ w_core/2 — hold at all clamped
 * sizes. The up leg retraces the same points, and the mobile px clamps only
 * grow the window relative to W/H, so smaller viewports are strictly safer.
 */

// Timing / geometry / physics constants
export const SCAN = {
  ROWS: 5, // horizontal sweeps per leg (down pass)
  SWEEP: 0.78, // s per sweep → LEG 3.9s; ping-pong cycle 7.8s (brisk)
  X_LEFT: 0.08, // sweep extremes, fraction of hero width
  X_RIGHT: 0.92,
  Y_TOP: 0.1, // glide extremes, fraction of hero height
  Y_BOT: 0.9,
  W_FRAC: 0.38, // window size, fraction of hero (see coverage math)
  H_FRAC: 0.4,
  W_MIN: 300, // px clamps — on phones the window goes near full-width
  W_MAX: 640,
  H_MIN: 240,
  H_MAX: 460,
  RADIUS: 30, // corner radius of the field (GL SDF & fallback clip inset)
  TURN_EASE: 0.2, // fraction of leg easing y at each end = 1/ROWS (see corner math)
  K: 320, // spring stiffness (softer than the old lens → weightier)
  D: 34, // spring damping; ζ = D/(2·√K) ≈ 0.95, near-critical
  LEAVE_BEAT: 0.9, // s the window rests at the cursor after mouseleave
  ENTRANCE_DELAY: 0.9, // s after mount before the scanner enters
  ENTRANCE_DUR: 0.8, // s of entrance scale/fade
  SETTLE_DIST: 14, // px — return-to-path settle latch
  SETTLE_SPEED: 80, // px/s

  // --- organic boundary + relief (GL renderer only; three/heroScene.ts) ---
  DISTORT: 11, // px — ± noise amplitude wobbling the field edge
  NOISE_SCALE: 1 / 110, // px → noise-domain frequency of the edge wobble
  NOISE_DRIFT: 0.16, // noise-domain units/s the wobble pattern crawls
  FEATHER: 1.4, // px — anti-alias feather across the field boundary
  GLOW_W: 9, // px — terracotta boundary-glow falloff (inside the cut only)
  GLOW_A: 0.22, // peak mix of that glow at the boundary
  TILT_MAX: 0.05, // rad — relief-mesh parallax tilt at full field offset
  GHOST_MIN: 0.06, // breathing wireframe-ghost alpha range (outside field)
  GHOST_MAX: 0.15,
  GHOST_PERIOD: 7, // s per ghost breath cycle
  RELIEF_DEPTH: 30, // px — max vertex displacement of the portrait relief

  // --- head-hint "shell scan" (GL only) — the Lando ghost-helmet gesture:
  // a cross-section cut of the depth shell sweeps DOWN the figure on a loop.
  // The cut edge CONFORMS to the body contour (cut lifts by WRAP·depth), the
  // revealed region settles as a faint terracotta wireframe hugging the
  // silhouette, and the stack callouts (annotation overlay texture) ghost in
  // as the cut passes their region. Nothing draws off-shell — no flat ruler
  // line. Independent of the serpentine field.
  HINT_PERIOD: 5.6, // s between sweep starts (≠ GHOST_PERIOD → they desync)
  HINT_DUR: 1.25, // s the cut takes crown→hem (snappy)
  HINT_DELAY: 1.6, // s after the entrance before the first sweep
  HINT_WRAP: 64, // px the cut edge lifts over the body (depth·dome tilt)
  HINT_EDGE: 7, // px terracotta glow falloff along the cut edge
  HINT_A: 0.6, // peak strength of the settled shell + callouts

  // --- silhouette rim (GL only) — an always-on ink contour hugging the
  // portrait cut-out (it also masks the matte fringe from the background
  // removal), with a traveling light that runs crown→hem on its own loop.
  RIM_PERIOD: 4.6, // s between pulses (≠ HINT/GHOST periods → they desync)
  RIM_DUR: 1.6, // s the light takes to travel top→bottom
  RIM_FRONT: 15, // px pulse falloff below the light (sharp leading edge)
  RIM_TAIL: 55, // px falloff above it (comet tail)
  RIM_LINE_A: 0.6, // base alpha of the ink contour line
  RIM_GLOW_A: 0.24, // base alpha of the terracotta halo outside it
  RIM_BOOST: 0.85, // extra strength the pulse adds at its peak
} as const

/** Seconds per one-way serpentine pass. */
export const LEG = SCAN.ROWS * SCAN.SWEEP

/** Smoothstep clamped to 0..1. */
export function smooth01(x: number): number {
  x = x < 0 ? 0 : x > 1 ? 1 : x
  return x * x * (3 - 2 * x)
}

/** Scanner window size in px for a given hero size (fraction, px-clamped). */
export function scanSize(W: number, H: number): { w: number; h: number } {
  return {
    w: Math.min(SCAN.W_MAX, Math.max(SCAN.W_MIN, W * SCAN.W_FRAC)),
    h: Math.min(SCAN.H_MAX, Math.max(SCAN.H_MIN, H * SCAN.H_FRAC)),
  }
}

/**
 * Ping-pong leg progress: pathTime (s, advanced only while idle) → s ∈ [0,1].
 * Triangle wave with period 2·LEG — the down leg rises 0→1, the up leg falls
 * 1→0 retracing the identical serpentine. Seamless loop, no jump-cut.
 */
export function legProgress(pathTime: number): number {
  const u = (pathTime / LEG) % 2 // pathTime >= 0 always
  return u <= 1 ? u : 2 - u
}

/**
 * Trapezoid-velocity vertical glide g(s): g(0)=0, g(1)=1, g'(0)=g'(1)=0,
 * linear (slope v = 1/(1−e)) through the middle. Confines the turnaround ease
 * to the first/last half-sweep so the row pitch stays near-uniform — a
 * whole-leg ease would stretch the middle rows and break coverage.
 */
export function glideY(s: number): number {
  const e = SCAN.TURN_EASE
  const v = 1 / (1 - e)
  if (s <= e) return (v * s * s) / (2 * e)
  if (s >= 1 - e) return 1 - (v * (1 - s) * (1 - s)) / (2 * e)
  return v * (s - e / 2)
}

/**
 * The serpentine: s ∈ [0,1] → window-centre point in hero px.
 * x: ROWS cosine-eased sweeps alternating L→R / R→L — the cosine ends every
 * sweep with zero x-velocity. y: monotonic glide via glideY, zero slope at the
 * ends. So at s = 0 and s = 1 BOTH velocity components vanish, and flipping
 * the triangle wave's direction there is invisible — a C¹-smooth ping-pong.
 */
export function serpentinePoint(
  s: number,
  W: number,
  H: number,
): { x: number; y: number } {
  const sr = s * SCAN.ROWS
  const k = Math.min(SCAN.ROWS - 1, Math.floor(sr)) // sweep index 0..ROWS-1
  const p = sr - k // 0..1 within sweep
  const xe = 0.5 - 0.5 * Math.cos(Math.PI * p)
  const xL = W * SCAN.X_LEFT
  const xR = W * SCAN.X_RIGHT
  const x = k % 2 === 0 ? xL + (xR - xL) * xe : xR - (xR - xL) * xe
  const y = H * (SCAN.Y_TOP + (SCAN.Y_BOT - SCAN.Y_TOP) * glideY(s))
  return { x, y }
}

/**
 * Integer-rounded `inset()` clip for a window centred at (cx,cy) — the
 * no-WebGL fallback renderer. Negative insets are intentional and valid
 * (CSS Shapes): when the window bleeds past a hero edge the rounded corner
 * moves offscreen and the visible cut is a straight line flush with the
 * edge, which the hero's overflow:hidden clips the same way.
 */
export function clipInset(
  cx: number,
  cy: number,
  w: number,
  h: number,
  W: number,
  H: number,
): string {
  const wi = Math.round(w)
  const hi = Math.round(h)
  if (wi <= 0 || hi <= 0) return 'inset(50% 50% 50% 50%)' // degenerate → hidden
  const L = Math.round(cx - w / 2)
  const T = Math.round(cy - h / 2)
  return `inset(${T}px ${W - (L + wi)}px ${H - (T + hi)}px ${L}px round ${SCAN.RADIUS}px)`
}
