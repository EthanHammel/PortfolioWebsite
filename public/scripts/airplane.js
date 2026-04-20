/* public/scripts/airplane.js
   Paper airplane — anchor-point cursor system.

   BEHAVIOR:
   - Cursor sits still → after SETTLE_MS it "locks" that position as an anchor point.
   - Airplane spring-lerps toward the current anchor.
   - Cursor moves far enough away (RADIUS_PX) and sits still again → new anchor locks.
   - Airplane heading derived from its own velocity (no jitter).
   - Trail: fading dot ring-buffer + 3 speed-whisker lines.
   - Hidden on mobile (< 640px).
*/

(function () {
  if (window.innerWidth < 640) return;

  const canvas = document.getElementById('plane-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  // ── Constants ─────────────────────────────────────────────
  const SPRING       = 0.055;   // how eagerly plane chases anchor
  const DAMP         = 0.80;    // velocity damping per frame
  const MIN_SPEED    = 2;       // px/frame threshold to update heading
  const MAX_TURN     = 0.12;    // max radians heading can change per frame
  const TRAIL_LEN    = 32;      // dot trail length
  const PLANE_SIZE   = 20;
  const MOSS         = '#4a7c3f';
  const MOSSA        = 'rgba(74,124,63,';

  const SETTLE_MS    = 680;     // ms cursor must be still to create anchor
  const RADIUS_PX    = 120;     // cursor must leave this radius to allow new anchor
  const STILL_PX     = 8;       // px threshold for "cursor is still"

  // ── State ─────────────────────────────────────────────────
  let W = window.innerWidth, H = window.innerHeight;
  canvas.width = W; canvas.height = H;

  let mouseX = W / 2, mouseY = H / 2;
  let anchorX = W / 2, anchorY = H / 2;

  // cursor settle tracking
  let lastMoveX = mouseX, lastMoveY = mouseY;
  let stillSince = performance.now();
  let anchorLocked = false;       // true once cursor has sat still enough
  let outsideRadius = true;       // true once cursor left old anchor radius

  // plane physics
  let planeX = W / 2, planeY = H / 2;
  let pvx = 0, pvy = 0, planeAngle = 0;

  // trail
  const trail = Array.from({ length: TRAIL_LEN }, () => ({ x: planeX, y: planeY, a: 0 }));
  let trailHead = 0;

  // ── Resize ────────────────────────────────────────────────
  window.addEventListener('resize', () => {
    W = window.innerWidth; H = window.innerHeight;
    canvas.width = W; canvas.height = H;
  });

  // ── Mouse tracking ────────────────────────────────────────
  document.addEventListener('mousemove', e => {
    mouseX = e.clientX;
    mouseY = e.clientY;

    const dx = mouseX - lastMoveX, dy = mouseY - lastMoveY;
    const moved = Math.sqrt(dx * dx + dy * dy);

    if (moved > STILL_PX) {
      // cursor is moving — reset settle timer
      lastMoveX = mouseX;
      lastMoveY = mouseY;
      stillSince = performance.now();
      anchorLocked = false;

      // check if cursor has left the old anchor radius
      const adx = mouseX - anchorX, ady = mouseY - anchorY;
      if (Math.sqrt(adx * adx + ady * ady) > RADIUS_PX) {
        outsideRadius = true;
      }
    }
  });

  // ── Draw helpers ──────────────────────────────────────────
  function drawTrail(speed) {
    const boost = Math.min(speed / 18, 1);
    for (let i = 0; i < TRAIL_LEN; i++) {
      const idx = (trailHead - 1 - i + TRAIL_LEN) % TRAIL_LEN;
      const dot = trail[idx];
      const age = i / TRAIL_LEN;
      const alpha = (1 - age) * (0.20 + boost * 0.12) * dot.a;
      const r = (1 - age) * (2 + boost * 1.5);
      if (alpha < 0.01 || r < 0.1) continue;
      ctx.beginPath();
      ctx.arc(dot.x, dot.y, r, 0, Math.PI * 2);
      ctx.fillStyle = MOSSA + alpha + ')';
      ctx.fill();
    }
  }

  function drawPlane(x, y, angle, speed) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    const s = PLANE_SIZE;
    const boost = Math.min(speed / 18, 1);

    // whisker speed lines
    ctx.strokeStyle = MOSSA + (0.15 + boost * 0.2) + ')';
    ctx.lineWidth = 0.8;
    for (const sp of [-0.22, 0, 0.22]) {
      const len = 9 + boost * 14;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(-Math.cos(sp) * len, -Math.sin(sp) * len);
      ctx.stroke();
    }

    // airplane body
    ctx.fillStyle = MOSS;
    ctx.strokeStyle = 'rgba(46,82,40,0.7)';
    ctx.lineWidth = 0.7;
    ctx.beginPath();
    ctx.moveTo(s * 0.55, 0);
    ctx.lineTo(-s * 0.35, -s * 0.38);
    ctx.lineTo(-s * 0.15, 0);
    ctx.lineTo(-s * 0.35, s * 0.38);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // fold crease
    ctx.beginPath();
    ctx.moveTo(s * 0.55, 0);
    ctx.lineTo(-s * 0.15, 0);
    ctx.strokeStyle = 'rgba(245,240,232,0.5)';
    ctx.lineWidth = 0.5;
    ctx.stroke();

    ctx.restore();
  }

  // Draw a subtle pulse ring at the anchor point
  let pulseT = 0;
  function drawAnchor(x, y) {
    pulseT += 0.04;
    const r = 5 + Math.sin(pulseT) * 3;
    const alpha = 0.12 + Math.sin(pulseT) * 0.06;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.strokeStyle = MOSSA + alpha + ')';
    ctx.lineWidth = 1;
    ctx.stroke();
    // center dot
    ctx.beginPath();
    ctx.arc(x, y, 2, 0, Math.PI * 2);
    ctx.fillStyle = MOSSA + '0.18)';
    ctx.fill();
  }

  // ── Animation loop ────────────────────────────────────────
  function frame() {
    ctx.clearRect(0, 0, W, H);

    const now = performance.now();

    // Check if cursor has been still long enough to lock a new anchor
    if (!anchorLocked && outsideRadius) {
      const stillMs = now - stillSince;
      const dx = mouseX - lastMoveX, dy = mouseY - lastMoveY;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist <= STILL_PX && stillMs >= SETTLE_MS) {
        // Lock new anchor
        anchorX = mouseX;
        anchorY = mouseY;
        anchorLocked = true;
        outsideRadius = false;
      }
    }

    // Spring toward anchor
    pvx += (anchorX - planeX) * SPRING;
    pvy += (anchorY - planeY) * SPRING;
    pvx *= DAMP;
    pvy *= DAMP;
    planeX += pvx;
    planeY += pvy;

    const speed = Math.sqrt(pvx * pvx + pvy * pvy);

    // Update heading from plane's own velocity (jitter-free)
    if (speed > MIN_SPEED) {
      const target = Math.atan2(pvy, pvx);
      let diff = target - planeAngle;
      while (diff >  Math.PI) diff -= 2 * Math.PI;
      while (diff < -Math.PI) diff += 2 * Math.PI;
      planeAngle += Math.max(-MAX_TURN, Math.min(MAX_TURN, diff));
    }

    // Record trail
    trail[trailHead] = { x: planeX, y: planeY, a: Math.min(speed / 3, 1) };
    trailHead = (trailHead + 1) % TRAIL_LEN;

    drawAnchor(anchorX, anchorY);
    drawTrail(speed);
    drawPlane(planeX, planeY, planeAngle, speed);

    requestAnimationFrame(frame);
  }

  requestAnimationFrame(frame);
})();
