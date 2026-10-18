# ARTIST — film website

A cinematic, story-driven website for **ARTIST (ART!ST)**, an independent Tamil psychological thriller written and directed by Dani. It is built from the film's pitch deck and guided by **Dani**, a small caricature of the director who walks the visitor through the film's world.

- **Content source of truth:** `docs/01-deck-analysis.md` holds the full page-by-page transcription, the content inventory, the visual identity, and the items flagged for clarification.
- **Stack:** plain **HTML + CSS + vanilla JavaScript**. No Node, no build step, no frameworks, no JS libraries.

---

## 1. Why this stack

| Need | How it's met |
|---|---|
| No Node / React / Vite (your requirement) | One `index.html`, one stylesheet, three classic `<script defer>` files |
| Opens anywhere | Works from any static host. It also opens by double-clicking `index.html` (classic scripts, no ES modules) |
| Scroll storytelling | `position: sticky` scenes + a single `requestAnimationFrame` loop that writes a `--p` (0→1) progress variable; CSS does the rest |
| Reveals | `IntersectionObserver` + CSS transitions |
| Character animation | Inline SVG with CSS keyframes; `dani.js` swaps moods, poses and eye positions |
| Performance | No libraries (≈100 KB of hand-written CSS/JS uncompressed, roughly 25 KB gzipped), WebP images (about 2 MB used by the page; the 6 MB of original-deck slides load only in the viewer), lazy loading, the ember canvas pauses off-screen, a "lite" mode on low-memory devices |
| Accessibility | All deck text is real, semantic HTML (readable without JS); reduced-motion support plus a manual Motion toggle; keyboard support throughout |

The only external request is **Google Fonts** (Bebas Neue, Oswald, Caveat). To be fully offline, self-host them (see §5.3).

---

## 2. Folder structure

```
Artist/
├── index.html                 ← every scene and all of the deck's copy
├── serve.ps1                  ← local preview server (PowerShell; no Node/Python)
├── README.md
├── assets/
│   ├── css/main.css           ← design tokens, frame, scenes, Dani, dialogs
│   ├── js/
│   │   ├── config.js          ← EDIT ME: trailer, contact, fact sheet, stills, deck titles
│   │   ├── dani.js            ← the guide character controller
│   │   └── main.js            ← scenes, scroll, sliders, lens, strip, dialogs, toggles
│   ├── img/
│   │   ├── logo-artist.webp   ← ART!ST logo cut from deck p.1 (transparent)
│   │   ├── stills/            ← 20 film frames (deck p.14–18)
│   │   ├── posters/           ← 6 reference posters (deck p.19)
│   │   ├── cast/              ← cast cutouts & photos (deck p.23, 29, 33, 34)
│   │   ├── atmos/             ← horse, chair, boat, profile, tunnel, feet, church (deck art)
│   │   └── deck/              ← all 39 original slides + thumbs (for the deck viewer)
│   ├── media/                 ← put trailer.mp4 / captions / pitch-deck PDF here
│   └── fonts/                 ← optional self-hosted fonts
├── docs/
│   └── 01-deck-analysis.md    ← analysis, inventory, flags, visual direction
└── tools/deck-extract/        ← one-off scripts used to cut assets from the PDF (not deployed)
```

---

## 3. Run it locally

**Option A (simplest):** double-click `index.html`. Everything works except that some browsers restrict a few features on `file://`.

**Option B (recommended):** use the bundled server:

```bash
powershell -ExecutionPolicy Bypass -File .\serve.ps1
```

Then open <http://localhost:8080/>. Pass `-Port 9000` to use another port. Press Ctrl+C to stop.

Any other static server also works (VS Code "Live Server", `npx serve`, `python -m http.server`), but none is required.

---

## 4. The experience, scene by scene

| # | Scene (`id`) | Deck pages | Interaction |
|---|---|---|---|
| 0 | `#theatre` curtain | — | **Theatre curtain**, closed on every visit (always starts at the home page). Scroll or swipe to pull the velvet curtains apart; letting go past ~40% finishes the opening, earlier lets them fall closed. **Open the curtain**, Enter, Space or ↓ opens them fully. Reduced motion: opens instantly. Then the logo reveal plays and Dani says hello |
| 1 | `#opening` | 1 | After the curtain opens, one by one: **The Noche Visuals Production** (tracks in) → **ARTIST** (logo slash-reveal, then "Tamil film") → **A film by Dani · An independent feature film** → **Scroll**. Rising embers; Dani waves hello once it's done. Timings: `data-beat` delays in `main.css` |
| 2 | `#introduction` | 2 | Word-by-word reading reveal |
| 3 | `#logline` | 3 | **"Missing" flyer tears in two on scroll** to reveal the truth |
| 4 | `#story` | 4 | **40 Lent days**: tally marks drawn as you scroll; Dani is scared, then sad |
| 5 | `#genre-tone` | 5, 6 | **Red ⇄ White** drag slider between the red-room and white-room stills |
| 6 | `#structure` | 7, 8 | A white "paper" scene; the timeline draws itself, acts I–III |
| 7 | `#world` | 9 | **Colour lens**: the cursor (or a finger) paints full colour into a red-toned still |
| 8 | `#characters` | 4, 8, 20 | Protagonist, sister, the couple, psychiatrist (no actor mapping; see the flags) |
| 9 | `#frames` | 13–18 | Pinned horizontal film strip (desktop), swipe strip (mobile), lightbox |
| 10 | `#posters` | 19 | Poster wall with 3D tilt; lightbox |
| 11 | `#themes` | 38, 20 | Film statement + five "audience attraction" cards |
| 12 | `#truth` | 10 | **Sealed envelope, password-protected**: the right password (`revealtwist`) opens the twist; a wrong one shows "We got you, enjoy the suspense in theatres" and Dani teases |
| 13 | `#comparables` | 11, 12 | Typographic title lists; original slides on demand |
| 14 | `#director` | 36, 37, 21 | Statement, bio (rotating tunnel), marketing strategy |
| 15 | `#cast` | 22–34 | Cutouts, filmographies (each film opens its original slide) |
| 16 | `#crew` | 35 | Credit roll |
| 17 | `#watch` | — | Trailer slot, deck viewer, optional PDF, fact sheet |
| 18 | `#end` | 39 | The original "The End" artwork with a slow pull-back; Dani waves goodbye |

The **original deck viewer** (top bar → *Original deck*) shows all 39 slides with keyboard, swipe and thumbnail navigation. Slide 10 stays veiled until the same password is entered (here or at the seal). To change the password, edit `TWIST_PASSWORD` in `assets/js/main.js`. Note: this is a playful gate, not real security. The twist text is still in the page source and slide 10 is still reachable by its file URL; remove `assets/img/deck/slide-10.webp` and the thumb if that matters.

### Dani, the guide
- Walks along the tree line to each scene's *station* (`data-dani-x`, a % of the viewport width), then speaks the scene's line (`data-dani-line`).
- Has moods (`happy`, `excited`, `scared`, `thinking`, `sad`, `shush`) and poses (`idle`, `wave`, `point`, `shush`), set per scene with `data-dani-mood` and `data-dani-pose`.
- Reacts to things: the flyer tearing, hovering the seal (shivers), opening it (jumps), dragging toward red or white, the tally reaching 40, opening a lightbox.
- Eyes follow the mouse; on touch they follow taps; on keyboard they follow focus. Blinks, gets restless when idle, and offers tips on click/tap.
- Can be switched off (**Guide** button; remembered). With **Motion** off or `prefers-reduced-motion`, Dani stops walking and animating but still speaks.

To change any line, edit the `data-dani-*` attributes on the `<section>` in `index.html`. Reaction lines live in `reactions` in `assets/js/dani.js`.

---

## 5. Replacing content and assets

### 5.1 Text
All copy is in `index.html`, one commented block per scene. Edit it like any HTML.

### 5.2 Trailer, contact, fact sheet, PDF (`assets/js/config.js`)
```js
trailer: { type: "file", src: "assets/media/trailer.mp4", poster: "assets/img/posters/poster-2.webp", captions: "assets/media/trailer.en.vtt" }
// or  { type: "youtube", src: "VIDEO_ID" }   or  { type: "vimeo", src: "123456" }
deckPdf: "assets/media/artist-pitch-deck.pdf",
contact: { name: "…", email: "…", phone: "…", instagram: "https://…" },
facts: [["Runtime", "120 min"], …]      // empty values are hidden
```
- **Trailer file:** export H.264 MP4, 1080p, about 8–12 Mbps, `faststart`. YouTube/Vimeo embeds only load after the visitor clicks Play (privacy and speed).
- **Pitch-deck PDF:** the deck reveals the twist. Only publish it if that is intended.

### 5.3 Fonts
The site uses Google Fonts. To self-host: download WOFF2 files for **Bebas Neue**, **Oswald** (300/400/600) and **Caveat** (500/700) into `assets/fonts/`, add `@font-face` rules at the top of `main.css`, and delete the Google Fonts `<link>` tags in `index.html`.

Substitutions (the PDF embeds no fonts, so these are visual matches):

| Deck usage | Used on site | Why |
|---|---|---|
| Distressed condensed caps headings | Bebas Neue + SVG `#grunge` erosion filter | Same Bebas skeleton; the filter recreates the worn texture |
| Condensed caps body | Bebas Neue (leads), **Oswald** (long paragraphs) | Oswald has lowercase, so long reading stays comfortable |
| "PITCH DECK" wide tracked | Oswald 600, +0.3em | Closest geometric condensed match |
| Structure slide | Arial / Helvetica bold | Matches the deck |
| Script / handwriting | Caveat (Dani's speech only) | "The End" itself is kept as the original artwork |

### 5.4 Images
Images are WebP. To swap one, keep the file name, or update the `src`, `width` and `height` in `index.html` (stills are listed in `config.js` → `reels`).

- **Recommended sizes:** stills 1600–2000 px wide; posters at least 1200 px tall; logo as a transparent WebP/PNG at about 1400 px wide.
- **Higher-resolution originals:** every image here was cut from the PDF, so the frame grabs are about 1000 px wide. Replacing the 20 stills and the 6 posters with **original exports** is the single biggest quality upgrade.
- **Converting to WebP** (no Node needed): Squoosh (squoosh.app, in the browser), or `cwebp -q 82 in.jpg -o out.webp`.

### 5.5 Dani's artwork
Dani is inline SVG inside `<div class="dani">` in `index.html`, viewBox `0 0 100 150`, feet at the bottom.
- **Recolour:** change `.c-skin`, `.c-hair`, `.c-shirt` and the other `.c-*` fills in `main.css` (DANI section) to resemble the real Dani.
- **Redraw:** replace the shapes but **keep these group classes** so the animation keeps working: `d-legL`, `d-legR`, `d-torso`, `d-armL`, `d-armR`, `d-brush`, `d-head`, `d-brows` (`d-browL`/`d-browR`), `d-pupils`, `d-lid`, `d-m--{mood}` (one mouth per mood) and `d-finger`. Pivot points are set in CSS (`transform-origin`).
- **Illustrator artwork:** export it as SVG, then paste the paths into the matching groups.

### 5.6 Laurels / festival selections
Add them to the opening (`#opening .opening__inner`) as `<img>` SVGs, or as a list in `#watch`.

---

## 6. Deploy

The site is static. **Upload only `index.html` and `assets/`** (and optionally `docs/`). `tools/` holds a copy of the deck PDF and should not be published.

- **Netlify:** drag the folder onto app.netlify.com/drop, or connect a repo. Publish directory: the project root. No build command.
- **GitHub Pages:** push to a repo, then Settings → Pages → Deploy from branch → `/ (root)`. Add a `.gitignore` entry for `tools/`, or keep the deck out of the repo.
- **Vercel / Cloudflare Pages:** framework "Other", build command empty, output directory `.`
- **Any web host (cPanel/FTP):** upload `index.html` and `assets/` into `public_html/`.

Before going live:
1. Fill in `contact` and the empty `facts` in `config.js`, and add the trailer.
2. Update the `og:image` in `<head>` to an absolute URL (e.g. `https://yourdomain/assets/img/posters/poster-2.webp`) so link previews work.
3. Resolve the flags in `docs/01-deck-analysis.md` §4.

---

## 7. Final checklist

### Content completeness
- [x] All 39 deck pages are mapped to a scene (see the inventory in `docs/01-deck-analysis.md` §3) **and** viewable in the original-deck viewer
- [x] Every paragraph of deck text is on the page as live HTML (typos corrected; see §8)
- [x] Twist (p.10) preserved behind a password seal; slide 10 veiled in the viewer behind the same password
- [x] All 20 stills, 6 posters, cast cutouts and atmosphere art used
- [ ] Contact details, runtime, year, format: **not in the deck**, so they need your input (`config.js`)
- [ ] Trailer: slot ready, needs your file or link
- [ ] Open flags confirmed (§8)

### Responsive
- [x] Tested at 375×812 (phone), 474×365 (short), and 1280×800 / 1440×900 (desktop); no horizontal overflow
- [x] The frame thins on small screens; Dani shrinks and the bubble stays on screen and auto-hides sooner
- [x] Film strip: pinned horizontal scroll on desktop, native swipe on touch and narrow screens
- [x] Red/white slider and colour lens work with touch (drag) and keyboard
- [x] Poster wall reflows to two columns; timeline goes vertical on phones

### Accessibility
- [x] Semantic landmarks, one `h1`, ordered headings, skip link
- [x] Descriptive `alt` text on every content image; decorative art has `aria-hidden` / empty `alt`
- [x] All controls are real `<button>`s / inputs; dialogs use `<dialog>` (focus trap, Esc to close)
- [x] Keyboard: Tab through everything; arrows in the lightbox, deck viewer, slider and colour lens
- [x] `prefers-reduced-motion` honoured, plus a persistent **Motion** toggle; pinned scenes become normal flow
- [x] Dani is supplementary: every line Dani says repeats or points to content already on the page; bubbles are `aria-hidden`
- [x] Colour contrast: gold `#ffc914` and white on near-black pass WCAG AA for body text

### Performance
- [x] Zero JS libraries; one rAF loop; observers pause off-screen work (embers, lens wander)
- [x] WebP images, `loading="lazy"` + `decoding="async"`, intrinsic sizes to prevent layout shift
- [x] The logo is preloaded; the deck viewer loads only on demand
- [x] Lite mode (≤2 GB RAM or ≤2 cores): no embers, grain animation or SVG text filters
- [ ] After adding the trailer, run Lighthouse (Chrome DevTools) on the deployed URL

---

## 8. Decisions made for you (change any of them)

- **Spoiler handling:** the twist is kept but sealed behind the password `revealtwist` (share it with juries); a wrong guess gets "We got you, enjoy the suspense in theatres".
- **Copy edits:** spelling and grammar fixed without changing meaning. The full list is in `docs/01-deck-analysis.md` §4.12. Also, in the director statement, "prevent its real story origins until the very end and make the audience surprise" became "keeps its real story origins hidden until the very end and makes the audience surprised".
- **Names:** "Sidhu Kumaresan", "Gopinath Shankar", "Karthik Subbaraj", "Chiyaan Vikram".
- **P27 cut-off sentence** completed as "yet to release" (please confirm).
- **Crew:** follows the crew slide (p.35); the poster credit spellings differ (§4.5–4.6 of the analysis).
- **Third-party imagery:** comparables and market-place posters, the Joker image and the whisky logo are **not** shown inline; they remain visible in the original-deck viewer. If the site will be public, consider removing those slides from `assets/img/deck/` too.
- **No cast-to-character mapping**, because the deck never states it.

## 9. Asset sources
Every image in `assets/img/` was extracted from *ARTIST PITCH DECK - 2.pdf* (supplied by the filmmaker) using the scripts in `tools/deck-extract/`. No stock or third-party imagery was added. The frame, crack-veins, thorn trees, grain, embers and Dani are generated in code or SVG.
