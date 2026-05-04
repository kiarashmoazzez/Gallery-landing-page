# AI Project Guide

This file is for AI assistants and developers who need to understand, analyze, customize, or extend this project without first reverse-engineering every file.

## Project Summary

Kimo is a static, single-page luxury art-gallery landing experience. It uses a fixed WebGL hero stage, scroll-driven chapter transitions, and HTML/CSS overlay sections to create a cinematic art collection journey.

The project has no build step, package manager, server, bundler, or framework. It runs by opening `index.html` in a browser.

## Runtime Stack

- HTML: `index.html`
- CSS: `css/style.css`
- JavaScript: `js/main.js`, `js/scroll.js`
- WebGL: Three.js r160 from CDN
- Animation: GSAP 3.12.5 and ScrollTrigger from CDN
- Fonts: Google Fonts, `Cormorant Garamond` and `Inter`
- Assets: local artwork images in `Resources/artworks/`, plus remote image URLs in HTML and JS

Important implication: the page can load locally, but the best visual result needs network access for CDN scripts, Google Fonts, Unsplash corner images, and remote Wikimedia artwork textures.

## File Map

### `index.html`

Owns the page structure.

Main responsibilities:

- Loads fonts and `css/style.css`.
- Defines fixed stage UI:
  - `#stage-wrap`
  - `#stage`
  - `#stage-header`
  - `#stage-body`
  - `#gl` canvas for Three.js
  - hero headline, menu, progress dots, journey copy, artwork label, focus overlay
- Defines scroll chapter anchors and sections:
  - `#hero-anchor`
  - `#ks02`
  - `#ks03`
  - `#ks04`
  - `#ks05`
  - `#ks06`
  - `#kimo-footer`
- Loads external libraries at the bottom:
  - Three.js
  - GSAP
  - ScrollTrigger
- Loads local scripts:
  - `js/main.js`
  - `js/scroll.js`

When adding a new visible chapter, update `index.html` first, then mirror that chapter in `js/main.js` in the `chapters` array and `chapterTarget()` logic.

### `css/style.css`

Owns all styling, responsive layout, visual atmosphere, and static HTML card layouts.

Main responsibilities:

- Global reset and root theme variables:
  - `--bg`
  - `--stage`
  - `--stage-rgb`
  - `--fg`
  - `--fg-rgb`
  - `--ui`
  - `--ui-icon`
  - `--muted`
  - `--pill`
- Fixed stage layout.
- Header, wordmark, hamburger menu, and dropdown menu.
- WebGL canvas sizing.
- Hero headline and metadata.
- Journey copy and stage progress controls.
- Focus glass overlay.
- Scroll chapter label styles.
- Static HTML art-card layouts for sections 02-06.
- Footer.
- Responsive rules.

The CSS theme variables are also updated live by `js/main.js`. If changing colors, update both the default `:root` values and the `bgStops` array in `js/main.js`.

### `js/main.js`

Owns the core experience.

Main responsibilities:

- Custom spring physics via the `Spring` object.
- Three.js scene setup:
  - renderer
  - scene
  - perspective camera
  - ambient and directional lights
  - card group
- Responsive WebGL layout and camera fitting.
- Artwork data and texture loading.
- Canvas-generated fallback artwork textures.
- Creation of 32 WebGL artwork cards.
- S-curve ribbon math.
- Scroll journey state.
- Six chapter definitions.
- Scroll-derived `journey.phase` calculation.
- Live color interpolation.
- Chapter-to-chapter target interpolation.
- Card hover, drag, click-to-focus, double-click-return behavior.
- Focus overlay content and animation.
- Entrance animation.
- Render loop.

Key concepts in this file:

- `N`: number of WebGL cards. Currently `32`.
- `FAMOUS_WORKS`: source artwork metadata and remote image URLs.
- `WORKS`: repeated card data generated from `FAMOUS_WORKS`.
- `cards`: all WebGL card state objects.
- `journey.phase`: continuous scroll position from `0` to `5`.
- `chapters`: text and DOM IDs for the six scroll chapters.
- `bgStops`: color stops interpolated across the scroll journey.
- `chapterTarget(c, index)`: target layout for a card at a chapter.
- `journeyTarget(c)`: interpolates between chapter targets.
- `updateJourneyFromScroll()`: maps browser scroll to `journey.phase`.
- `tick()`: animation loop that applies spring targets and renders the scene.

### `js/scroll.js`

Owns the small ScrollTrigger footer fade.

It safely exits if `ScrollTrigger` is unavailable:

```js
if (!window.ScrollTrigger) return;
```

Most scroll logic is not here. The main scroll-driven WebGL journey lives in `js/main.js`.

### `Resources/`

Owns local visual assets.

Known files:

- `Resources/artworks/painting_01.jpg`
- `Resources/artworks/painting_02.jpg`
- `Resources/artworks/painting_03.jpg`
- `Resources/artworks/painting_04.jpg`
- `Resources/artworks/painting_05.jpg`
- `Resources/Logo.svg`
- Two generated PNG assets at the root of `Resources/`

The HTML sections use the local `Resources/artworks/*.jpg` files. The WebGL hero currently uses remote Wikimedia images from `FAMOUS_WORKS` in `js/main.js`, with generated fallback textures if remote loading fails.

### `MASTER_PROMPT.md` and `MASTER_PROMPT.txt`

These are long AI rebuild specifications for recreating the page. They are useful as design intent and implementation reference, but the actual runtime source of truth is:

1. `index.html`
2. `css/style.css`
3. `js/main.js`
4. `js/scroll.js`

### `README.md`

Public-facing project description, effect explanation, project structure, sections, and stack.

## How The Experience Works

The browser scroll controls a continuous journey value:

```text
journey.phase = 0 ... 5
```

Each integer phase maps to one chapter:

| Phase | DOM ID | Experience |
|---:|---|---|
| 0 | `hero-anchor` | Closed S-curve collection |
| 1 | `ks02` | Ribbon unlocks |
| 2 | `ks03` | Immersive gallery cloud |
| 3 | `ks04` | Focus |
| 4 | `ks05` | Details |
| 5 | `ks06` | Closing |

`updateJourneyFromScroll()` calculates the current phase from scroll position. For every card, `journeyTarget()` gets the layout target between the current and next chapter, and the custom springs animate each card toward that target.

The visible HTML chapter sections mostly act as scroll anchors and content references. Their labels and card markup exist in the DOM, but the fixed WebGL stage carries the main continuous visual experience.

## Customization Entry Points

### Change Brand Text

Edit `index.html`:

- `#wordmark`
- `#hero-headline`
- `#launch-date`
- footer copy

Also check `README.md` if the public documentation should match the new brand.

### Change Chapter Titles Or Descriptions

Edit both places:

1. `index.html` for menu labels and static section labels.
2. `js/main.js` in the `chapters` array for dynamic journey copy.

Keep chapter IDs consistent between:

- menu buttons with `data-target`
- progress dots with `data-target`
- section IDs
- `chapters[].id`

### Change The Main Artwork Set

For WebGL cards, edit `FAMOUS_WORKS` in `js/main.js`:

```js
var FAMOUS_WORKS = [
  { title: '...', artist: '...', year: '...', url: '...' }
];
```

For HTML section cards, update image paths in `index.html`.

Recommended approach:

- Put new local images in `Resources/artworks/`.
- Use local paths in both `index.html` and `FAMOUS_WORKS`.
- Keep image aspect ratios close to portrait format, because cards use a portrait plane and CSS cards use `height: width * 1.3`.

Example local JS artwork entry:

```js
{ title: 'New Work', artist: 'Artist Name', year: '2026', url: 'Resources/artworks/new_work.jpg' }
```

### Change The Number Of WebGL Cards

Edit `N` in `js/main.js`.

Then review:

- `WORKS` generation.
- `journey.focusCardIndex`.
- `chapterTarget()` layouts.
- performance on mobile.

If `N` changes significantly, test hover, drag, focus, and scroll phases because layout formulas depend on card index and normalized `t`.

### Change The Color Journey

Edit `bgStops` in `js/main.js`.

Also update matching defaults in `css/style.css` under `:root` so the first paint looks correct before JS runs.

Do not only change CSS variables if the color should remain stable during scroll; `updateBackgroundTone()` will override them on each scroll update.

### Change Card Layouts Per Chapter

Edit `chapterTarget(c, index)` in `js/main.js`.

Each target returns:

```js
{
  x: Number,
  y: Number,
  z: Number,
  rz: Number,
  rx: Number,
  s: Number
}
```

Meaning:

- `x`, `y`, `z`: WebGL position.
- `rz`: z-axis rotation.
- `rx`: x-axis rotation.
- `s`: scale multiplier.

Keep layouts responsive by basing positions on `visibleWorldAt(0)` rather than hardcoded viewport pixel values.

### Change Spring Feel

Edit `tuneCard(c, profile)` and initial `Spring(...)` values in `js/main.js`.

Profiles:

- `focus-main`
- `focus-rest`
- `drag`
- default ribbon behavior

The `Spring` constructor uses:

```js
new Spring(initialValue, stiffness, damping)
```

Higher stiffness moves faster. Damping controls how much velocity remains each frame.

### Change Focus Overlay Text

Edit `setFocusInfo(c)` in `js/main.js`.

The current text is generic:

```js
focusCopy.textContent = 'A selected work from the same continuous collection ribbon...';
```

For richer content, add fields to each `FAMOUS_WORKS` item and render those fields in `setFocusInfo()`.

### Change Footer Animation

Edit `js/scroll.js`.

The footer fade uses GSAP ScrollTrigger and does not control the main WebGL journey.

## Development Workflow

Because this is a static site, the fastest development loop is:

1. Open `index.html` in a browser.
2. Edit HTML/CSS/JS.
3. Hard refresh the browser.
4. Check console errors.
5. Test scroll, hover, drag, focus overlay, menu navigation, footer fade, and mobile responsive layout.

If a local server is preferred, any static server works. Example:

```sh
python3 -m http.server 8000
```

Then open:

```text
http://localhost:8000
```

## Verification Checklist

After meaningful changes, verify:

- Page loads without console errors.
- Three.js canvas is visible.
- Cards appear in the hero ribbon.
- Scroll changes card layout through all six chapters.
- Background and text colors change cleanly across chapters.
- Menu opens, closes, and scrolls to correct sections.
- Progress dots scroll to correct sections.
- Card hover works near the top of the page.
- Click card opens focus overlay.
- Escape closes the focus overlay.
- Dragging cards works in the initial hero phase.
- Footer fades in.
- Mobile viewport does not clip key text or controls.
- Reduced-motion users still get usable behavior.

## Common Pitfalls

- Do not rename IDs casually. `index.html`, `css/style.css`, and `js/main.js` are tightly coupled by IDs and classes.
- Do not move script tags above the DOM unless code is changed to wait for DOM readiness.
- Do not remove GSAP if `js/main.js` still calls `gsap`.
- Do not assume `js/scroll.js` controls the main scroll journey. It only fades the footer.
- Do not only update static HTML art cards when replacing the collection. The WebGL hero has separate artwork data in `js/main.js`.
- Do not only update `README.md` or `MASTER_PROMPT.*`; those files are documentation, not runtime code.
- Do not rely on remote images for production if offline reliability matters. Prefer local assets in `Resources/artworks/`.

## Suggested AI Analysis Order

When a future AI assistant starts work on this project, use this order:

1. Read `README.md` for public intent.
2. Read this file for implementation orientation.
3. Read `index.html` to understand DOM structure and IDs.
4. Read `css/style.css` around the selectors involved in the requested change.
5. Read `js/main.js` around the relevant functions:
   - artwork changes: `FAMOUS_WORKS`, `loadArtworkTexture()`, `setFocusInfo()`
   - scroll/chapter changes: `chapters`, `updateJourneyFromScroll()`, `chapterTarget()`
   - animation feel: `Spring`, `tuneCard()`, `tick()`
   - menu/navigation: `setMenuOpen()`, `scrollToChapter()`, progress dot listeners
6. Read `js/scroll.js` only for footer fade changes.
7. Make the smallest source change that satisfies the request.
8. Verify in a browser if the change affects visuals or interaction.

## Current Source Metrics

Approximate file sizes at the time this guide was created:

- `index.html`: 270 lines
- `css/style.css`: 1007 lines
- `js/main.js`: 1278 lines
- `js/scroll.js`: 13 lines
- `README.md`: 111 lines
- `MASTER_PROMPT.md`: 797 lines
- `MASTER_PROMPT.txt`: 790 lines

## Maintenance Notes

Keep this guide updated when:

- New source files are added.
- Chapter count changes.
- Asset strategy changes.
- External dependencies change.
- The project gains a build step or package manager.
- IDs/classes used by JavaScript are renamed.
