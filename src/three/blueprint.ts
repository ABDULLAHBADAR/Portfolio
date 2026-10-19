/**
 * Offscreen compositors for the hero "blueprint" (revealed) state.
 *
 * Everything the scanner field reveals is painted here into plain canvases,
 * which three/heroScene.ts uploads as textures:
 *
 *  - edge map    — Sobel line-work of the portrait cut-out (the "x-ray" of
 *                  the subject; also breathes as the ghost outside the field)
 *  - depth map   — silhouette-inflated pseudo-depth driving the relief mesh
 *  - blueprint   — hero-sized sheet: deeper paper, drafting grid, the SAME
 *                  headline redrawn as outline type IN PLACE (registration by
 *                  measurement), schematic button pills, lead redaction rules,
 *                  a portrait ruler, and annotation callouts with leader lines
 *
 * Registration rule: all type/geometry positions are measured from the live
 * DOM via offsetLeft/offsetTop chains (transform-independent — the entrance
 * animations only animate transforms, so measuring during them is safe).
 */
import { HERO_ANNOTATIONS } from '../data/content'

/* ---------- palette (mirrors tokens.css — canvases can't read CSS vars of
   another document cheaply, and these are design constants, not themes) --- */
// GL sheet paper: barely deeper than --paper. Lando keeps the revealed zone's
// background almost identical to the page — the CONTENT changes, not the
// backdrop. (The DOM fallback keeps --reveal-bg for contrast: it has no
// line-work to carry the material change.)
const PAPER_ALT = '#f1eadc'
const INK = '#1a1712'
const TERRACOTTA = '#9a5a3e'

export interface SubjectMaps {
  edge: HTMLCanvasElement
  depth: HTMLCanvasElement
  /** silhouette rim: R = ink contour line, G = outside halo */
  rim: HTMLCanvasElement
}

/** Separable box blur over a scalar field (repeated → ≈ gaussian). */
function boxBlurA(
  src: Float32Array,
  w: number,
  h: number,
  r: number,
  passes: number,
): Float32Array {
  const win = 2 * r + 1
  const cur = Float32Array.from(src)
  const tmp = new Float32Array(w * h)
  for (let pass = 0; pass < passes; pass++) {
    for (let y = 0; y < h; y++) {
      const row = y * w
      let acc = 0
      for (let x = -r; x <= r; x++)
        acc += cur[row + Math.min(w - 1, Math.max(0, x))]
      for (let x = 0; x < w; x++) {
        tmp[row + x] = acc / win
        acc +=
          cur[row + Math.min(w - 1, x + r + 1)] - cur[row + Math.max(0, x - r)]
      }
    }
    for (let x = 0; x < w; x++) {
      let acc = 0
      for (let y = -r; y <= r; y++)
        acc += tmp[Math.min(h - 1, Math.max(0, y)) * w + x]
      for (let y = 0; y < h; y++) {
        cur[y * w + x] = acc / win
        acc +=
          tmp[Math.min(h - 1, y + r + 1) * w + x] -
          tmp[Math.max(0, y - r) * w + x]
      }
    }
  }
  return cur
}

/** Load an image and decode it off the main thread where supported. */
export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error(`image failed: ${src}`))
    img.src = src
  })
}

/** Fonts the blueprint draws with — must be resolved before composing. */
export function loadBlueprintFonts(): Promise<unknown> {
  return Promise.all([
    document.fonts.load('900 132px Archivo'),
    document.fonts.load('500 23px Archivo'),
    document.fonts.load('italic 400 31px "Instrument Serif"'),
    document.fonts.load('400 12px "Space Mono"'),
    document.fonts.load('700 12px "Space Mono"'),
  ]).catch(() => undefined) // absent fonts degrade, never block
}

/**
 * Sobel edge map + inflated depth map from the portrait cut-out, at the
 * image's natural resolution. One-off cost (~10ms at 512×1106).
 */
export function makeSubjectMaps(img: HTMLImageElement): SubjectMaps {
  const w = img.naturalWidth
  const h = img.naturalHeight
  const src = document.createElement('canvas')
  src.width = w
  src.height = h
  const sctx = src.getContext('2d', { willReadFrequently: true })!
  sctx.drawImage(img, 0, 0)
  const data = sctx.getImageData(0, 0, w, h).data

  // luminance premultiplied by alpha — background (transparent) reads as 0
  const lum = new Float32Array(w * h)
  const alp = new Float32Array(w * h)
  for (let i = 0; i < w * h; i++) {
    const r = data[i * 4]
    const g = data[i * 4 + 1]
    const b = data[i * 4 + 2]
    const a = data[i * 4 + 3] / 255
    lum[i] = (0.2126 * r + 0.7152 * g + 0.0722 * b) * a
    alp[i] = a
  }

  // local mean luminance (box blur r=6) for Weber contrast normalization —
  // absolute gradients on the dark hoodie are tiny, but RELATIVE to their
  // neighbourhood they match the face. Without this the torso draws empty.
  const lmean = new Float32Array(w * h)
  {
    const r6 = 6
    const win6 = 2 * r6 + 1
    const tmp6 = new Float32Array(w * h)
    for (let y = 0; y < h; y++) {
      const row = y * w
      let acc = 0
      for (let x = -r6; x <= r6; x++)
        acc += lum[row + Math.min(w - 1, Math.max(0, x))]
      for (let x = 0; x < w; x++) {
        tmp6[row + x] = acc / win6
        acc +=
          lum[row + Math.min(w - 1, x + r6 + 1)] - lum[row + Math.max(0, x - r6)]
      }
    }
    for (let x = 0; x < w; x++) {
      let acc = 0
      for (let y = -r6; y <= r6; y++)
        acc += tmp6[Math.min(h - 1, Math.max(0, y)) * w + x]
      for (let y = 0; y < h; y++) {
        lmean[y * w + x] = acc / win6
        acc +=
          tmp6[Math.min(h - 1, y + r6 + 1) * w + x] -
          tmp6[Math.max(0, y - r6) * w + x]
      }
    }
  }

  // --- edge canvas: ink strokes, alpha = edge strength ---
  const edge = document.createElement('canvas')
  edge.width = w
  edge.height = h
  const ectx = edge.getContext('2d')!
  const eimg = ectx.createImageData(w, h)
  const ed = eimg.data
  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      const i = y * w + x
      const gx =
        -lum[i - w - 1] - 2 * lum[i - 1] - lum[i + w - 1] +
        lum[i - w + 1] + 2 * lum[i + 1] + lum[i + w + 1]
      const gy =
        -lum[i - w - 1] - 2 * lum[i - w] - lum[i - w + 1] +
        lum[i + w - 1] + 2 * lum[i + w] + lum[i + w + 1]
      // silhouette boundary (alpha gradient) counts too — outlines the figure
      const ax =
        -alp[i - w - 1] - 2 * alp[i - 1] - alp[i + w - 1] +
        alp[i - w + 1] + 2 * alp[i + 1] + alp[i + w + 1]
      const ay =
        -alp[i - w - 1] - 2 * alp[i - w] - alp[i - w + 1] +
        alp[i + w - 1] + 2 * alp[i + w] + alp[i + w + 1]
      // Weber-normalized magnitude: divide by local mean so low-key regions
      // (hoodie folds, hair) contribute like the well-lit face
      const mag =
        Math.hypot(gx, gy) / 1020 / (lmean[i] / 255 + 0.16) * 0.34 +
        Math.hypot(ax, ay) * 0.09
      // soft threshold → thin but continuous strokes (the silhouette term is
      // kept light so the outer contour stays a drafting line, not a marker)
      let e = (mag - 0.075) / 0.2
      e = e < 0 ? 0 : e > 1 ? 1 : e
      e = e * e * (3 - 2 * e)

      // --- tonal cross-hatching (drafting shade) inside the silhouette ---
      // diagonal hatch where the subject is dark; second crossing direction
      // in the darkest band. Alpha stays below stroke ink so edges win.
      if (alp[i] > 0.85) {
        const lu = lum[i] / alp[i] / 255 // un-premultiplied luma 0..1
        const dark = Math.min(1, Math.max(0, (0.4 - lu) / 0.4))
        if (dark > 0.04) {
          const h1 = (x + y) % 9 < 1.7 ? 0.5 * dark : 0
          const h2 =
            dark > 0.55 && (x - y + 65536) % 13 < 1.7
              ? 0.42 * ((dark - 0.55) / 0.45)
              : 0
          const hatch = Math.max(h1, h2)
          if (hatch > e) e = hatch
        }
      }
      ed[i * 4] = 0x1a
      ed[i * 4 + 1] = 0x17
      ed[i * 4 + 2] = 0x12
      ed[i * 4 + 3] = Math.round(e * 255)
    }
  }
  ectx.putImageData(eimg, 0, 0)

  // --- depth canvas: blurred silhouette, inflated (r = blur radius) ---
  const r = Math.max(8, Math.round(w / 22))
  const win = 2 * r + 1
  let cur = Float32Array.from(alp)
  const tmp = new Float32Array(w * h)
  // 3 × separable box blur ≈ gaussian (sliding-window running sum)
  for (let pass = 0; pass < 3; pass++) {
    // horizontal: cur → tmp
    for (let y = 0; y < h; y++) {
      const row = y * w
      let acc = 0
      for (let x = -r; x <= r; x++)
        acc += cur[row + Math.min(w - 1, Math.max(0, x))]
      for (let x = 0; x < w; x++) {
        tmp[row + x] = acc / win
        acc +=
          cur[row + Math.min(w - 1, x + r + 1)] -
          cur[row + Math.max(0, x - r)]
      }
    }
    // vertical: tmp → cur
    for (let x = 0; x < w; x++) {
      let acc = 0
      for (let y = -r; y <= r; y++)
        acc += tmp[Math.min(h - 1, Math.max(0, y)) * w + x]
      for (let y = 0; y < h; y++) {
        cur[y * w + x] = acc / win
        acc +=
          tmp[Math.min(h - 1, y + r + 1) * w + x] -
          tmp[Math.max(0, y - r) * w + x]
      }
    }
  }
  const depth = document.createElement('canvas')
  depth.width = w
  depth.height = h
  const dctx = depth.getContext('2d')!
  const dimg = dctx.createImageData(w, h)
  const dd = dimg.data
  for (let i = 0; i < w * h; i++) {
    // inflate: rounded falloff, hard-masked to the silhouette so the
    // relief never lifts the empty background
    const v = Math.pow(Math.min(1, cur[i] * 1.15), 1.35) * (0.15 + 0.85 * alp[i])
    const q = Math.round(v * 255)
    dd[i * 4] = q
    dd[i * 4 + 1] = q
    dd[i * 4 + 2] = q
    dd[i * 4 + 3] = 255
  }
  dctx.putImageData(dimg, 0, 0)

  // --- rim canvas: silhouette contour line (R) + outside halo (G) ---
  // Two alpha blurs act as soft distance proxies: a band around the 0.5
  // crossing of the tight blur is the ink line (it sits ON the matte edge,
  // hiding the background-removal fringe); a wider blur peaking at ~0.32
  // biases the halo OUTWARD of the body. The shader tints and animates.
  const s2 = boxBlurA(alp, w, h, 2, 2)
  const s8 = boxBlurA(alp, w, h, 7, 2)
  const rim = document.createElement('canvas')
  rim.width = w
  rim.height = h
  const rctx = rim.getContext('2d')!
  const rimg = rctx.createImageData(w, h)
  const rd = rimg.data
  const sm = (a: number, b: number, x: number) => {
    x = Math.min(1, Math.max(0, (x - a) / (b - a)))
    return x * x * (3 - 2 * x)
  }
  // the waist-up crop exits through the bottom edge — the blur band there
  // would draw a hard horizontal rule across the hem, so fade the rim out
  // over the last rows instead
  const fadeRows = 18
  for (let i = 0; i < w * h; i++) {
    const y = (i / w) | 0
    const line = sm(0.35, 0.8, 1 - Math.abs(s2[i] * 2 - 1))
    const glow = sm(0.2, 0.9, 1 - Math.min(1, Math.abs(s8[i] - 0.32) / 0.38))
    const bottomFade = y >= h - fadeRows ? (h - 1 - y) / fadeRows : 1
    rd[i * 4] = Math.round(line * 255 * bottomFade)
    rd[i * 4 + 1] = Math.round(glow * 255 * bottomFade)
    rd[i * 4 + 2] = 0
    rd[i * 4 + 3] = 255
  }
  rctx.putImageData(rimg, 0, 0)

  return { edge, depth, rim }
}

/* ------------------------------------------------------------------ */
/* Blueprint sheet                                                     */
/* ------------------------------------------------------------------ */

interface Rect {
  x: number
  y: number
  w: number
  h: number
}

/** offsetLeft/Top chain up to `root` — layout position, transforms ignored. */
function offsetRect(root: HTMLElement, el: HTMLElement): Rect {
  let x = 0
  let y = 0
  let n: HTMLElement | null = el
  while (n && n !== root) {
    x += n.offsetLeft
    y += n.offsetTop
    n = n.offsetParent as HTMLElement | null
  }
  return { x, y, w: el.offsetWidth, h: el.offsetHeight }
}

function bp(root: HTMLElement, name: string): HTMLElement | null {
  return root.querySelector<HTMLElement>(`[data-bp="${name}"]`)
}

/** Stroke a line of text with manual tracking (letter-spacing in px). */
function strokeTracked(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  ls: number,
): void {
  if (!ls) {
    ctx.strokeText(text, x, y)
    return
  }
  let cx = x
  for (const ch of text) {
    ctx.strokeText(ch, cx, y)
    cx += ctx.measureText(ch).width + ls
  }
}

function monoLabel(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  opts: { size?: number; color?: string; ls?: number; bold?: boolean } = {},
): void {
  const { size = 11, color = INK, ls = 1.2, bold = false } = opts
  ctx.save()
  ctx.font = `${bold ? 700 : 400} ${size}px "Space Mono", monospace`
  ctx.fillStyle = color
  let cx = x
  for (const ch of text) {
    ctx.fillText(ch, cx, y)
    cx += ctx.measureText(ch).width + ls
  }
  ctx.restore()
}


/**
 * Compose the full blueprint sheet at hero size (layout px × dpr).
 * `subject` is the portrait's layout rect (the trimmed cut-out box).
 */
export function composeBlueprint(
  root: HTMLElement,
  W: number,
  H: number,
  dpr: number,
  subject: Rect,
): HTMLCanvasElement {
  const c = document.createElement('canvas')
  c.width = Math.max(2, Math.round(W * dpr))
  c.height = Math.max(2, Math.round(H * dpr))
  const ctx = c.getContext('2d')!
  ctx.scale(dpr, dpr)
  const padX = W <= 768 ? 24 : 64

  // ---------- paper ----------
  ctx.fillStyle = PAPER_ALT
  ctx.fillRect(0, 0, W, H)

  // ---------- drafting grid ----------
  const minor = 48
  const major = minor * 4
  ctx.strokeStyle = 'rgba(26,23,18,0.05)'
  ctx.lineWidth = 1
  ctx.beginPath()
  for (let x = minor; x < W; x += minor) {
    ctx.moveTo(x + 0.5, 0)
    ctx.lineTo(x + 0.5, H)
  }
  for (let y = minor; y < H; y += minor) {
    ctx.moveTo(0, y + 0.5)
    ctx.lineTo(W, y + 0.5)
  }
  ctx.stroke()
  ctx.strokeStyle = 'rgba(26,23,18,0.09)'
  ctx.beginPath()
  for (let x = major; x < W; x += major) {
    ctx.moveTo(x + 0.5, 0)
    ctx.lineTo(x + 0.5, H)
  }
  for (let y = major; y < H; y += major) {
    ctx.moveTo(0, y + 0.5)
    ctx.lineTo(W, y + 0.5)
  }
  ctx.stroke()

  // registration crosses at fixed fractional spots (⌖)
  const crosses: Array<[number, number]> = [
    [0.24, 0.2],
    [0.52, 0.66],
    [0.86, 0.14],
    [0.12, 0.82],
  ]
  ctx.strokeStyle = 'rgba(154,90,62,0.55)'
  for (const [fx, fy] of crosses) {
    const x = Math.round((fx * W) / major) * major + 0.5
    const y = Math.round((fy * H) / major) * major + 0.5
    ctx.beginPath()
    ctx.moveTo(x - 7, y)
    ctx.lineTo(x + 7, y)
    ctx.moveTo(x, y - 7)
    ctx.lineTo(x, y + 7)
    ctx.stroke()
    ctx.beginPath()
    ctx.arc(x, y, 3.2, 0, Math.PI * 2)
    ctx.stroke()
  }

  // ---------- fixed labels ----------
  monoLabel(ctx, '// UNDER THE HOOD', padX, 104, {
    size: 12,
    color: TERRACOTTA,
    ls: 2.4,
  })
  monoLabel(
    ctx,
    'MODULES: [ SUBDESK ]  [ CALLYNIQ ]  [ CODESWAVE ]',
    padX,
    H - 58,
    { size: 11, color: 'rgba(26,23,18,0.72)', ls: 1.4 },
  )
  monoLabel(ctx, 'SCALE 1:1 · GRID 48', Math.max(padX, W - padX - 168), H - 58, {
    size: 10,
    color: 'rgba(26,23,18,0.45)',
    ls: 1.4,
  })

  // ---------- outline type, registered over the real DOM ----------
  const title = bp(root, 'title')
  if (title) {
    const r = offsetRect(root, title)
    const cs = getComputedStyle(title)
    const fs = parseFloat(cs.fontSize)
    const lh = parseFloat(cs.lineHeight)
    const ls = parseFloat(cs.letterSpacing) || 0
    const lines = title.innerText.split('\n').filter(Boolean)
    ctx.save()
    ctx.font = `${cs.fontStyle} ${cs.fontWeight} ${fs}px Archivo, sans-serif`
    ctx.textBaseline = 'alphabetic'
    ctx.strokeStyle = 'rgba(26,23,18,0.6)'
    ctx.lineWidth = 1.6
    ctx.lineJoin = 'round'
    // baseline within each CSS line box: centred cap-height (cap ≈ 0.72em)
    lines.forEach((line, i) => {
      strokeTracked(ctx, line, r.x, r.y + lh * i + (lh + fs * 0.72) / 2, ls)
    })
    ctx.restore()
  }

  const serif = bp(root, 'serifSub')
  if (serif) {
    const r = offsetRect(root, serif)
    const cs = getComputedStyle(serif)
    const fs = parseFloat(cs.fontSize)
    ctx.save()
    ctx.font = `italic ${fs}px "Instrument Serif", serif`
    ctx.textBaseline = 'alphabetic'
    ctx.strokeStyle = 'rgba(154,90,62,0.62)'
    ctx.lineWidth = 1
    strokeTracked(ctx, serif.innerText, r.x, r.y + (r.h + fs * 0.68) / 2, 0)
    ctx.restore()
  }

  const role = bp(root, 'role')
  if (role) {
    const r = offsetRect(root, role)
    const cs = getComputedStyle(role)
    const fs = parseFloat(cs.fontSize)
    const ls = parseFloat(cs.letterSpacing) || 0
    ctx.save()
    ctx.font = `${cs.fontWeight} ${fs}px Archivo, sans-serif`
    ctx.textBaseline = 'alphabetic'
    ctx.strokeStyle = 'rgba(26,23,18,0.6)'
    ctx.lineWidth = 1
    ctx.lineJoin = 'round'
    strokeTracked(ctx, role.innerText, r.x, r.y + (r.h + fs * 0.72) / 2, ls)
    ctx.restore()
  }

  // one or more eyebrow lines; type metrics read live so the phone
  // breakpoint's tighter tracking registers too
  for (const eyebrow of root.querySelectorAll<HTMLElement>('[data-bp="eyebrow"]')) {
    const r = offsetRect(root, eyebrow)
    const cs = getComputedStyle(eyebrow)
    const fs = parseFloat(cs.fontSize)
    monoLabel(ctx, eyebrow.innerText.toUpperCase(), r.x, r.y + (r.h + fs * 0.62) / 2, {
      size: fs,
      color: TERRACOTTA,
      ls: parseFloat(cs.letterSpacing) || 0,
    })
  }

  // lead → redaction rules (schematic placeholder lines, one per text line)
  const lead = bp(root, 'lead')
  if (lead) {
    const r = offsetRect(root, lead)
    const lh = parseFloat(getComputedStyle(lead).lineHeight) || 33
    const n = Math.max(1, Math.round(r.h / lh))
    ctx.save()
    ctx.strokeStyle = 'rgba(26,23,18,0.28)'
    ctx.lineWidth = 1
    for (let i = 0; i < n; i++) {
      const y = Math.round(r.y + lh * i + lh / 2) + 0.5
      const w = i === n - 1 ? r.w * 0.55 : r.w * (0.92 - 0.06 * (i % 2))
      ctx.beginPath()
      ctx.moveTo(r.x, y)
      ctx.lineTo(r.x + w, y)
      ctx.stroke()
      // hatch ticks
      ctx.beginPath()
      for (let x = r.x; x < r.x + w; x += 14) {
        ctx.moveTo(x, y - 2.5)
        ctx.lineTo(x + 5, y + 2.5)
      }
      ctx.strokeStyle = 'rgba(26,23,18,0.1)'
      ctx.stroke()
      ctx.strokeStyle = 'rgba(26,23,18,0.28)'
    }
    ctx.restore()
  }

  // buttons → dashed schematic pills
  const btnRow = bp(root, 'btnRow')
  if (btnRow) {
    const children = Array.from(btnRow.children) as HTMLElement[]
    ctx.save()
    ctx.setLineDash([5, 4])
    ctx.strokeStyle = 'rgba(26,23,18,0.45)'
    ctx.lineWidth = 1
    for (const child of children) {
      const r = offsetRect(root, child)
      ctx.beginPath()
      ctx.roundRect(r.x + 0.5, r.y + 0.5, r.w, r.h, r.h / 2)
      ctx.stroke()
      // replicate the real button's type metrics (mono 12.5px, tracking
      // 0.12em, padding-left 26px) so a half-revealed button reads as ONE
      // label changing weight — not two labels fighting
      const label = child.innerText.replace(/[↘→]/g, '').trim().toUpperCase()
      ctx.setLineDash([])
      monoLabel(ctx, label, r.x + 26, r.y + r.h / 2 + 4.5, {
        size: 12.5,
        color: 'rgba(26,23,18,0.6)',
        ls: 12.5 * 0.12,
        bold: false,
      })
      ctx.setLineDash([5, 4])
    }
    ctx.restore()
  }

  // ---------- portrait ruler ----------
  {
    const rx = Math.round(subject.x - 20) + 0.5
    ctx.save()
    ctx.strokeStyle = 'rgba(26,23,18,0.35)'
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(rx, subject.y)
    ctx.lineTo(rx, subject.y + subject.h)
    ctx.stroke()
    for (let y = 0; y <= subject.h; y += 64) {
      const big = y % 128 === 0
      ctx.beginPath()
      ctx.moveTo(rx - (big ? 9 : 5), subject.y + y + 0.5)
      ctx.lineTo(rx, subject.y + y + 0.5)
      ctx.stroke()
      if (big)
        monoLabel(ctx, String(y).padStart(4, '0'), rx - 46, subject.y + y + 3.5, {
          size: 9,
          color: 'rgba(26,23,18,0.5)',
          ls: 0.5,
        })
    }
    ctx.restore()
  }

  // ---------- annotation callouts with leader lines ----------
  drawAnnotations(ctx, W, H, padX, subject)

  return c
}

/** The callouts + leader lines + body-target rings, shared by the sheet and
 *  the transparent hint overlay. */
function drawAnnotations(
  ctx: CanvasRenderingContext2D,
  W: number,
  H: number,
  padX: number,
  subject: Rect,
): void {
  for (const a of HERO_ANNOTATIONS) {
    const px = subject.x + subject.w * a.ax
    const py = subject.y + subject.h * a.ay
    let lx = px + a.dx
    let ly = py + a.dy
    // clamp label into the sheet
    lx = Math.max(padX, Math.min(W - 190, lx))
    ly = Math.max(120, Math.min(H - 80, ly))

    ctx.save()
    // target: small circle + crosshair
    ctx.strokeStyle = 'rgba(154,90,62,0.85)'
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.arc(px, py, 3.4, 0, Math.PI * 2)
    ctx.stroke()
    // leader: target → elbow → label
    ctx.strokeStyle = 'rgba(26,23,18,0.4)'
    ctx.beginPath()
    ctx.moveTo(px + (lx > px ? 4 : -4), py + (ly > py ? 3 : -3))
    ctx.lineTo(lx + (lx > px ? -8 : 26), ly - 4)
    ctx.lineTo(lx + (lx > px ? 18 : 0), ly - 4)
    ctx.stroke()
    ctx.restore()

    monoLabel(ctx, a.label.toUpperCase(), lx, ly + 8, {
      size: 11,
      color: INK,
      ls: 1.6,
      bold: true,
    })
    if (a.sub)
      monoLabel(ctx, a.sub, lx, ly + 24, {
        size: 10,
        color: 'rgba(26,23,18,0.55)',
        ls: 1.2,
      })
  }
}

/**
 * Annotation-ONLY overlay on a transparent canvas — what the head-hint shell
 * sweep ghosts in. Real alpha (no luminance keying), no grid, no sheet paper:
 * the callouts read as a data layer bound to the body, not a drafting sheet.
 */
export function composeAnnotations(
  W: number,
  H: number,
  dpr: number,
  subject: Rect,
): HTMLCanvasElement {
  const c = document.createElement('canvas')
  c.width = Math.max(2, Math.round(W * dpr))
  c.height = Math.max(2, Math.round(H * dpr))
  const ctx = c.getContext('2d')!
  ctx.scale(dpr, dpr)
  drawAnnotations(ctx, W, H, W <= 768 ? 24 : 64, subject)
  return c
}
