# Portfolio Site — Content Guide

A practical reference for adding and updating content on your site.
You don't need to touch the design files for any of this.

---

## Quick start

```bash
npm install       # first time only
npm run dev       # local preview at http://localhost:4321
npm run build     # build for deployment
```

---

## Adding images to the Art page

The gallery is fully automatic. Drop a file in, rebuild, and it appears.

### Step 1 — Add your file

Put any image file into:
```
public/art/
```

### Supported formats

| Format | Extension | Notes |
|--------|-----------|-------|
| PNG | .png | Best for illustrations, screenshots, art |
| JPEG | .jpg or .jpeg | Best for photographs |
| GIF | .gif | Animated GIFs work — they will play automatically |
| WebP | .webp | Modern format, smaller file sizes |

### Step 2 — Rebuild

```bash
npm run build
```
Or if you're running dev mode, just save any file and the browser refreshes.

### What you get automatically

- Your image appears in the gallery, full width
- On hover (desktop): a metadata overlay shows the filename
- On tap (mobile): tap the image to toggle the overlay
- Images load lazily (good for performance)
- They're sorted alphabetically by filename

### Tips for file naming

The filename becomes the image caption, so name files thoughtfully:

```
my-painting-spring-2024.png    → readable caption
IMG_4821.jpg                   → less readable but fine
untitled-3.gif                 → works, just less descriptive
```

Avoid spaces in filenames. Use hyphens or underscores instead.

---

## Adding animated GIFs specifically

GIFs work exactly like regular images — same folder, same process.

1. Place your `.gif` file in `public/art/`
2. Rebuild or refresh in dev mode
3. The GIF will autoplay in the gallery (that's how GIFs work in browsers)

**Performance note:** Large GIFs can be slow to load. If you have a very large
animated GIF, consider converting it to a WebP animation or a short `.mp4`
(you'd need to add video support to `art.astro` if you go that route).

---

## Ordering your art images

Images appear in **alphabetical order by filename**. To control the order,
prefix filenames with numbers:

```
01-first-piece.png
02-second-piece.jpg
03-third-piece.gif
```

---

## Adding / editing text content

All page content is in the `src/pages/` folder:

| File | What it controls |
|------|-----------------|
| `src/pages/index.astro` | Home page: name, tagline, lede paragraph, marquee text, nav card descriptions |
| `src/pages/resume.astro` | All résumé content: jobs, skills, education, pull quote |
| `src/pages/art.astro` | Art page lede paragraph (gallery is automatic) |
| `src/pages/interactive.astro` | Placeholder page — edit when you have projects to add |
| `src/layouts/BaseLayout.astro` | Navigation brand name, footer links, email address |

### Things to update everywhere (do a find-and-replace)

- `Your Name` → your actual name
- `you@example.com` → your email
- `yourusername` → your GitHub/LinkedIn username
- `Your City` → your location
- `Your Professional Title` → your title/role

---

## Updating the marquee

Open `src/pages/index.astro` and find the `marquee-strip` section.
Edit the `<span>` text items inside both `.marquee-strip__content` divs
(there are two — they must match for the seamless loop to work).

---

## Adding keyword tooltips on the résumé

On the résumé page, you can underline any word and show a tooltip on hover.
Use this pattern anywhere in `resume.astro`:

```html
<span class="kw">
  the term you want to annotate
  <span class="kw-panel">
    <span class="kw-panel__label">label</span>
    <span class="kw-panel__body">Your explanation here. Keep it to 1–2 sentences.</span>
  </span>
</span>
```

On mobile, the tooltip appears as a bottom sheet when tapped.

---

## Adding your name to the navigation

Open `src/layouts/BaseLayout.astro` and find:
```html
<a href="/" class="site-nav__brand">Your Name</a>
```
Replace `Your Name` with your actual name. Do the same for the footer brand.

---

## Adding the interactive section later

When you have projects to show, open `src/pages/interactive.astro`.
Find the comment markers:
```
<!-- ═══ PLACEHOLDER SECTION ... ═══ -->
```
Delete everything between those comments and replace with your project cards.
The card HTML template is shown in a comment directly below the placeholder.
The styles are already written in `src/styles/interactive.css`.

---

## Deploying to the web

1. Push your project to a GitHub repository
2. Go to [vercel.com](https://vercel.com) → New Project → Import from GitHub
3. Vercel auto-detects Astro — just click Deploy
4. For your custom domain: go to Project Settings → Domains → Add Domain
5. Then update DNS at your domain registrar:
   - A record: `@` → `76.76.21.21`
   - CNAME: `www` → `cname.vercel-dns.com`
6. SSL is automatic (give it up to 48 hours after DNS propagates)

---

## File structure reference

```
portfolio/
├── public/
│   ├── art/              ← DROP IMAGES HERE ← 
│   ├── styles/           ← compiled CSS (don't edit directly)
│   ├── scripts/
│   │   └── airplane.js   ← paper airplane cursor trail
│   └── favicon.svg
├── src/
│   ├── layouts/
│   │   └── BaseLayout.astro    ← nav, footer, shared HTML wrapper
│   ├── pages/
│   │   ├── index.astro         ← home page
│   │   ├── resume.astro        ← résumé
│   │   ├── art.astro           ← art gallery
│   │   └── interactive.astro   ← interactive (placeholder)
│   └── styles/
│       ├── global.css          ← all design tokens + shared components
│       ├── home.css
│       ├── resume.css
│       ├── art.css
│       └── interactive.css
├── astro.config.mjs
└── package.json
```
