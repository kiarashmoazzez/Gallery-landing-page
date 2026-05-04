# Kimo — Opening Collection

> **Fully designed and built by AI (Claude, by Anthropic)** — from concept and visual design to every line of HTML, CSS, and JavaScript.

A luxury art-gallery landing page with a WebGL-powered, scroll-driven narrative experience. No frameworks, no build tools, no server required — just open `index.html` in a browser.

---

## What This Is

Kimo is a cinematic single-page experience for an art collection launch. As you scroll, 32 artwork cards arranged in a 3D S-curve ribbon transform through six distinct chapters — each with its own layout, depth, lighting mood, and colour palette. The entire page is a hand-crafted interaction system built from scratch using Three.js and GSAP, with custom spring physics driving every card movement.

---

## How the Effects Were Made

### 3D S-Curve Ribbon (Three.js WebGL)
The 32 artwork cards are not HTML elements — they are 3D planes rendered in WebGL using Three.js. Each card is placed along a mathematically defined S-curve:

```
x(t) = -CW/2 + t × CW
y(t) = -CAMP × sin(t × π × 2)
```

Each card is a `THREE.Group` containing a front face (artwork texture) and a back face (ivory material), so they look physical when rotated. The camera frustum is calculated dynamically so the ribbon always fits the viewport perfectly, from desktop to mobile.

### Spring Physics
Every card movement — hover, drag, scroll transition, focus — is driven by a custom spring physics engine, not CSS transitions or easing curves. Each card has 6 independent springs (x, y, z position; z and x rotation; scale). Springs have configurable stiffness and damping tuned per interaction state:

- **Ribbon idle** — loose and fluid
- **Drag** — snappy and responsive
- **Focus** — slow and weighted
- **Reduced motion** — automatically tightened for accessibility

This is what gives every card movement its organic, physical feel rather than a mechanical tween.

### Scroll-Driven Journey (6 Phases)
The page tracks a continuous `journey.phase` float (0 to 5) derived from scroll position. At each integer phase, the 32 cards have a defined target layout (ribbon, scatter, cloud, focus, detail, closing arc). Between phases the engine smoothstep-interpolates all 192 spring targets simultaneously, so transitions are fluid and overlap naturally as you scroll at any speed.

### Dynamic Colour System
The entire colour palette — background, text, UI elements — shifts continuously as you scroll through 6 hand-tuned colour stops, from warm parchment through deep sepia and near-black teal, returning to light at the end. Every CSS custom property (`--bg`, `--fg`, `--stage`, etc.) is updated live via `document.documentElement.style.setProperty` on each scroll frame, with smooth RGB interpolation.

### Glassmorphism Focus Overlay
Clicking any card opens an info overlay built with layered CSS backdrop-filter, radial gradients, and inset box-shadows — no image assets, purely CSS. The multi-layer glass effect uses `mix-blend-mode: screen` on a pseudo-element to simulate a specular highlight catching light from the top-left corner.

### Grain Overlay
The subtle film-grain texture covering the entire page is a single inline SVG using an `feTurbulence` filter rendered at `opacity: 0.038` — no image file, no canvas, just a few bytes of SVG data URI applied as a fixed `body::after` pseudo-element.

---

## The Master Prompt

This repository includes two files — `MASTER_PROMPT.txt` and `MASTER_PROMPT.md` — that serve as a complete **AI rebuild specification** for this page.

If you give either file to an AI model (Claude, GPT-4, etc.) and ask it to build the page, it has everything needed to recreate the exact same result:

- Every CSS custom property and colour stop value
- Every `clamp()` expression for responsive sizing
- The S-curve math, spring physics constants, and tuning profiles per state
- The exact `left/top/%`, `--w`, `--rot`, and `--blur` values for all 47 HTML art-card elements across sections 02–06
- The Six-phase journey target formulas
- The `seededRand()` function used for deterministic card placement
- All GSAP timeline timings, easings, and stagger values
- The complete HTML skeleton with every ID and class name

The `.md` version is the same content formatted for readability. The `.txt` version is plain text — easier to paste directly into an AI prompt window.

---

## Project Structure

```
├── index.html                  # Page markup — clean, no inline styles or scripts
├── css/
│   └── style.css               # All styles (1 007 lines)
├── js/
│   ├── main.js                 # Three.js scene, spring physics, journey system, all interactions
│   └── scroll.js               # GSAP ScrollTrigger — footer fade-in
├── Resources/
│   └── artworks/
│       ├── painting_01.jpg     # The Starry Night — Van Gogh
│       ├── painting_02.jpg     # Mona Lisa — da Vinci
│       ├── painting_03.jpg     # The Great Wave — Hokusai
│       ├── painting_04.jpg     # Girl with a Pearl Earring — Vermeer
│       └── painting_05.jpg     # The Kiss — Klimt
├── MASTER_PROMPT.md            # Full AI rebuild specification (formatted)
├── MASTER_PROMPT.txt           # Full AI rebuild specification (plain text)
└── README.md
```

---

## Page Sections

| # | Name | What Happens |
|---|---|---|
| 01 | Hero | 32 cards in a tight S-curve ribbon — drag, hover, and click to interact |
| 02 | Ribbon Unlocks | Cards fan out and spread across the stage as you scroll |
| 03 | Gallery Cloud | Cards scatter into an immersive 3D depth field around you |
| 04 | Focus | One artwork pulls to centre stage; the rest softens behind it |
| 05 | Details | The focused work fills the frame — texture and brushwork visible |
| 06 | Closing | Cards re-form into a compact arc; "Art is endless. So is curiosity." |

---

## Stack

- **Three.js r160** — WebGL renderer, PerspectiveCamera, MeshStandardMaterial
- **GSAP 3.12 + ScrollTrigger** — entrance timeline and scroll-triggered footer fade
- **Vanilla JS + CSS custom properties** — spring physics, colour system, all interactions
- No build tools. No npm. No server needed.
