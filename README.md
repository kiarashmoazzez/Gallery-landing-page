# Kimo — Opening Collection

A luxury art-gallery landing page with a WebGL-powered, scroll-driven narrative experience.

## Stack

- **Three.js r160** — 3D S-curve ribbon of 32 artwork cards with spring physics
- **GSAP 3.12 + ScrollTrigger** — entrance animations and scroll-driven transitions
- **Vanilla JS / CSS** — no build tools, no frameworks, no npm

## Project Structure

```
├── index.html              # Page markup
├── css/
│   └── style.css           # All styles
├── js/
│   ├── main.js             # Three.js scene, spring physics, journey system, interactions
│   └── scroll.js           # GSAP ScrollTrigger animations
└── Resources/
    └── artworks/
        ├── painting_01.jpg
        ├── painting_02.jpg
        ├── painting_03.jpg
        ├── painting_04.jpg
        └── painting_05.jpg
```

## Running Locally

Open `index.html` directly in a browser, **or** serve it with any static server to avoid CORS issues with the WebGL textures:

```bash
# Python
python3 -m http.server 8080

# Node
npx serve .
```

Then visit `http://localhost:8080`.

## Features

- **Hero** — 32 art cards on an animated S-curve ribbon; drag, hover, and click to interact
- **Ribbon Unlocks** — cards fan out as you scroll
- **Gallery Cloud** — immersive 3D scatter field
- **Focus** — one artwork pulls forward; others soften behind
- **Details** — zoomed crop view showing texture and brushwork
- **Closing** — ribbon re-forms into a compact arc
- Continuous **colour-scheme shift** across 6 stops (warm parchment → dark teal-black → back to light)
- **Glassmorphism** focus info overlay
- Fully responsive; respects `prefers-reduced-motion`
