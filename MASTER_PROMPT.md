# Master Rebuild Prompt — Kimo "Opening Collection" Page

> **Version:** 1.0 | **File:** `index.html` | **Self-contained single-page app**

---

## Purpose

Recreate a luxury art-gallery landing page called **"Kimo — Opening Collection"**. The page is a single HTML file with all CSS and JavaScript inline. No build tools, no npm, no frameworks. It uses Three.js (CDN) for WebGL and GSAP + ScrollTrigger (CDN) for animations.

---

## Technology Stack

| Dependency | Version | CDN URL |
|---|---|---|
| Three.js | r160 | `https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.min.js` |
| GSAP | 3.12.5 | `https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/gsap.min.js` |
| GSAP ScrollTrigger | 3.12.5 | `https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/ScrollTrigger.min.js` |
| Google Fonts | — | Cormorant Garamond `ital,wght@0,300;0,400;1,300;1,400` + Inter `wght@300;400;500` |

**Page title:** `Kimo — Opening Collection`

---

## Design System — CSS Custom Properties

All colours are defined on `:root` and **dynamically mutated by JavaScript during scroll** to create a continuous colour-shift experience across 6 stops.

```css
:root {
  --bg:        #f4efe4;      /* warm parchment — page body */
  --stage:     #fbf7ee;      /* lighter cream — main stage card */
  --stage-rgb: 251,247,238;  /* RGB triplet for rgba() usage */
  --fg:        #111111;      /* near-black — all text / icons */
  --fg-rgb:    17,17,17;
  --ui:        #1a1a1a;      /* hamburger button background */
  --ui-icon:   #ffffff;      /* hamburger bar lines */
  --muted:     #888888;      /* secondary text / labels */
  --pill:      #ebebeb;      /* scroll pill background */
}
```

### Colour Stops (interpolated with smoothstep during scroll)

| Stop | Phase | `--stage` | `--bg` | `--fg` | Theme |
|---|---|---|---|---|---|
| 0 | Hero | `#fbf7ee` | `#f4efe4` | `#111111` | Warm light |
| 1 | Ribbon | `#f2e5d3` | `#dccab1` | `#15120f` | Sepia |
| 2 | Cloud | `#9f907a` | `#6c6254` | `#100f0d` | Dark sepia |
| 3 | Focus | `#191714` | `#0d0c0a` | `#f5eee3` | Near-black (fg inverts) |
| 4 | Details | `#101820` | `#070b10` | `#f2eee6` | Dark teal-black |
| 5 | Closing | `#fbf7ee` | `#f4efe4` | `#111111` | Back to warm light |

---

## Typography

### Serif: Cormorant Garamond

| Usage | Size | Weight | Notes |
|---|---|---|---|
| Hero headline | `clamp(54px, 10.4vw, 188px)` | 400 | line-height 0.88, letter-spacing -0.01em |
| Art title label | `clamp(30px, 3.6vw, 52px)` | 400 | line-height 0.98 |
| Section number | `clamp(24px, 2.8vw, 36px)` | 300 | line-height 1 |
| Journey number | `clamp(28px, 3.1vw, 42px)` | 300 | line-height 1 |
| Closing headline | `clamp(34px, 5.2vw, 82px)` | 400 | 2nd line: italic weight 300 |
| Focus info title | `clamp(30px, 4vw, 46px)` | 400 | line-height 0.95 |
| Menu numbers | `24px` | 300 | |

### Sans-serif: Inter

| Usage | Size | Weight | Notes |
|---|---|---|---|
| Wordmark | `12px` | 400 | letter-spacing 0.14em, UPPERCASE |
| Section kicker | `8.5px` | 500 | letter-spacing 0.18em, UPPERCASE |
| Journey title | `10px` | 500 | letter-spacing 0.17em, UPPERCASE |
| Journey desc | `12px` | 300 | line-height 1.75 |
| Labels / kickers | `10px` | 400–500 | letter-spacing 0.10–0.16em, UPPERCASE |
| Body / meta | `11–13px` | 300–400 | line-height 1.58–2.05 |

All text: `-webkit-font-smoothing: antialiased`

---

## Structural Layout

The page has **two stacking layers**:

**Layer 1 — Fixed stage (`z-index: 10`):**
```css
#stage-wrap { position: fixed; inset: 0; display: flex; align-items: center;
              justify-content: center; pointer-events: none; z-index: 10; }
#stage      { width: 100vw; height: 100dvh; background: var(--stage);
              box-shadow: inset 0 0 96px rgba(0,0,0,0.04);
              opacity: 0; transform: scale(0.96); /* animates in */ }
```

**Layer 2 — Scrollable content (`#kimo-scroll`):**  
Normal document flow; background `var(--bg)`. The `#stage` fades out as the user reaches the footer (fades over the last `32vh` before footer top).

---

## Grain Overlay

```css
body::after {
  position: fixed; inset: 0; pointer-events: none; z-index: 9999;
  opacity: 0.038;
  background-image: url("data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg'
    width='300' height='300'><filter id='n'><feTurbulence type='fractalNoise'
    baseFrequency='0.72' numOctaves='4' stitchTiles='stitch'/></filter>
    <rect width='300' height='300' filter='url(%23n)'/></svg>");
}
```

---

## Atmospheric Corner Images

Four fixed `<img class="bg-art">` elements at page corners. CSS keeps them `display:none; opacity:0`.

| ID | Corner | Width | Offset |
|---|---|---|---|
| `#bg-tl` | top-left | 200px | -12px each axis |
| `#bg-tr` | top-right | 175px | -12px each axis |
| `#bg-bl` | bottom-left | 170px | -12px each axis |
| `#bg-br` | bottom-right | 205px | -12px each axis |

All: `filter: blur(1.5px) saturate(0.78); object-fit: cover`

Unsplash sources (art/painting subjects):
- `bg-tl`: `photo-1578301978018-3005759f48f7` (w=340)
- `bg-tr`: `photo-1577083165633-14ebcdb6d7ae` (w=300)
- `bg-bl`: `photo-1578926288207-a90a103bb55a` (w=290)
- `bg-br`: `photo-1547891654-e66ed7ebb968` (w=340)

---

## Component: Stage Header

Centered flex row; padding `clamp(18px, 3.3vh, 34px)` top, 0 bottom.

### Wordmark (`#wordmark`)
- Text: **"Kimo"**
- Inter 12px / weight 400 / letter-spacing 0.14em / UPPERCASE / centered

### Hamburger Button (`#menu-btn`)
- Position: `absolute right clamp(18px,3vw,44px); top clamp(16px,2.7vh,30px)`
- `32×32px`, background `var(--ui)`, border-radius `8px`, `z-index: 60`
- 3 `<span>` bars: each `13×1.5px`, white, border-radius 2px, gap 4px
- **Open state** (`aria-expanded="true"`):
  - `span:1` → `translateY(5.5px) rotate(45deg)`
  - `span:2` → `opacity: 0`
  - `span:3` → `translateY(-5.5px) rotate(-45deg)`

### Dropdown Menu (`#page-menu`)
```css
position: absolute; right: clamp(18px,3vw,44px);
top: calc(clamp(16px,2.7vh,30px) + 42px);
width: min(260px, calc(100vw - 36px)); padding: 14px; border-radius: 8px;
background: rgba(stage-rgb, 0.88);
backdrop-filter: blur(24px) saturate(1.15);
border: 1px solid rgba(fg, 0.10);
box-shadow: 0 18px 58px rgba(0,0,0,0.14), inset 0 1px 0 rgba(255,255,255,0.66);
/* hidden: */ opacity: 0; transform: translateY(-8px); pointer-events: none;
/* open (.is-open): */ opacity: 1; transform: translateY(0); pointer-events: auto;
transition: opacity 0.22s ease, transform 0.22s ease;
```

Menu items use `grid-template-columns: 34px 1fr`:
- `.num` — Cormorant Garamond 24px weight 300
- `.label` — Inter 10px weight 500 letter-spacing 0.15em UPPERCASE

| # | Label | `data-target` |
|---|---|---|
| 01 | Hero / Closed Collection | `hero-anchor` |
| 02 | Ribbon Unlocks | `ks02` |
| 03 | Gallery Cloud | `ks03` |
| 04 | Focus | `ks04` |
| 05 | Details | `ks05` |
| 06 | Closing | `ks06` |

---

## Component: WebGL Stage Body (`#stage-body`)

`flex: 1; position: relative; overflow: hidden` — contains `<canvas id="gl">` at `position: absolute; inset: 0`.

### Bottom Fade Vignette (`#stage-body::before`)
```css
height: min(44vh, 420px);
background: linear-gradient(to top,
  rgba(stage-rgb, 0.98) 0%, rgba(stage-rgb, 0.92) 34%,
  rgba(stage-rgb, 0.62) 64%, rgba(stage-rgb, 0) 100%);
z-index: 4;
```

### Three.js Scene

```js
Renderer: alpha:true, antialias:true, pixelRatio: min(devicePixelRatio, 2)
Camera:   PerspectiveCamera(60, aspect, 1, 2000) — z auto-calculated: clamp(320, z, 760)
Lights:   AmbientLight(#ffffff, 1.0)
          DirectionalLight(#fff6ec, 0.55) at position (160, 260, 380)
```

### S-Curve Ribbon

32 cards (`N = 32`). Card plane geometry: `PlaneGeometry(52, 68)`.

```js
CW   = 430   // world-unit span (scales with viewport)
CAMP = 88    // amplitude (scales with viewport height)

// Point on curve for card at t ∈ [0,1]:
x(t)     = -CW/2 + t * CW
y(t)     = -CAMP * sin(t * π * 2)
angle(t) = -atan2(-CAMP * π * 2 * cos(t * π * 2), CW)

cardScale = clamp(min(w/900, h/560), 0.86, 1.58)
```

Each card is a `THREE.Group` (pivot) with:
- **Front mesh** — `MeshStandardMaterial({ map: texture, roughness: 0.34, metalness: 0 })`
- **Back mesh** — `MeshStandardMaterial({ color: #f4ede3, roughness: 0.6 })`, `rotation.y = π`, `z = -0.5`

### Artwork Textures (5 famous works, cycled across 32 slots)

| # | Title | Artist | Year | Wikimedia URL |
|---|---|---|---|---|
| 0 | The Starry Night | Vincent van Gogh | 1889 | `Van_Gogh_-_Starry_Night_-_Google_Art_Project.jpg` (1280px) |
| 1 | Mona Lisa | Leonardo da Vinci | c. 1503-06 | `Mona_Lisa%2C_by_Leonardo_da_Vinci%2C_from_C2RMF_retouched.jpg` |
| 2 | The Great Wave off Kanagawa | Katsushika Hokusai | c. 1831 | `Great_Wave_off_Kanagawa2.jpg` |
| 3 | Girl with a Pearl Earring | Johannes Vermeer | c. 1665 | `Meisje_met_de_parel.jpg` |
| 4 | The Kiss | Gustav Klimt | 1907-08 | `Gustav_Klimt_016.jpg` |

All from `https://upload.wikimedia.org/wikipedia/commons/thumb/...`

**Fallback** (if remote load fails): procedural canvas texture `720×940` using 4 abstract styles based on `index % 4`:
- Style 0: grid lines + coloured rectangles
- Style 1: overlapping rotated rectangles (semi-transparent)
- Style 2: circles + bezier curves
- Style 3: organic quadratic-curve shapes

All textures: `SRGBColorSpace`, `LinearFilter`, subtle noise (2600 random 1px dots at opacity 0.055).

### Spring Physics Class

```js
function Spring(v, k, d) {
  this.cur = v; this.tgt = v; this.vel = 0;
  this.k = k || 0.08; this.d = d || 0.82;
}
Spring.prototype.tick = function() {
  this.vel = (this.vel + (this.tgt - this.cur) * this.k) * this.d;
  this.cur += this.vel;
};
```

Each card has **6 springs**: `sx, sy, sz` (position), `srz, srx` (rotation), `ss` (scale).  
Global group springs: `gry` and `grx` at `k=0.038, d=0.90`.

---

## Component: Hero Headline (`#hero-headline`)

```css
position: absolute;
left/right: clamp(20px, 4vw, 76px);
bottom: clamp(20px, 3.4vh, 42px);
display: flex; align-items: flex-end; justify-content: center;
gap: clamp(18px, 3.2vw, 64px);
```

Two `<span class="hw">`:
- `#hw-l` → **"Opening"**
- `#hw-r` → **"Collection"**
- Cormorant Garamond `clamp(54px, 10.4vw, 188px)` / weight 400 / line-height 0.88 / letter-spacing -0.01em
- Start `opacity: 0` — fade in during entrance animation

---

## Component: Journey Sidebar (`#journey-copy`)

```css
position: absolute;
left: clamp(16px, 2.6vw, 34px);
top: clamp(26px, 5.2vh, 56px);
width: clamp(112px, 12vw, 172px);
z-index: 26;
```

**`::before`** — vertical rule: `1px`, `height: calc(100vh - clamp(46px,8vh,74px))`, `rgba(fg, 0.16)`  
**`::after`** — top dot: `6×6px` circle, `var(--fg)`, positioned at top of rule

| Element | Font | Size | Style |
|---|---|---|---|
| `#journey-num` | Cormorant Garamond | `clamp(28px,3.1vw,42px)` | weight 300 |
| `#journey-title` | Inter | `10px` | weight 500 / letter-spacing 0.17em / UPPERCASE |
| `#journey-desc` | Inter | `12px` | weight 300 / line-height 1.75 / color rgba(fg,0.58) |

---

## Component: Progress Dots (`#stage-progress`)

`position:absolute; right: clamp(14px,2.4vw,34px); top:50%; translateY(-50%); z-index:28`

6 dots (`.stage-progress-dot`): `7×7px` circles; `gap: 11px`
- Default: `background: rgba(fg, 0.26)`
- Active (`.is-active`): `background: var(--fg); transform: scale(1.16)`
- Click → smooth scroll to section

---

## Component: Focus Info Overlay (`#focus-info`)

```css
position: absolute; left: 50%; transform: translate(-50%, 18px);
bottom: clamp(28px, 7vh, 70px);
width: min(440px, calc(100vw - 36px));
padding: 20px 20px 18px; border-radius: 14px; z-index: 30;
opacity: 0; pointer-events: none;
```

### Glassmorphism Background
```css
background:
  linear-gradient(145deg, rgba(255,255,255,0.74), rgba(255,255,255,0.38) 44%, rgba(255,255,255,0.52)),
  radial-gradient(circle at 12% 0%, rgba(255,255,255,0.78), rgba(255,255,255,0) 34%),
  rgba(242,239,234,0.48);
backdrop-filter: blur(34px) saturate(1.45) contrast(1.08);
border: 1px solid rgba(255,255,255,0.58);
box-shadow:
  0 24px 90px rgba(0,0,0,0.18),
  0 8px 28px rgba(0,0,0,0.08),
  inset 0 1px 0 rgba(255,255,255,0.88),
  inset 0 -1px 0 rgba(255,255,255,0.28);
```

**`::before`** overlay: `mix-blend-mode: screen` — adds specular shimmer  
**`::after`** inner shadow: `inset 0 0 0 1px rgba(255,255,255,0.26), inset 0 -18px 42px rgba(255,255,255,0.24)`

**Close button** (`#focus-close`): `30×30px` circle, same glass treatment, `×` symbol, hover `scale(1.06)`

**Open animation:** GSAP `opacity→1, y→0`, duration 0.72s, `expo.out`  
**Close animation:** GSAP `opacity→0, y→18`, duration 0.42s, `power3.inOut`

---

## Interaction System

### Hover (ribbon state, `journey.phase < 0.82`)
- **Hovered card:** `+18` normal-x, `+26` normal-y, `+52` z-depth, `scale→1.08`
- **±4 neighbours:** spread tangentially along curve: `strength = (5 − distance) / 4`
  - `slide = strength × 34` in tangent direction
  - `depth = strength × 24` in z
  - `settle = strength × 9` pullback
  - `rotation += side × strength × 0.08`

### Drag
- `mousedown` on hovered → begins drag; 12px threshold before `draggingActive = true`
- Position mapped to world space at `z = 105`
- `srz.tgt = velocityX × 0.020` — card tilts in drag direction; `srx.tgt = -0.38`
- **Release with world-dist > 115** → card becomes **scattered** (floats off-ribbon)
- **Release with dist ≤ 115** → `returnToRibbon()`
- **Click (no drag)** → `openFocus()`
- **Double-click scattered card** → `returnToRibbon()`

### Spring Tuning Profiles

| Profile | sx/sy k/d | sz k/d | srz k/d |
|---|---|---|---|
| `ribbon` | 0.085 / 0.58 | 0.082 / 0.56 | 0.078 / 0.58 |
| `drag` | 0.110 / 0.66 | 0.105 / 0.62 | 0.090 / 0.64 |
| `focus-main` | 0.082 / 0.58 | 0.080 / 0.56 | 0.076 / 0.58 |
| `focus-rest` | 0.074 / 0.56 | 0.070 / 0.54 | 0.070 / 0.56 |

---

## Entrance Animation (GSAP Timeline, `delay: 0.12s`)

| Time | Target | Effect |
|---|---|---|
| `+0.18s` | `#stage` | `opacity→1, scale→1`, 0.7s `power3.out` |
| `+0.62s` | `.hw` | `opacity→1`, 0.5s `power2.out`, stagger 0.1s |
| `+0.82s` | `#launch-date, #card-count` | `opacity→1`, 0.5s |
| `+0.68s` | (callback) | Ribbon draws center-outward: each card `ss.tgt=1`, 28ms stagger |
| `+1.0s` | `#hint` | `opacity→1` (then fades out 2.8s later) |

---

## Scroll Experience — 6-Phase Journey

`journey.phase` is a `float 0–5` computed from scroll position:
```js
marker = window.scrollY + window.innerHeight * 0.42
// phase = lerp between section tops, smoothstepped
```

### Chapter Targets (3D ribbon morphs per phase)

**Phase 0 — Hero:** Tight S-curve. Scale `0.84` (desktop) / `0.9` (mobile).

**Phase 1 — Ribbon Unlocks:**
```js
spreadX = (t − 0.5) × visible.width × 0.66
waveY   = -sin(t × π × 2.2) × visible.height × 0.18
lift    = sin(t × π × 4) × visible.height × 0.06
// lerp base→spread at 68%; z: 22 + seed×130
```

**Phase 2 — Gallery Cloud:**
```js
x = (seed − 0.5) × visible.width × 0.86   // centred spread
y = (seed − 0.5) × visible.height × 0.78
z = -70 + seed × 260
scale = (0.56 + seed × 0.94) / cardScale
```

**Phase 3 — Focus:**
- `focusCardIndex` (card #3, Vermeer) → `z=168`, `scale=2.42/cardScale`
- Others → ring at `±0.42 × visible dims`, `scale ≈ 0.42–0.64/cardScale`

**Phase 4 — Details:**
- `focusCardIndex` → `z=210`, `scale=5.8/cardScale`, `x = -visible.width×0.10`
- Others → pushed far left/right, `z=-110 to -72`, tiny scale

**Phase 5 — Closing:**
```js
x = (t − 0.5) × visible.width × 0.30
y = -sin(t × π × 2) × visible.height × 0.055 − visible.height × 0.04
scale = 0.56/cardScale
```

> **`seededRand(seed)`** = `frac(sin(seed × 12.9898) × 43758.5453)` — deterministic per card

---

## Scroll Sections HTML

### Shared Section Structure (`.ks`)
```html
<section class="ks" id="ksXX">
  <aside class="ks-lbl">
    <div class="ks-rule"><div class="ks-dot"></div></div>
    <div class="ks-inner">
      <span class="ks-num">XX</span>
      <span class="ks-ttl">SECTION TITLE</span>
      <p class="ks-dsc">Description text.</p>
    </div>
  </aside>
  <div class="ks-stage"><!-- section-specific content --></div>
</section>
```

Left column `.ks-lbl`: `width: clamp(128px, 13vw, 176px)`, sticky, `height: 100vh`  
`.ks-rule`: absolute `1px` rule `rgba(0,0,0,0.09)` with `.ks-dot` (6×6px, fg colour)

### Art Card Base Styles (`.art-card`)
```css
.art-card {
  position: absolute;
  width: var(--w, 74px);
  height: calc(var(--w, 74px) * 1.3);
  transform: translate(-50%, -50%) rotate(var(--rot, 0deg));
  filter: blur(var(--blur, 0px));
  border-radius: 2px; overflow: hidden;
  box-shadow: 0 2px 10px rgba(0,0,0,0.10), 0 8px 32px rgba(0,0,0,0.09);
}
```

---

### Section 02 — Ribbon Unlocks

15 `.art-card.s02-card` elements:

| `left` | `top` | `--w` | `--rot` | Image |
|---|---|---|---|---|
| 5% | 57% | 68px | -28deg | painting_02 |
| 12% | 42% | 72px | -20deg | painting_04 |
| 18% | 27% | 76px | -13deg | painting_01 |
| 25% | 44% | 72px | -7deg | painting_05 |
| 31% | 60% | 74px | -1deg | painting_03 |
| 38% | 48% | 78px | 5deg | painting_02 |
| 44% | 33% | 74px | 9deg | painting_04 |
| 50% | 21% | 70px | 13deg | painting_01 |
| 56% | 38% | 76px | 8deg | painting_05 |
| 62% | 55% | 72px | 14deg | painting_03 |
| 68% | 44% | 78px | 19deg | painting_02 |
| 74% | 30% | 74px | 23deg | painting_04 |
| 80% | 47% | 72px | 26deg | painting_01 |
| 86% | 62% | 68px | 29deg | painting_05 |
| 92% | 47% | 74px | 24deg | painting_03 |

---

### Section 03 — Gallery Cloud

`ks-stage min-height: 150vh`. 12 `.art-card.s03-card` + right nav dots.

| `left` | `top` | `--w` | `--rot` | `--blur` | `data-depth` | Image |
|---|---|---|---|---|---|---|
| 8% | 18% | 88px | -14deg | 2px | -0.6 | painting_03 |
| 16% | 59% | 100px | -6deg | 0px | 0.3 | painting_01 |
| 23% | 32% | 82px | 8deg | 1px | -0.2 | painting_05 |
| 30% | 74% | 78px | -10deg | 3px | -0.8 | painting_02 |
| 38% | 27% | 122px | 4deg | 0px | 0.5 | painting_04 |
| 47% | 56% | 96px | -4deg | 0.5px | 0.1 | painting_03 |
| 56% | 16% | 84px | 12deg | 1.5px | -0.4 | painting_01 |
| 63% | 65% | 94px | -8deg | 0px | 0.4 | painting_02 |
| 71% | 39% | 86px | 16deg | 1px | -0.3 | painting_05 |
| 80% | 21% | 80px | -18deg | 2.5px | -0.7 | painting_04 |
| 87% | 58% | 90px | 10deg | 2px | -0.5 | painting_03 |
| 4% | 79% | 84px | 14deg | 3.5px | -0.9 | painting_01 |

Right-side nav: 5 `.s03-nav-dot` elements, first one active.

---

### Section 04 — Focus

`ks-stage` is `display:flex; align-items:center; justify-content:center`.

6 background `.s04-bg` cards (blurred):

| `left` | `top` | `--w` | `--rot` | `--blur` |
|---|---|---|---|---|
| 4% | 22% | 76px | -15deg | 6px |
| 10% | 69% | 70px | 8deg | 5px |
| 75% | 18% | 80px | 12deg | 6px |
| 83% | 66% | 74px | -9deg | 5px |
| 2% | 47% | 66px | -20deg | 7px |
| 88% | 43% | 72px | 18deg | 6px |

Featured `.s04-focus-row` (flex row, gap `clamp(28px,4vw,64px)`):
- `.s04-focus-card` — `clamp(148px,14.5vw,216px)` wide × `×1.3` tall; **painting_04.jpg**
- `.s04-info`:
  - Artist: "Johannes Vermeer" (10px, UPPERCASE, muted)
  - Title: "Girl with a Pearl Earring" (Cormorant Garamond `clamp(22px,2.8vw,40px)`)
  - Meta: "c. 1665 / Oil on canvas" (11px, weight 300)

---

### Section 05 — Details

`ks-stage` flex centred.

- `.s05-thumb` — `60×76px`, absolute `top: clamp(18px,3.6vh,50px); right: clamp(50px,7.5vw,96px)` — **painting_01.jpg**
- `.s05-crop` — `clamp(260px,50vw,600px)` × `clamp(240px,42vw,520px)`:
  ```css
  img {
    object-fit: cover; object-position: 40% 28%;
    transform: scale(3.5); transform-origin: 40% 28%;
  }
  ```
  Image: **painting_01.jpg** — creates zoomed crop effect

---

### Section 06 — Closing

`ks-stage` flex-column centred, `gap: 52px; min-height: 110vh; padding: 80px 20px`.

`.s06-ribbon` (`width: min(420px,80vw); height: 140px; position: relative`):

7 `.art-card.s06-card` forming a gentle arc:

| `left` | `top` | `--w` | `--rot` | Image |
|---|---|---|---|---|
| 29% | 48% | 52px | -22deg | painting_01 |
| 37% | 37% | 54px | -14deg | painting_02 |
| 43% | 46% | 56px | -6deg | painting_03 |
| 50% | 57% | 56px | 2deg | painting_04 |
| 57% | 47% | 54px | 9deg | painting_05 |
| 63% | 37% | 56px | 15deg | painting_01 |
| 70% | 48% | 52px | 21deg | painting_02 |

`.s06-heading` (Cormorant Garamond `clamp(28px,4.6vw,60px)`, opacity:0):
- `p` → **"Art is endless."** (weight 400)
- `p+p` → **"So is curiosity."** (italic, weight 300)

---

### Footer (`#kimo-footer`)

```css
display: flex; justify-content: space-between; align-items: center;
padding: clamp(18px,2.8vh,32px) clamp(18px,4.8vw,76px);
border-top: 1px solid rgba(0,0,0,0.06);
background: var(--bg); opacity: 0; /* fades in via ScrollTrigger at 88% */
```

- Left: `© KIMO 2026` — 10px, letter-spacing 0.10em, UPPERCASE, `var(--muted)`
- Right nav: `About` / `Contact` / `Journal` — 10px, letter-spacing 0.12em, UPPERCASE, opacity 0.65 → 1 hover

---

## Local Image Assets

Path: `Resources/artworks/`

| File | Used as |
|---|---|
| `painting_01.jpg` | The Starry Night |
| `painting_02.jpg` | Mona Lisa |
| `painting_03.jpg` | The Great Wave |
| `painting_04.jpg` | Girl with a Pearl Earring |
| `painting_05.jpg` | The Kiss |

> If reproducing without local files, replace `src` attributes with the Wikimedia URLs listed in the textures table. The Three.js layer already uses the Wikimedia URLs.

---

## Responsive Breakpoints

### `@media (max-width: 760px)`
- `#journey-copy`: `top: clamp(22px,7vh,46px); width: 118px`
- `.hw`: `font-size: clamp(38px,11.4vw,62px)`
- `#hero-headline`: `left/right: 18px; bottom: clamp(34px,7vh,64px)`
- `#hero-meta`: `left/right: 18px`
- `#closing-headline`: `top: calc(50% + clamp(76px,15vh,116px)); width: min(310px,76vw)`
- `#stage-art-label`: repositioned to bottom-left
- `#stage-progress`: `right: 12px`

### `@media (max-width: 700px)`
- `#focus-info`: `bottom: 24px`

---

## Accessibility

- `aria-label` on menu button, progress dots, navigation
- `aria-expanded` on hamburger button
- `aria-hidden` on decorative elements and closed dropdown
- `aria-live="polite"` on `#journey-copy` and `#focus-info`
- `prefers-reduced-motion`: springs become snappier (`k ≥ 0.16, d ≤ 0.42`); GSAP durations halved

---

## Key JavaScript Logic

### `updateJourneyFromScroll()`
Runs on every scroll event:
1. Computes `journey.phase` (float 0–5) from scroll position + section tops
2. `setChapterUi(round(phase))` — updates sidebar text, progress dots, menu active state
3. `updateBackgroundTone(phase)` — interpolates all CSS colour variables via `document.documentElement.style.setProperty`
4. Controls headline opacity, art label, closing headline, and footer fade

### `tick()` (rAF loop)
1. Ticks all springs for all 32 cards
2. Applies `journeyTarget()` = smoothstep-lerp between `chapterTarget(low)` and `chapterTarget(high)`
3. Applies hover-spread effect on ribbon-state cards
4. Updates Three.js pivot transforms and calls `renderer.render(scene, cam)`

### `seededRand(seed)`
```js
function seededRand(seed) {
  var x = Math.sin(seed * 12.9898) * 43758.5453;
  return x - Math.floor(x);
}
```
Deterministic per card — same result every render.

### `visibleWorldAt(z)`
Returns `{width, height}` of the camera frustum at depth `z`:
```js
var depth = cam.position.z - z;
var height = 2 * Math.tan(degToRad(cam.fov) / 2) * depth;
return { width: height * cam.aspect, height };
```

---

## Complete HTML Skeleton

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Kimo — Opening Collection</title>
  <!-- Google Fonts: Cormorant Garamond + Inter -->
  <style>/* ALL CSS INLINE — see Design System above */</style>
</head>
<body>

  <!-- Atmospheric corner images -->
  <img id="bg-tl" class="bg-art" src="[unsplash-tl]" alt="">
  <img id="bg-tr" class="bg-art" src="[unsplash-tr]" alt="">
  <img id="bg-bl" class="bg-art" src="[unsplash-bl]" alt="">
  <img id="bg-br" class="bg-art" src="[unsplash-br]" alt="">

  <!-- Fixed stage layer -->
  <div id="stage-wrap">
    <div id="stage">
      <div id="stage-header">
        <span id="wordmark">Kimo</span>
        <button id="menu-btn" aria-label="Open menu" aria-expanded="false">
          <span></span><span></span><span></span>
        </button>
        <nav id="page-menu" aria-hidden="true">
          <ul class="page-menu-list">
            <!-- 6 li > button.page-menu-link with .num and .label -->
          </ul>
        </nav>
      </div>

      <div id="stage-body">
        <canvas id="gl"></canvas>

        <div id="hero-headline">
          <span class="hw" id="hw-l">Opening</span>
          <span class="hw" id="hw-r">Collection</span>
        </div>

        <div id="spill">
          <div class="dot"></div>
          <span class="label">Explore</span>
        </div>

        <div id="hint">Drag cards to explore</div>

        <div id="hero-meta">
          <div id="card-count">32 works</div>
          <div id="launch-date">June 2026</div>
        </div>

        <div id="closing-headline">
          <p>Art is endless.</p>
          <p>So is curiosity.</p>
        </div>

        <aside id="journey-copy" aria-live="polite">
          <span id="journey-num">01</span>
          <span id="journey-title">Hero /<br>Closed Collection</span>
          <p id="journey-desc">The collection is whole. Elegant. Mysterious.</p>
        </aside>

        <nav id="stage-progress">
          <!-- 6 button.stage-progress-dot, first has .is-active -->
        </nav>

        <aside id="stage-art-label" aria-hidden="true">
          <span id="stage-art-kicker">Johannes Vermeer</span>
          <span id="stage-art-title">Girl with a<br>Pearl Earring</span>
          <span id="stage-art-meta">c. 1665<br>Oil on canvas</span>
        </aside>

        <aside id="focus-info" aria-live="polite" aria-hidden="true">
          <button id="focus-close">&times;</button>
          <span id="focus-kicker">Selected work</span>
          <h2 id="focus-title">Untitled study</h2>
          <p id="focus-copy"></p>
          <div id="focus-meta"></div>
        </aside>
      </div>
    </div>
  </div>

  <!-- Scrollable content -->
  <div id="kimo-scroll">
    <div id="hero-anchor"></div> <!-- height: 100vh spacer -->
    <section class="ks" id="ks02"><!-- 02 Ribbon --></section>
    <section class="ks" id="ks03"><!-- 03 Gallery Cloud --></section>
    <section class="ks" id="ks04"><!-- 04 Focus --></section>
    <section class="ks" id="ks05"><!-- 05 Details --></section>
    <section class="ks" id="ks06"><!-- 06 Closing --></section>
    <footer id="kimo-footer">
      <span class="foot-copy">© KIMO 2026</span>
      <nav><a href="#">About</a><a href="#">Contact</a><a href="#">Journal</a></nav>
    </footer>
  </div>

  <!-- CDN scripts -->
  <script src="https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/gsap.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/ScrollTrigger.min.js"></script>

  <script>(function() {
    /* Main: Three.js scene, Spring class, 32 cards, journey system,
       hover/drag/click/focus interactions, entrance animation, render loop */
  }());</script>

  <script>(function() {
    /* Scroll animations: GSAP ScrollTrigger for footer fade-in */
  }());</script>

</body>
</html>
```

---

*End of Master Prompt*
