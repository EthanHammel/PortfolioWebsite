# Personal Portfolio

Personal résumé and portfolio site built with [Astro](https://astro.build).
Office-spring aesthetic: warm paper tones, serif typography, forest green accents.

## Getting started

```bash
npm install
npm run dev      # → http://localhost:4321
npm run build    # → dist/
```

## Adding your content

See **CONTENT_GUIDE.md** for step-by-step instructions on:
- Filling in your name, email, and links (edit `src/layouts/BaseLayout.astro`)
- Adding work experience and skills (edit `src/pages/resume.astro`)
- Adding images and GIFs to the gallery (drop into `public/art/`)
- Deploying to Vercel

## Structure

```
public/art/          ← drop images here, auto-detected
public/fonts/        ← optional self-hosted fonts (.woff2)
src/layouts/         ← BaseLayout.astro (nav, footer, shared wrapper)
src/pages/           ← index, resume, art, interactive, 404
src/components/      ← Nav, PaperAirplane, ArtGallery, KeywordTooltip
src/styles/          ← global.css (design system) + per-page CSS
```

## Deploying

Push to GitHub → connect to [Vercel](https://vercel.com) → auto-deploy.
See CONTENT_GUIDE.md for DNS configuration.
