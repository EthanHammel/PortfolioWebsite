# Portfolio Setup Guide

Everything you need to get this online and keep editing it.

---

## Part 1 — Connecting to GitHub

### What you need first
- A [GitHub account](https://github.com) (free)
- [Git](https://git-scm.com/downloads) installed on your computer
- [Node.js](https://nodejs.org) installed (LTS version)
- A code editor — [VS Code](https://code.visualstudio.com) is free and good

---

### Step 1 — Create a new repo on GitHub

1. Go to [github.com/new](https://github.com/new)
2. Repository name: `portfolio` (or anything you want)
3. Set it to **Private** if you don't want others to see the source code
4. **Do NOT** check "Add a README" — leave everything unchecked
5. Click **Create repository**
6. Copy the URL shown — it'll look like `https://github.com/ethanhammel/portfolio.git`

---

### Step 2 — Set up the project on your computer

Unzip the portfolio.zip file somewhere permanent (like `Documents/portfolio`).

Open a terminal (on Windows: right-click the folder → "Open in Terminal"):

```bash
# Go into the project folder
cd Documents/portfolio

# Install dependencies
npm install

# Test it works locally
npm run dev
# → Open http://localhost:4321 in your browser
```

---

### Step 3 — Connect to your GitHub repo

In that same terminal:

```bash
# Initialize git in the project folder
git init

# Point it at your GitHub repo (paste YOUR url from Step 1)
git remote add origin https://github.com/ethanhammel/portfolio.git

# Stage all files
git add .

# First commit
git commit -m "Initial portfolio"

# Push to GitHub
git push -u origin main
```

If it asks for your GitHub username/password: use your username and a
**Personal Access Token** (not your password). Get one at:
GitHub → Settings → Developer settings → Personal access tokens → Generate new token.
Check the `repo` scope, copy the token, and paste it as the password.

---

### Step 4 — Connect to Vercel for free hosting

1. Go to [vercel.com](https://vercel.com) and sign up with your GitHub account
2. Click **Add New → Project**
3. Find your `portfolio` repo and click **Import**
4. Vercel detects Astro automatically — just click **Deploy**
5. In ~60 seconds your site is live at `ethanhammel.vercel.app` (or similar)

**Every time you push to GitHub, Vercel redeploys automatically.** That's your whole
update workflow: edit → save → `git push` → live in 30 seconds.

---

### Your daily edit workflow

```bash
# Make your changes in VS Code, then:

npm run dev          # preview at localhost:4321 (optional)

git add .
git commit -m "Updated skills section"
git push             # → Vercel picks it up and redeploys
```

---

## Part 2 — Adding tip callout boxes anywhere

Callout boxes can go anywhere in any `.astro` page file.
There are two styles: **note** (green tint) and **heads-up** (amber tint).

### Green note box

```html
<div class="callout callout--note">
  <span class="callout__icon">💡</span>
  <div>
    <span class="callout__label">Note</span>
    <p class="callout__text">
      Your tip text here. Write whatever you want.
    </p>
  </div>
</div>
```

### Amber heads-up box

```html
<div class="callout callout--heads-up">
  <span class="callout__icon">⚠️</span>
  <div>
    <span class="callout__label">Heads up</span>
    <p class="callout__text">
      Something to draw attention to.
    </p>
  </div>
</div>
```

**Change the emoji** to anything — 📌 🔧 🎨 ✅ 📎 — just swap it in the icon span.
**Change the label** to anything — "Fun fact", "Context", "Ask me about this", etc.

### Where to put them

Drop them anywhere inside a page's `<div class="resume-page">` or equivalent.
Good spots:
- Right after the `</section>` closing tag for experience or skills
- Before or after the education section
- At the bottom before the closing `</div>`

---

## Part 3 — Keyword tooltips in text (the green underline ones)

These work anywhere in body copy — job descriptions, the lede paragraph, anywhere.

```html
<span class="kw">
  the word or phrase
  <span class="kw-panel">
    <span class="kw-panel__label">label</span>
    <span class="kw-panel__body">
      Your explanation. Keep it 1–2 sentences.
    </span>
  </span>
</span>
```

The **label** is the small grey text above the explanation (like "What is this?" or
"Software" or "Methodology"). The **body** is the actual explanation.

On desktop: appears on hover above the word.
On mobile: tap the word to open a bottom sheet, tap anywhere else to close.

---

## Part 4 — Skill tag tooltips

Every skill tag in the Skills section has a `data-tip` attribute.
To change or add a tooltip, just edit the text inside the quotes:

```html
<span class="tag tag--green skill-tag"
  data-tip="Your explanation of this skill here.">
  Skill Name
</span>
```

To add a **new skill tag with a tooltip**:

```html
<!-- Green tag (primary skills) -->
<span class="tag tag--green skill-tag"
  data-tip="Explain your experience with this skill.">
  New Skill
</span>

<!-- Brown tag (expertise/soft skills) -->
<span class="tag tag--brown skill-tag"
  data-tip="Explain your experience here.">
  New Expertise
</span>

<!-- Plain tag (no color, secondary) — tooltip still works -->
<span class="tag skill-tag"
  data-tip="Your explanation.">
  Another Skill
</span>
```

To add a tag **without a tooltip**, just leave out `data-tip` entirely:

```html
<span class="tag tag--green">Skill Name</span>
```

On desktop: tooltip appears above the tag on hover.
On mobile: tap the tag to see the explanation in a bottom sheet, tap elsewhere to close.

---

## Part 5 — Adding art images

Drop any `.png`, `.jpg`, `.gif`, or `.webp` file into `public/art/` and rebuild.
They appear in the gallery automatically, sorted alphabetically.

To control the order, prefix filenames with numbers:
```
01-portfolio-piece.png
02-another-work.gif
03-sketch.jpg
```

---

## Quick reference — file locations

| What you want to edit | File |
|---|---|
| Your name, email, GitHub, LinkedIn | `src/layouts/BaseLayout.astro` (top constants) |
| Home page text, marquee, lede | `src/pages/index.astro` |
| Job history, skills, education | `src/pages/resume.astro` |
| Art page intro text | `src/pages/art.astro` |
| Interactive projects (when ready) | `src/pages/interactive.astro` |
| Art images | Drop into `public/art/` |
| Bird sprite images | `public/bird-sheet.png`, `public/bird-sit.png` |
| Bird behavior (speed, wave, etc.) | `public/scripts/bird.js` (constants at top) |
