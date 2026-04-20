SESSION_HANDOFF v5 — ETHAN HAMMEL PORTFOLIO
For AI use only. Verified build: 5 pages, 0 errors, Astro 4.16.19 static.

===SESSION_5_CHANGES===
BIRD replaces airplane:
- public/scripts/airplane.js DELETED, replaced by public/scripts/bird.js
- PaperAirplane.astro now loads /scripts/bird.js (component name kept for minimal diff)
- Canvas changed from position:fixed to position:absolute (scrolls with page)
  - JS resizes canvas to full document.body.scrollHeight on load + ResizeObserver
  - body { position: relative } already in global.css — canvas anchors to it correctly
- Anchor system retained: SETTLE_MS=700 RADIUS_PX=130 STILL_PX=9
- lastMoveX/Y init to viewport center in page coords (not 0,0)
- anchorX/Y init matches bird start position

BIRD DRAWING (drawBird in bird.js):
- Body: moss green ellipse, tapered
- Head: dark green circle offset forward+up
- Beak: olive triangle
- Eye: white circle + black pupil
- Tail: dark green swept polygon
- Wings: TWO bezier surfaces (upper + lower) that rotate via wingT accumulator
  - Flying: wingPhase = 0.5 + sin(wingT*6.28)*0.5, beatRate scales with speed
  - Perched: wingPhase = 0.5 + sin(wingT)*0.08 (barely moving)
- Feet: 6 ctx.stroke() lines (3 toes each), only drawn when perched:true
- Horizontal flip via ctx.scale(-1,1) when Math.cos(heading)<0 (flying left)
- Body tilt: sin(heading)*0.18 rad, 0 when perched

PERCH STATE:
- perched=true when distToAnchor<14px AND speed<1.2px/frame
- Idle bob: birdY = anchorY + sin(perchBob)*1.8, perchBob += 0.04/frame
- Any cursor movement > STILL_PX sets perched=false, bird takes off

===OWNER===
Ethan S. Hammel | ethan.s.hammel@gmail.com | 253.432.6819 | Gig Harbor WA
GitHub/LinkedIn slugs: ethanhammel (update BaseLayout.astro constants if different)

===ALL_COMPLETED===
STRUCTURE: astro.config.mjs, package.json, vercel.json, .gitignore, README.md, CONTENT_GUIDE.md
LAYOUTS: BaseLayout.astro (Nav+PaperAirplane components, Ethan's real constants)
COMPONENTS: Nav.astro, PaperAirplane.astro(→bird), Marquee.astro, ArtGallery.astro, KeywordTooltip.astro
PAGES: index.astro(Ethan's real info), resume.astro(full real data), art.astro(auto-glob), interactive.astro(placeholder), 404.astro
STYLES: global.css(all tokens+components), home.css, resume.css, art.css, interactive.css, print.css
PUBLIC: favicon.svg, og-default.svg, scripts/bird.js, fonts/README.txt, art/README.txt

===NOT_DONE===
- Verify GitHub/LinkedIn slugs for Ethan (ethanhammel is a guess)
- Self-host fonts (public/fonts/README.txt)
- Interactive section (project-card template in comment in interactive.astro)
- Art images (drop in public/art/, rebuild)
- Update og-default.svg text ("Your Name" still there)

===DESIGN_SYSTEM===
palette: paper#f5f0e8 paper-dark#ede7d9 linen#d6cdb8 bark#8b7355 bark-dark#5c4a30 bark-deep#3a2e1e moss#4a7c3f moss-dark#2e5228 moss-light#6a9e5e text#3a2e1e text-mid#6b5a42 text-light#9a8672 border#cec3ae border-dark#b0a28a
fonts: Playfair Display(display/italic) Libre Baskerville(body) DM Mono(11px mono labels)
rules: NO all-caps. NO border-radius>2px. NO green glows. sentence-case. 150-220ms ease.
For AI use only. Verified build: 5 pages, 0 errors, Astro 4.16.19 static.

===OWNER===
Ethan S. Hammel | ethan.s.hammel@gmail.com | 253.432.6819 | Gig Harbor WA
GitHub/LinkedIn slugs: ethanhammel (update in BaseLayout.astro if different)

===SESSION_4_CHANGES===
1. resume.astro: fully populated with real data from PDF:
   - Header: Ethan S. Hammel, UWT IT Student, email+phone+city
   - Summary pull-quote from resume language
   - Job 1: Massimo Italian Bar & Grill, Nov 2018–Present, Waiter/Barback/Busboy, kw tooltip on "POS systems", bullet list
   - Job 2: Titan Inspection Services, Feb–Jun 2021, Report Writer, kw tooltip on "Spectora", bullet list
   - Skills: Software (Office365/Outlook/Zoom/Dinerware/VirtualBox/Spectora), Networking (LAN/DHCP/VPN/DNS), Platforms+Browsers, Areas of expertise (brown tags)
   - Education: ACS in progress @ TCC, HS Diploma @ Peninsula HS, Food Handler Cert
   - Note callout: "References available on request"
   - Local <style> block adds .timeline-item__bullets flex-col list

2. BaseLayout.astro constants updated:
   - BRAND_NAME = 'Ethan Hammel'
   - CONTACT_EMAIL = 'ethan.s.hammel@gmail.com'
   - GITHUB_URL / LINKEDIN_URL = ethanhammel (placeholder slugs, needs real verification)
   - Default title/description updated

3. index.astro updated:
   - marqueeItems: IT-themed real items
   - Header: "Open to opportunities · Gig Harbor, WA", real name, real title
   - Contact row: real email, phone, LinkedIn, GitHub

4. airplane.js REWRITTEN — anchor-point behavior:
   - SETTLE_MS=680: cursor still this long → locks anchor at that position
   - RADIUS_PX=120: cursor must leave this radius before new anchor can form
   - STILL_PX=8: pixel threshold for "cursor is moving"
   - outsideRadius flag: prevents rapid re-anchoring
   - Plane spring-lerps to ANCHOR (not live cursor): SPRING=0.055 DAMP=0.80
   - Heading still derived from plane's own velocity (MIN_SPEED=2, MAX_TURN=0.12)
   - drawAnchor(): subtle pulsing ring + center dot at anchor point (MOSSA 0.12-0.18 alpha)
   - Trail: TRAIL_LEN=32 ring buffer, fading dots + 3 whisker speed lines
   - Mobile guard: returns early if innerWidth<640

===EDITING / CMS QUESTION (user asked)===
User wants to edit the site themselves without others being able to.
ANSWER GIVEN: No secret login needed for a static site — the site IS the finished
output. Editing = editing the source files and rebuilding. Workflow:
  - Edit source files locally
  - npm run build → generates dist/
  - Push to GitHub → Vercel auto-deploys
Nobody can edit the live site from the browser. Only whoever has the source files
and GitHub access can make changes. That IS the access control.
If user wants a CMS in the future: Netlify CMS or TinaCMS can add a /admin route
with password login that writes back to the GitHub repo. Not needed yet.

===NOT_DONE / FUTURE===
- Verify GitHub/LinkedIn slugs are correct for Ethan
- Self-host fonts (public/fonts/README.txt has instructions)
- Interactive section: placeholder ready, project-card template in comment
- Art section: drop images into public/art/, rebuild
- OG image: update text in public/og-default.svg ("Your Name" still there)
- Blog: Astro MDX, easy add
- Dark mode: CSS vars ready, needs :root.dark toggle

===DESIGN_SYSTEM_CANONICAL===
palette: paper#f5f0e8 paper-dark#ede7d9 paper-mid#e4dccb linen#d6cdb8 bark#8b7355 bark-dark#5c4a30 bark-deep#3a2e1e moss#4a7c3f moss-dark#2e5228 moss-light#6a9e5e text#3a2e1e text-mid#6b5a42 text-light#9a8672 border#cec3ae border-dark#b0a28a
fonts: display=Playfair Display, body=Libre Baskerville, mono=DM Mono 11px
rules: NO all-caps. NO border-radius>2px. NO green glows. sentence-case. 150-220ms ease. warm brown shadows rgba(58,46,30,…).
airplane NEW BEHAVIOR: anchor-point system. SETTLE_MS=680 RADIUS_PX=120 STILL_PX=8. Plane chases anchor not live cursor. Pulsing ring marks anchor. Heading from plane velocity.
chips: clip-path clipped corner. filled=bark-dark→moss-dark. ghost=transparent border-bark. DM Mono 11px.
kw: border-bottom 1.5px moss-light. hover moss-dark + rgba(74,124,63,0.07) bg tint. panel absolute desktop / fixed bottom-sheet mobile.
paper-card: bg #faf7f2 border border-dark shadow 0 4px 16px rgba(58,46,30,0.10)+3px 3px 0 linen

===KEY_FILES===
BaseLayout.astro: BRAND_NAME/CONTACT_EMAIL/GITHUB_URL/LINKEDIN_URL constants at top
index.astro: marqueeItems[], header text, contact row
resume.astro: all real content. timeline-item__bullets local style block at bottom.
public/scripts/airplane.js: full anchor-point rewrite. all constants at top of IIFE.
src/styles/global.css: all design tokens + shared components
