/**
 * three.js layer for the hero scan reveal.
 *
 * Two meshes under an orthographic camera mapped 1:1 to hero layout px
 * (world y-up; JS flips DOM y once when setting uniforms/positions):
 *
 *  - blueprint plane — full-hero quad. Fragment shader computes the scanner
 *    FIELD: a rounded-rect SDF around the spring point whose boundary is
 *    wobbled by drifting fbm noise (±SCAN.DISTORT px). Inside → the opaque
 *    blueprint sheet (composed in three/blueprint.ts) replaces the DOM
 *    beneath; the boundary gets a faint terracotta energy glow; outside →
 *    fully transparent. No chrome anywhere — the material change IS the edge.
 *
 *  - relief mesh — a subdivided plane over the portrait cut-out, vertex-
 *    displaced by the silhouette-inflated depth map and lit by its gradient.
 *    Inside the field it draws the Sobel line-work + a surface-hugging scan
 *    mesh (the "3D wireframe" read); outside it breathes as a whisper-alpha
 *    ghost — the Lando wireframe-shell idea. The mesh tilts a few degrees
 *    toward the field centre for genuine parallax.
 *
 * Both materials share ONE uniforms object, so per-frame updates are single
 * writes. All shader px math happens in DOM coordinates (y down).
 */
import * as THREE from 'three'
import { SCAN } from '../hooks/scanReveal'

export interface FieldFrame {
  /** field centre, DOM px */
  x: number
  y: number
  /** full window size, px (pre-entrance) */
  w: number
  h: number
  /** entrance progress 0..1 (scales the field) */
  enter: number
  /** seconds since mount (noise drift / ghost breath) */
  time: number
  /** relief tilt, radians */
  tiltX: number
  tiltY: number
  /** head-hint section sweep: progress 0..1 down the head, strength 0..1 */
  hint: number
  hintAmp: number
  /** silhouette-rim traveling light: progress 0..1 down the body, strength 0..1 */
  rimPulse: number
  rimAmp: number
}

export interface HeroScene {
  setSize(w: number, h: number): void
  setBlueprint(sheet: HTMLCanvasElement, annot: HTMLCanvasElement): void
  setRelief(
    edge: HTMLCanvasElement,
    depth: HTMLCanvasElement,
    rim: HTMLCanvasElement,
    rect: { x: number; y: number; w: number; h: number },
  ): void
  frame(f: FieldFrame): void
  dispose(): void
}

/* ---------------- shared GLSL ---------------- */

const NOISE_GLSL = /* glsl */ `
  float hash21(vec2 p) {
    p = fract(p * vec2(234.34, 435.345));
    p += dot(p, p + 34.23);
    return fract(p.x * p.y);
  }
  float vnoise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(hash21(i), hash21(i + vec2(1.0, 0.0)), u.x),
      mix(hash21(i + vec2(0.0, 1.0)), hash21(i + vec2(1.0, 1.0)), u.x),
      u.y
    );
  }
  float fbm(vec2 p) {
    float v = 0.0;
    float a = 0.5;
    for (int i = 0; i < 3; i++) {
      v += a * vnoise(p);
      p = p * 2.03 + vec2(11.7, 7.3);
      a *= 0.5;
    }
    return v;
  }
  // signed distance to a rounded rect centred at c with half-extents b
  float sdRoundRect(vec2 p, vec2 c, vec2 b, float r) {
    vec2 q = abs(p - c) - b + r;
    return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r;
  }
  // scanner field distance in px: SDF + drifting noise wobble
  float fieldD(vec2 px, vec2 center, vec2 half_, float time,
               float distort, float nscale, float drift) {
    float d = sdRoundRect(px, center, half_, ${SCAN.RADIUS.toFixed(1)});
    float n = fbm(px * nscale + vec2(time * drift, time * drift * 0.83));
    return d + (n - 0.5) * 2.0 * distort;
  }

  // ---- head-hint "shell scan" (the Lando ghost-helmet gesture) ----
  // uSubj = (x, y, width, height) of the portrait rect in DOM px; prog 0..1
  // sweeps the cutting plane from just above the crown to near the hem —
  // deep enough that every annotation anchor (deepest ay 0.84) is passed
  // even after the contour lift delays it by up to HINT_WRAP px.
  float hintCutY(vec4 subj, float prog) {
    return mix(subj.y - 60.0, subj.y + 0.95 * subj.w, prog);
  }
  // signed distance (px, +below) from the CONTOUR-CONFORMING cut. The lift
  // composes the depth shell (silhouette falloff + skirt) with a parabolic
  // dome across the figure's width — the depth field plateaus at 1 inside
  // the body, which alone would just shift a straight line; the dome keeps
  // the edge arcing smoothly over the spine and dipping toward the sides,
  // like a section plane wrapping the form. Off-shell (dep→0) it returns to
  // flat, where callers mask it away entirely.
  float hintCutD(vec2 px, vec4 subj, float ly, float dep) {
    float t = clamp(abs(px.x - (subj.x + subj.z * 0.5)) / (subj.z * 0.62), 0.0, 1.0);
    float dome = 1.0 - t * t;
    return px.y + ${SCAN.HINT_WRAP.toFixed(1)} * dep * (0.45 + 0.55 * dome) - ly;
  }
`

/* ---------------- blueprint plane ---------------- */

const BP_VERT = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const BP_FRAG = /* glsl */ `
  precision highp float;
  varying vec2 vUv;
  uniform sampler2D uSheet;
  uniform sampler2D uAnnot;  // annotation-only overlay (transparent canvas)
  uniform sampler2D uDepth;  // subject depth shell (subject-rect UV space)
  uniform sampler2D uRim;    // silhouette rim: R = ink line, G = halo
  uniform vec2 uRes;
  uniform vec2 uCenter;   // DOM px
  uniform vec2 uHalf;     // px half-extents (entrance-scaled)
  uniform vec4 uSubj;     // portrait rect (x, y, w, h) DOM px
  uniform float uTime;
  uniform float uEnter;
  uniform float uHint;    // shell-scan progress 0..1
  uniform float uHintAmp; // shell-scan strength 0..1
  uniform float uRimPulse; // rim traveling-light progress 0..1
  uniform float uRimAmp;   // rim traveling-light strength 0..1
  ${NOISE_GLSL}

  // px beyond which noise can no longer flip inside/outside
  const float OUT_BAND = ${(SCAN.DISTORT + SCAN.FEATHER + 2).toFixed(1)};
  // px band (inside) where the boundary glow still needs exact noise
  const float IN_BAND = ${(SCAN.DISTORT + SCAN.GLOW_W * 3).toFixed(1)};

  void main() {
    // DOM-style px coords (y down) — uCenter is passed in DOM space
    vec2 px = vec2(vUv.x * uRes.x, (1.0 - vUv.y) * uRes.y);

    // ---- silhouette rim: always-on ink contour + terracotta halo hugging
    // the cut-out (masks the matte fringe); a traveling light with a sharp
    // leading edge and a comet tail runs down it on its own loop. Drawn on
    // THIS flat plane (not the tilting relief) so it registers exactly over
    // the DOM photo. ----
    float rimLine = 0.0;
    float rimGlow = 0.0;
    {
      vec2 ruv = vec2((px.x - uSubj.x) / uSubj.z,
                      1.0 - (px.y - uSubj.y) / uSubj.w);
      if (ruv.x > 0.0 && ruv.x < 1.0 && ruv.y > 0.0 && ruv.y < 1.0) {
        vec4 rim = texture2D(uRim, ruv);
        if (rim.r + rim.g > 0.004) {
          // pulse line sweeps top→bottom with overshoot so it enters/exits
          float py = uSubj.y - 40.0 + uRimPulse * (uSubj.w + 80.0);
          float dy = px.y - py;
          float pulse = (dy > 0.0
            ? exp(-dy / ${SCAN.RIM_FRONT.toFixed(1)})
            : exp(dy / ${SCAN.RIM_TAIL.toFixed(1)})) * uRimAmp;
          rimLine = rim.r * (${SCAN.RIM_LINE_A.toFixed(2)} + ${SCAN.RIM_BOOST.toFixed(2)} * pulse);
          rimGlow = rim.g * (${SCAN.RIM_GLOW_A.toFixed(2)} + ${(SCAN.RIM_BOOST * 0.8).toFixed(2)} * pulse);
        }
      }
    }
    float rimA = max(rimLine, rimGlow) * uEnter;

    // ---- head-hint shell scan: the stack callouts ghost in as the cut
    // passes them and SETTLE; a terracotta edge rides the body contour ----
    float hintInkA = 0.0;
    float edgeA = 0.0;
    vec3 hintRGB = vec3(0.0);
    if (uHintAmp > 0.003) {
      // depth sampled in subject-rect UV (flipY texture → v inverted);
      // outside the rect the shell is zero, killing any off-body edge
      vec2 suv = vec2((px.x - uSubj.x) / uSubj.z,
                      1.0 - (px.y - uSubj.y) / uSubj.w);
      float dep = (suv.x > 0.0 && suv.x < 1.0 && suv.y > 0.0 && suv.y < 1.0)
        ? texture2D(uDepth, suv).r : 0.0;
      float dc = hintCutD(px, uSubj, hintCutY(uSubj, uHint), dep);
      float passed = 1.0 - smoothstep(-3.0, 3.0, dc); // revealed & settled
      vec4 an = texture2D(uAnnot, vUv);
      hintInkA = an.a * passed * uHintAmp;
      // cut-edge glow ONLY on the depth shell (dep gate) — no ruler line
      float shell = smoothstep(0.03, 0.24, dep);
      edgeA = exp(-abs(dc) / ${SCAN.HINT_EDGE.toFixed(1)}) * shell * uHintAmp * 0.85;
      // annotation ink warmed toward terracotta over the subject so it
      // stays legible on the dark hoodie and on paper alike
      float inSubj = step(uSubj.x, px.x) * step(px.x, uSubj.x + uSubj.z) *
                     step(uSubj.y, px.y) * step(px.y, uSubj.y + uSubj.w);
      hintRGB = mix(an.rgb, vec3(0.78, 0.52, 0.40), inSubj * 0.55);
    }

    // cheap un-noised SDF first — most pixels exit before touching fbm
    float dp = sdRoundRect(px, uCenter, uHalf, ${SCAN.RADIUS.toFixed(1)});
    if (dp > OUT_BAND && hintInkA < 0.004 && edgeA < 0.004 && rimA < 0.004) discard;

    float inside = 0.0;
    float d = dp;
    if (dp <= OUT_BAND) {
      d = dp > -IN_BAND
        ? fieldD(px, uCenter, uHalf, uTime,
                 ${SCAN.DISTORT.toFixed(1)},
                 ${SCAN.NOISE_SCALE.toFixed(6)},
                 ${SCAN.NOISE_DRIFT.toFixed(3)})
        : dp; // deep interior: inside saturates, glow is negligible
      inside = 1.0 - smoothstep(-${SCAN.FEATHER.toFixed(2)},
                                 ${SCAN.FEATHER.toFixed(2)}, d);
    }
    float a = inside * uEnter;
    float hintA = max(hintInkA, edgeA) * uEnter * (1.0 - inside);

    if (a < 0.003 && hintA < 0.004 && rimA < 0.004) discard;

    vec4 sheet = texture2D(uSheet, vUv);

    // film grain — quiet, animated, only inside the field
    float g = hash21(px * 0.7 + fract(uTime) * 61.7) - 0.5;
    sheet.rgb += g * 0.035;

    // whisper of terracotta energy hugging the INSIDE of the cut only —
    // Lando has no chrome at all; this is the last trace of "scan" light.
    // min(d, 0): outside the field d is large-positive and raw exp() would
    // overflow to Inf → NaN through the final mix. Bounded at GLOW_A.
    float glow = exp(min(d, 0.0) / ${SCAN.GLOW_W.toFixed(1)}) * ${SCAN.GLOW_A.toFixed(2)};
    vec3 col = mix(sheet.rgb, vec3(0.604, 0.353, 0.243), glow);

    // hint colour: annotation ink, pulled to terracotta along the cut edge
    vec3 hintCol = mix(hintRGB, vec3(0.604, 0.353, 0.243),
                       clamp(edgeA * 1.8 - hintInkA * 0.5, 0.0, 1.0));

    float aOut = max(a, hintA);
    vec3 colOut = mix(hintCol, col, inside);

    // rim composites over both states: pure ink/halo above the live photo
    // outside the field, and the same contour inked onto the sheet inside —
    // the border is continuous no matter where the scanner is. Where the
    // line channel dominates the color is ink; halo-only regions warm to
    // terracotta.
    vec3 rimCol = mix(vec3(0.604, 0.353, 0.243), vec3(0.102, 0.090, 0.071),
                      clamp(rimLine * 1.7 - rimGlow * 0.5, 0.0, 1.0));
    float aF = max(aOut, rimA);
    vec3 colF = mix(colOut, rimCol,
                    aF > 0.003 ? clamp(rimA / aF, 0.0, 1.0) : 0.0);
    gl_FragColor = vec4(colF, aF);
  }
`

/* ---------------- relief mesh ---------------- */

const RELIEF_VERT = /* glsl */ `
  varying vec2 vUv;
  varying vec2 vPx;      // hero DOM px of this vertex (pre-displacement)
  uniform sampler2D uDepth;
  uniform vec2 uRes;
  void main() {
    vUv = uv;
    float depth = texture2D(uDepth, uv).r;
    vec3 pos = position + vec3(0.0, 0.0, depth * ${SCAN.RELIEF_DEPTH.toFixed(1)});
    vec4 world = modelMatrix * vec4(pos, 1.0);
    vPx = vec2(world.x, uRes.y - world.y); // world y-up → DOM y-down
    gl_Position = projectionMatrix * viewMatrix * world;
  }
`

const RELIEF_FRAG = /* glsl */ `
  precision highp float;
  varying vec2 vUv;
  varying vec2 vPx;
  uniform sampler2D uEdge;
  uniform sampler2D uDepth;
  uniform vec2 uRes;
  uniform vec2 uCenter;
  uniform vec2 uHalf;
  uniform vec2 uMeshSize; // mesh size in px (local scan-grid spacing)
  uniform vec4 uSubj;
  uniform float uTime;
  uniform float uEnter;
  uniform float uGhost;
  uniform float uHint;
  uniform float uHintAmp;
  ${NOISE_GLSL}

  const float OUT_BAND = ${(SCAN.DISTORT + SCAN.FEATHER + 2).toFixed(1)};

  void main() {
    vec4 edge = texture2D(uEdge, vUv);
    float depthHere = texture2D(uDepth, vUv).r;

    // cheap un-noised SDF; exact noisy distance only near the boundary
    float dp = sdRoundRect(vPx, uCenter, uHalf, ${SCAN.RADIUS.toFixed(1)});

    // ---- shell scan: contour-conforming cut against the depth shell.
    // Revealed region (above the cut) settles as a faint terracotta
    // wireframe hugging the form; the cut edge glows; a whisper pre-echo
    // of the mesh sits below the cut so the shell feels present before
    // the scan confirms it. All gated to the shell (depthHere).
    float hintSettle = 0.0; // settled wireframe strength
    float hintEdge = 0.0;   // cut-edge glow strength
    if (uHintAmp > 0.003) {
      float dc = hintCutD(vPx, uSubj, hintCutY(uSubj, uHint), depthHere);
      float passed = 1.0 - smoothstep(-3.0, 3.0, dc);
      hintSettle = (0.22 + 0.78 * passed) * uHintAmp; // 0.22 = pre-echo
      float shell = smoothstep(0.02, 0.2, depthHere);
      hintEdge = exp(-abs(dc) / ${SCAN.HINT_EDGE.toFixed(1)}) * shell * uHintAmp;
    }

    // surface-hugging scan mesh (uv-space, follows the displaced surface);
    // needed by ghost + hint + field branches alike
    vec2 cell = fract(vUv * uMeshSize / 44.0);
    float mline = (1.0 - smoothstep(0.0, 0.09, min(cell.x, cell.y))) * 0.28;
    mline *= smoothstep(0.03, 0.2, depthHere); // grid only on the body/skirt

    // shell wireframe the hint reveals: line-work + mesh + edge glow
    float hintLines = (edge.a * 0.9 + mline * 1.1) * hintSettle + hintEdge * 0.9;

    if (dp > OUT_BAND) {
      // pure ghost region — pale breathing line-work (+ the shell scan)
      float aGhost = edge.a * uGhost;
      float a = max(aGhost, hintLines) * uEnter;
      if (a < 0.004) discard;
      // pale ghost → terracotta as the shell scan dominates
      float w = clamp((hintLines - aGhost) * 3.0, 0.0, 1.0);
      vec3 colG = mix(vec3(0.96, 0.94, 0.90), vec3(0.55, 0.33, 0.235), w);
      colG = mix(colG, vec3(0.604, 0.353, 0.243),
                 clamp(hintEdge * 1.4 - hintLines * 0.3, 0.0, 1.0));
      gl_FragColor = vec4(colG, a);
      return;
    }

    float d = fieldD(vPx, uCenter, uHalf, uTime,
                     ${SCAN.DISTORT.toFixed(1)},
                     ${SCAN.NOISE_SCALE.toFixed(6)},
                     ${SCAN.NOISE_DRIFT.toFixed(3)});
    float inside = 1.0 - smoothstep(-${SCAN.FEATHER.toFixed(2)},
                                     ${SCAN.FEATHER.toFixed(2)}, d);

    // pseudo-normal from the depth gradient → drafting-lamp shading
    vec2 t = 1.0 / vec2(512.0, 1106.0);
    float dl = texture2D(uDepth, vUv - vec2(t.x, 0.0)).r;
    float dr = texture2D(uDepth, vUv + vec2(t.x, 0.0)).r;
    float du = texture2D(uDepth, vUv - vec2(0.0, t.y)).r;
    float dd_ = texture2D(uDepth, vUv + vec2(0.0, t.y)).r;
    vec3 n = normalize(vec3((dl - dr) * 2.4, (dd_ - du) * 2.4, 0.55));
    float light = 0.72 + 0.5 * max(0.0, dot(n, normalize(vec3(-0.45, 0.6, 0.66))));

    float lines = edge.a * 0.78 + mline;
    float aIn = lines * light * inside;
    // outside-the-cut skirt: breathing ghost, lifted by the shell scan so it
    // doesn't visibly clip against the field's noise boundary
    float aOut = max(edge.a * uGhost, hintLines) * (1.0 - inside);
    float a = (aIn + aOut) * uEnter;
    if (a < 0.004) discard;

    vec3 ink = vec3(0.102, 0.090, 0.071);
    // boundary energy tints line-work at the cut
    float glow = exp(-abs(d) / ${SCAN.GLOW_W.toFixed(1)});
    vec3 colIn = mix(ink, vec3(0.604, 0.353, 0.243), glow * 0.5);
    // the breathing ghost draws PALE over the photo (ink would vanish on the
    // dark hoodie) — the Lando wireframe-shell read; terracotta in the scan
    vec3 colOut = mix(vec3(0.96, 0.94, 0.90), vec3(0.55, 0.33, 0.235),
                      clamp(hintSettle * 1.3, 0.0, 1.0));
    vec3 col = mix(colOut, colIn, inside);
    gl_FragColor = vec4(col, a);
  }
`

/* ---------------- scene ---------------- */

export function createHeroScene(canvas: HTMLCanvasElement): HeroScene | null {
  let renderer: THREE.WebGLRenderer
  try {
    renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: false, // edges are shader-feathered; MSAA is pure cost here
      powerPreference: 'high-performance',
    })
  } catch {
    return null
  }
  renderer.setClearColor(0x000000, 0)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75))

  const scene = new THREE.Scene()
  // y-up world; JS flips DOM y. Bounds set in setSize.
  const camera = new THREE.OrthographicCamera(0, 1, 1, 0, -500, 500)
  camera.position.z = 200

  const uniforms = {
    uSheet: { value: null as THREE.Texture | null },
    uAnnot: { value: null as THREE.Texture | null },
    uEdge: { value: null as THREE.Texture | null },
    uDepth: { value: null as THREE.Texture | null },
    uRim: { value: null as THREE.Texture | null },
    uRes: { value: new THREE.Vector2(1, 1) },
    uCenter: { value: new THREE.Vector2(0, 0) },
    uHalf: { value: new THREE.Vector2(0, 0) },
    uMeshSize: { value: new THREE.Vector2(1, 1) },
    uSubj: { value: new THREE.Vector4(0, 0, 1, 1) },
    uTime: { value: 0 },
    uEnter: { value: 0 },
    uGhost: { value: 0 },
    uHint: { value: 0 },
    uHintAmp: { value: 0 },
    uRimPulse: { value: 0 },
    uRimAmp: { value: 0 },
  }

  const bpGeo = new THREE.PlaneGeometry(1, 1)
  const bpMat = new THREE.ShaderMaterial({
    vertexShader: BP_VERT,
    fragmentShader: BP_FRAG,
    uniforms,
    transparent: true,
    depthTest: false,
    depthWrite: false,
  })
  const bpMesh = new THREE.Mesh(bpGeo, bpMat)
  bpMesh.renderOrder = 0
  bpMesh.frustumCulled = false
  scene.add(bpMesh)

  const reliefGeo = new THREE.PlaneGeometry(1, 1, 72, 120)
  const reliefMat = new THREE.ShaderMaterial({
    vertexShader: RELIEF_VERT,
    fragmentShader: RELIEF_FRAG,
    uniforms,
    transparent: true,
    depthTest: false,
    depthWrite: false,
  })
  const relief = new THREE.Mesh(reliefGeo, reliefMat)
  relief.renderOrder = 1
  relief.frustumCulled = false
  relief.visible = false // until setRelief
  scene.add(relief)

  let W = 1
  let H = 1
  const disposables: Array<{ dispose(): void }> = [bpGeo, bpMat, reliefGeo, reliefMat]

  // NoColorSpace on purpose: raw ShaderMaterials never run three's output
  // colorspace re-encode, so an sRGB-tagged texture would be linearized on
  // sample and come out DARK. Passing bytes through keeps the sheet's canvas
  // colors byte-identical to the DOM fallback.
  const asTexture = (c: HTMLCanvasElement): THREE.CanvasTexture => {
    const t = new THREE.CanvasTexture(c)
    t.colorSpace = THREE.NoColorSpace
    t.minFilter = THREE.LinearFilter
    t.magFilter = THREE.LinearFilter
    t.generateMipmaps = false
    disposables.push(t)
    return t
  }

  return {
    setSize(w, h) {
      W = Math.max(1, w)
      H = Math.max(1, h)
      renderer.setSize(W, H, false)
      camera.left = 0
      camera.right = W
      camera.top = H
      camera.bottom = 0
      camera.updateProjectionMatrix()
      uniforms.uRes.value.set(W, H)
      bpMesh.position.set(W / 2, H / 2, 0)
      bpMesh.scale.set(W, H, 1)
    },
    setBlueprint(sheet, annot) {
      uniforms.uSheet.value?.dispose()
      uniforms.uAnnot.value?.dispose()
      uniforms.uSheet.value = asTexture(sheet)
      uniforms.uAnnot.value = asTexture(annot)
    },
    setRelief(edge, depth, rim, rect) {
      uniforms.uEdge.value?.dispose()
      uniforms.uDepth.value?.dispose()
      uniforms.uRim.value?.dispose()
      uniforms.uEdge.value = asTexture(edge)
      uniforms.uDepth.value = asTexture(depth)
      uniforms.uRim.value = asTexture(rim)
      uniforms.uMeshSize.value.set(rect.w, rect.h)
      uniforms.uSubj.value.set(rect.x, rect.y, rect.w, rect.h)
      // DOM rect → y-up world placement
      relief.position.set(rect.x + rect.w / 2, H - (rect.y + rect.h / 2), 4)
      relief.scale.set(rect.w, rect.h, 1)
      relief.visible = true
    },
    frame(f) {
      uniforms.uCenter.value.set(f.x, f.y)
      uniforms.uHalf.value.set(
        (f.w / 2) * (0.25 + 0.75 * f.enter),
        (f.h / 2) * (0.25 + 0.75 * f.enter),
      )
      uniforms.uTime.value = f.time
      uniforms.uEnter.value = f.enter
      uniforms.uGhost.value =
        SCAN.GHOST_MIN +
        (SCAN.GHOST_MAX - SCAN.GHOST_MIN) *
          (0.5 + 0.5 * Math.sin((f.time / SCAN.GHOST_PERIOD) * Math.PI * 2))
      uniforms.uHint.value = f.hint
      uniforms.uHintAmp.value = f.hintAmp
      uniforms.uRimPulse.value = f.rimPulse
      uniforms.uRimAmp.value = f.rimAmp
      relief.rotation.x = f.tiltX
      relief.rotation.y = f.tiltY
      renderer.render(scene, camera)
    },
    dispose() {
      uniforms.uSheet.value?.dispose()
      uniforms.uAnnot.value?.dispose()
      uniforms.uEdge.value?.dispose()
      uniforms.uDepth.value?.dispose()
      uniforms.uRim.value?.dispose()
      for (const d of disposables) d.dispose()
      renderer.dispose()
    },
  }
}
