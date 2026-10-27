# SafeMission – static HTML / CSS / JS

Plain HTML, CSS and JavaScript version of the SafeMission React (Vite) app. There's no build step, no framework and no npm install.

## Run it

- **Quick look:** double-click `index.html`. Everything works from `file://`, because the scripts are classic deferred scripts, not ES modules.
- **Local server** (closer to how it runs once deployed), from this folder:

  ```bash
  npx serve .
  ```

  or `python -m http.server 8080`, then open http://localhost:8080.
- **Deploy:** upload the whole folder to any static host (Netlify, Vercel, GitHub Pages, S3, Nginx, Apache).

## Project structure

```
htmlsafemission/
├── index.html                  # Page markup: every section, all content
├── README.md
├── .editorconfig
├── .gitignore
├── assets/
│   ├── icons/                  # favicon + the four hero tab icons (SVG)
│   ├── images/
│   │   ├── about/              # hexagon photo cluster (WebP)
│   │   ├── objectives/         # five objective photos (WebP)
│   │   ├── why/                # farm photo (WebP)
│   │   ├── how/                # ten step photos (JPG)
│   │   ├── district/           # 20-acre AEZ pie chart (lossless WebP)
│   │   └── join/               # join form photo (JPG)
│   └── videos/
│       └── safemission.mp4     # hero video
├── css/
│   ├── base/
│   │   ├── variables.css       # design tokens (fonts, colours, easing) + breakpoint list
│   │   ├── reset.css           # minimal modern reset
│   │   └── base.css            # body defaults, a11y helpers, reduced motion
│   ├── components/
│   │   ├── hero.css            # full-screen video header
│   │   └── tabs.css            # frosted glass section tabs
│   └── sections/               # one stylesheet per page section
│       ├── about.css
│       ├── objectives.css
│       ├── why.css
│       ├── how.css
│       ├── district.css
│       ├── join.css
│       └── testimonials.css
└── js/
    ├── utils/
    │   └── dom.js              # $, $$, reduced-motion helpers
    ├── data/
    │   ├── country-codes.js    # calling codes for the mobile field
    │   └── ap-districts.js     # Andhra Pradesh districts
    ├── components/             # one file per interactive section
    │   ├── tabs.js             # hero tabs -> smooth scroll to the section
    │   ├── objectives.js       # Read More detail panel + 01–05 stepper
    │   ├── how-journey.js      # step cards, Read more, connector arrows
    │   ├── join-form.js        # validation, country code, counter
    │   └── testimonials.js     # carousel: arrows, dots, swipe, keys
    └── main.js                 # entry point: starts every component
```

### Conventions

- **Content lives in HTML. Behaviour lives in JS.** The page reads fine and can be indexed with JavaScript turned off. JS only adds interaction. Each objective's detail content sits in a `<template>` inside its own card.
- **One namespace.** Every script is an IIFE that registers itself on `window.SafeMission` (`.utils`, `.data`, `.components`). `main.js` calls each component's `init()`. If one component fails, the others still start.
- **Script order matters.** The `<script defer>` tags in `index.html` run in this order: utils → data → components → main.
- **CSS order:** base → components → sections. Class names match the original React components, so you can compare the two versions side by side.

## Responsive behaviour

Checked in headless Edge from 280 to 2560 px wide, including landscape phones (568×320, 844×390) and upright tablets (768×1024, 912×1368). At every size the page has no sideways scrolling, no button text wraps or gets cut off, no element sticks out of the screen, and the console shows no errors.

| Area | Desktop | Tablet | Phone |
| --- | --- | --- | --- |
| Hero video | full screen | full screen (landscape) / whole 16:9 video with tabs below (portrait) | whole 16:9 video with tabs below (portrait), full screen (landscape) |
| Hero tabs | pill capsule, icon + label | tighter capsule | 4 equal columns, icon above label: always fits, no sideways scroll |
| About | text + hexagon photo stage side by side | stacked | Vision / Mission cards stacked |
| Objectives | 5 cards in a row | 3 per row, last row centred | 2 per row, then 1 (16:9 photos) |
| Objective detail | 3 columns | 2 columns, then 1 with the 01–05 stepper as a row | stepper row clear of the close button |
| Why | photo top-right, cards side by side | photo on top, cards stacked | smaller photo and type |
| How | serpentine 2-3-3-2 board, scales as one piece | single column, arrows between cards | same, more compact |
| District model | text + chart side by side | stacked | stacked |
| Join | photo + form side by side | stacked, 2-column fields | 1-column fields, full-width submit |
| Testimonials | 3 cards, side arrows | 2 cards | 1 full-width card, arrows and dots underneath |

## Changes from the React version

- **Hero video on portrait screens:** on an upright phone, `object-fit: cover` showed only the middle third of the 16:9 video and cut off its centred "SAFE MISSION" title. Portrait screens now show the whole video with the tabs below it. Landscape screens keep the full-screen hero.
- **Hero tabs** are links (`#about`, …). They work without JS and keyboard focus moves to the section you jump to. Every tab keeps the same size, so switching tabs never shifts the others. Phones get an equal-column layout instead of a sideways-scrolling capsule.
- **Objective cards:** the number and icon badges now overlap the photo edge as designed. The React version cut them in half. When a row is incomplete (3 + 2, 2 + 2 + 1), the last row is centred. The detail photo's decorations stay aligned at every width. The detail heading wraps naturally: the forced line break used to leave "Cold" alone on its own line. Escape closes the detail panel.
- **How it works:** the desktop board and the phone list share one set of cards. The arrows are drawn from the real card positions, so they always line up. The intro animation now also starts on short screens (landscape phones), where the React version never started it.
- **Testimonials:** on phones the card uses the full width, with the arrows and dots below it. The React version squeezed the card between the arrows. Dots, arrow keys and swipe all work, and off-screen cards are hidden from screen readers.
- **Form:** inputs are 16px on phones, so iOS doesn't zoom in when you tap a field. The selects show a grey placeholder. Errors are announced to screen readers.
- **Touch screens:** hover lift effects only apply on devices that can actually hover, so effects no longer stick after a tap.

## Connecting the form

`js/components/join-form.js` validates the form and then shows the thank-you message. Nothing is sent yet. To submit the data, send `current` to your API at the comment `// No backend yet` in the submit handler.

## Images

The 10 large PNGs from the React project are now WebP: **21.7 MB → 2.7 MB (−87%)**, with the same look. All modern browsers display WebP (Safari 14+, Chrome, Edge, Firefox).

| Image | Size | Encoding | Before → after |
| --- | --- | --- | --- |
| about/*.webp (3) | original size (already shown at or above native size on big screens) | lossy, quality 0.9 | 6.3 MB → 0.7 MB |
| objectives/obj1–5.webp | 1643 → 1200 px wide (shown at most 560 px wide, so still sharp on 2× screens) | lossy, quality 0.9 | 12.8 MB → 1.2 MB |
| why/whysafemission.webp | original size | lossy, quality 0.9 | 1.5 MB → 0.3 MB |
| district/safemissionpiechart.webp | 1536 → 1300 px wide (shown at most 650 px wide) | **lossless**, keeps transparency and sharp text | 1.0 MB → 0.6 MB |

The photos measure 41.6–43.9 dB luma PSNR against the source, which is visually lossless. Side-by-side crops at 2× zoom look identical. The step photos (`how/*.jpg`) and the join photo were already web-sized JPEGs and are unchanged.

**Still large:** the hero video, `assets/videos/safemission.mp4`, is 58 MB. Before going live, re-encode it (for example H.264 at 1080p or 720p, ~3–6 Mbps, with `-movflags +faststart`). It will then probably be 5–10 MB.
