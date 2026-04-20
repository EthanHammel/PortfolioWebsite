/* public/scripts/bird.js
   A small bird that flies toward anchor points and perches where it lands.
   Canvas is positioned absolutely in page-space so the bird stays put on scroll.

   BEHAVIOR
   ─────────
   • Cursor holds still for SETTLE_MS → that page-coordinate spot becomes an anchor.
   • Bird spring-lerps toward anchor, wings beating fast while airborne.
   • Once close enough to anchor and slow enough → PERCHED state.
     - Bird sits still with a gentle idle bob, wings folded or barely moving.
   • Cursor moves RADIUS_PX away and holds still again → new anchor, bird takes off.
   • Canvas is absolute (not fixed) so the perched bird scrolls with the page.
   • Hidden on mobile < 640px.
*/

(function () {
  if (window.innerWidth < 640) return;

  // ── Canvas setup — absolute, full page height ──────────────
  const canvas = document.getElementById('plane-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  function resizeCanvas() {
    const W = document.documentElement.scrollWidth;
    const H = Math.max(
      document.body.scrollHeight,
      document.documentElement.scrollHeight,
      window.innerHeight
    );
    canvas.width  = Math.max(W, window.innerWidth);
    canvas.height = H;
  }

  canvas.style.cssText = `
    position: absolute;
    top: 0; left: 0;
    pointer-events: none;
    z-index: 9000;
    width: 100%;
  `;

  resizeCanvas();

  // Resize when content changes
  window.addEventListener('resize', resizeCanvas);
  const ro = new ResizeObserver(resizeCanvas);
  ro.observe(document.body);

  // ── Constants ──────────────────────────────────────────────
  const SPRING      = 0.048;   // chase spring strength
  const DAMP        = 0.78;    // velocity damping
  const MIN_SPEED   = 1.5;     // px/frame to update heading
  const MAX_TURN    = 0.11;    // max radians heading change per frame
  const SETTLE_MS   = 700;     // ms cursor still → new anchor
  const RADIUS_PX   = 130;     // must leave this radius for new anchor
  const STILL_PX    = 9;       // px movement = "cursor moving"
  const PERCH_DIST  = 14;      // px from anchor to consider perched
  const PERCH_SPEED = 1.2;     // max speed to allow perch
  const MOSS        = '#4a7c3f';
  const MOSSA       = 'rgba(74,124,63,';
  const BARK        = 'rgba(92,74,48,';
  const S           = 22;      // bird scale unit

  // ── State ──────────────────────────────────────────────────
  let birdX = window.innerWidth / 2;
  let birdY = window.scrollY + 180;
  let bvx = 0, bvy = 0;
  let heading = 0;            // radians, 0 = pointing right

  // Anchor is in PAGE coordinates
  let anchorX = birdX, anchorY = birdY;
  let anchorLocked = false;
  let outsideRadius = true;
  let lastMoveX = window.innerWidth / 2;
  let lastMoveY = window.scrollY + window.innerHeight / 2;
  let stillSince = performance.now();

  // Wing animation
  let wingT = 0;              // time accumulator for wing beat
  let perched = false;        // true when bird has landed
  let perchBob = 0;           // idle bob oscillator

  // ── Mouse → page coordinate tracking ──────────────────────
  document.addEventListener('mousemove', e => {
    // Convert viewport coords to page coords
    const px = e.clientX;
    const py = e.clientY + window.scrollY;

    const dx = px - lastMoveX, dy = py - lastMoveY;
    const moved = Math.sqrt(dx * dx + dy * dy);

    if (moved > STILL_PX) {
      lastMoveX = px; lastMoveY = py;
      stillSince = performance.now();
      anchorLocked = false;
      perched = false;

      const adx = px - anchorX, ady = py - anchorY;
      if (Math.sqrt(adx * adx + ady * ady) > RADIUS_PX) {
        outsideRadius = true;
      }
    }
  });

  // ── Bird drawing ────────────────────────────────────────────
  // wingPhase: 0 = fully up (soaring), 1 = fully down, idle = 0.5 drooped
  function drawBird(x, y, dir, wingPhase, isPerched) {
    ctx.save();
    ctx.translate(x, y);

    // Flip horizontally if flying left
    const facingLeft = Math.cos(dir) < 0;
    if (facingLeft) ctx.scale(-1, 1);

    // Slight body tilt when flying (nose up/down)
    const tiltAngle = isPerched ? 0 : Math.sin(dir) * 0.18;
    ctx.rotate(tiltAngle);

    // ── Body ────────────────────────────────────────────────
    ctx.fillStyle = MOSS;
    ctx.beginPath();
    // Oval body: wider at chest, tapered at tail
    ctx.ellipse(0, 0, S * 0.52, S * 0.28, 0, 0, Math.PI * 2);
    ctx.fill();

    // ── Head ────────────────────────────────────────────────
    ctx.beginPath();
    ctx.arc(S * 0.42, -S * 0.12, S * 0.22, 0, Math.PI * 2);
    ctx.fillStyle = '#2e5228';
    ctx.fill();

    // ── Beak ────────────────────────────────────────────────
    ctx.beginPath();
    ctx.moveTo(S * 0.62, -S * 0.10);
    ctx.lineTo(S * 0.82, -S * 0.05);
    ctx.lineTo(S * 0.62, -S * 0.00);
    ctx.closePath();
    ctx.fillStyle = '#8a9a5b'; // olive beak
    ctx.fill();

    // ── Eye ─────────────────────────────────────────────────
    ctx.beginPath();
    ctx.arc(S * 0.50, -S * 0.16, S * 0.05, 0, Math.PI * 2);
    ctx.fillStyle = '#f5f0e8';
    ctx.fill();
    ctx.beginPath();
    ctx.arc(S * 0.51, -S * 0.16, S * 0.025, 0, Math.PI * 2);
    ctx.fillStyle = '#1a1208';
    ctx.fill();

    // ── Tail feathers ────────────────────────────────────────
    ctx.beginPath();
    ctx.moveTo(-S * 0.48, 0);
    ctx.lineTo(-S * 0.80, -S * 0.10);
    ctx.lineTo(-S * 0.82, S * 0.04);
    ctx.lineTo(-S * 0.76, S * 0.18);
    ctx.lineTo(-S * 0.50, S * 0.12);
    ctx.closePath();
    ctx.fillStyle = '#2e5228';
    ctx.fill();

    // ── Wings ────────────────────────────────────────────────
    // wingPhase 0..1: 0=down position, 1=up stroke
    // perched: wings barely open, drooped gently at sides
    const wingUp   = isPerched ? 0.1 : wingPhase;
    const wingSweep = wingUp * Math.PI * 0.55; // arc of wing beat

    // Upper wing surface (top)
    ctx.save();
    ctx.rotate(-wingSweep);
    ctx.beginPath();
    ctx.moveTo(S * 0.10, -S * 0.05);
    ctx.bezierCurveTo(
      S * 0.0,  -S * (0.30 + wingUp * 0.35),  // control 1
      -S * 0.35, -S * (0.38 + wingUp * 0.30),  // control 2
      -S * 0.45, -S * 0.08                       // end
    );
    ctx.bezierCurveTo(
      -S * 0.20, -S * 0.02,
       S * 0.05,  S * 0.05,
       S * 0.10, -S * 0.05
    );
    ctx.fillStyle = MOSS;
    ctx.fill();
    ctx.strokeStyle = 'rgba(46,82,40,0.4)';
    ctx.lineWidth = 0.6;
    ctx.stroke();
    ctx.restore();

    // Lower wing / belly shadow
    ctx.save();
    ctx.rotate(wingSweep * 0.4);
    ctx.beginPath();
    ctx.moveTo(S * 0.08, S * 0.08);
    ctx.bezierCurveTo(
       S * 0.0,   S * (0.22 + wingUp * 0.20),
      -S * 0.30,  S * (0.28 + wingUp * 0.18),
      -S * 0.42,  S * 0.10
    );
    ctx.bezierCurveTo(
      -S * 0.18,  S * 0.05,
       S * 0.04,  S * 0.10,
       S * 0.08,  S * 0.08
    );
    ctx.fillStyle = '#3a6535';
    ctx.fill();
    ctx.restore();

    // ── Feet (only when perched) ─────────────────────────────
    if (isPerched) {
      ctx.strokeStyle = BARK + '0.7)';
      ctx.lineWidth = 1.2;
      ctx.lineCap = 'round';
      // Left leg
      ctx.beginPath();
      ctx.moveTo(-S * 0.05, S * 0.22);
      ctx.lineTo(-S * 0.08, S * 0.42);
      ctx.stroke();
      // Left toes
      ctx.beginPath(); ctx.moveTo(-S*0.08, S*0.42); ctx.lineTo(-S*0.18, S*0.48); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(-S*0.08, S*0.42); ctx.lineTo(-S*0.08, S*0.50); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(-S*0.08, S*0.42); ctx.lineTo( S*0.02, S*0.48); ctx.stroke();
      // Right leg
      ctx.beginPath();
      ctx.moveTo( S * 0.12, S * 0.22);
      ctx.lineTo( S * 0.10, S * 0.42);
      ctx.stroke();
      // Right toes
      ctx.beginPath(); ctx.moveTo(S*0.10, S*0.42); ctx.lineTo(S*0.00, S*0.48); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(S*0.10, S*0.42); ctx.lineTo(S*0.10, S*0.50); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(S*0.10, S*0.42); ctx.lineTo(S*0.20, S*0.48); ctx.stroke();
    }

    ctx.restore();
  }

  // ── Animation loop ─────────────────────────────────────────
  function frame() {
    const W = canvas.width, H = canvas.height;
    ctx.clearRect(0, 0, W, H);

    const now = performance.now();

    // Check for new anchor lock
    // mousemove updates lastMoveX/Y and resets stillSince whenever cursor moves > STILL_PX
    // So if stillSince is old enough, cursor has genuinely been still
    if (!anchorLocked && outsideRadius) {
      if (now - stillSince >= SETTLE_MS) {
        anchorX = lastMoveX;
        anchorY = lastMoveY;
        anchorLocked = true;
        outsideRadius = false;
        perched = false;
      }
    }

    // Spring physics toward anchor
    const distToAnchor = Math.sqrt((anchorX - birdX) ** 2 + (anchorY - birdY) ** 2);

    if (!perched) {
      bvx += (anchorX - birdX) * SPRING;
      bvy += (anchorY - birdY) * SPRING;
      bvx *= DAMP;
      bvy *= DAMP;
      birdX += bvx;
      birdY += bvy;

      const speed = Math.sqrt(bvx * bvx + bvy * bvy);

      // Update heading from bird's own velocity
      if (speed > MIN_SPEED) {
        const target = Math.atan2(bvy, bvx);
        let diff = target - heading;
        while (diff >  Math.PI) diff -= 2 * Math.PI;
        while (diff < -Math.PI) diff += 2 * Math.PI;
        heading += Math.max(-MAX_TURN, Math.min(MAX_TURN, diff));
      }

      // Wing beat — faster when moving fast
      const beatRate = 0.08 + Math.min(speed / 12, 1) * 0.14;
      wingT += beatRate;

      // Check if close enough to perch
      if (distToAnchor < PERCH_DIST && speed < PERCH_SPEED) {
        perched = true;
        bvx = 0; bvy = 0;
        birdX = anchorX;
        birdY = anchorY;
      }
    } else {
      // Perched idle: gentle bob
      perchBob += 0.04;
      birdY = anchorY + Math.sin(perchBob) * 1.8;
      // Wings settle slowly
      wingT += 0.018;
    }

    const speed = Math.sqrt(bvx * bvx + bvy * bvy);

    // Wing phase: sinusoidal 0..1
    const wingPhase = perched
      ? 0.5 + Math.sin(wingT) * 0.08          // barely moving when perched
      : 0.5 + Math.sin(wingT * 6.28) * 0.5;   // full beat when flying

    drawBird(birdX, birdY, heading, Math.max(0, Math.min(1, wingPhase)), perched);

    requestAnimationFrame(frame);
  }

  requestAnimationFrame(frame);
})();
