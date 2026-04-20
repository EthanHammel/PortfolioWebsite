/* public/scripts/bird.js
   Spritesheet cursor bird.

   BEHAVIOR
   ──────────
   • A bird sprite chases the cursor with a slight lag, travelling in a sin wave.
   • While moving: cycles through 5 flapping frames from bird-sheet.png.
   • While still (cursor stopped): switches to bird-sit.png, no animation.
   • Bird never rotates — always upright, just translates.
   • Horizontally flipped when moving left (CSS scaleX(-1)).
   • If cursor is hovering a link/button, bird "snaps" closer (tighter lag).
   • Hidden on mobile < 640px.
   • Uses a DOM div with background-image, no canvas.
*/

(function () {
  if (window.innerWidth < 640) return;

  // ── Sprite constants (match upscaled PNGs) ─────────────────
  const FRAME_W    = 126;   // px per frame (630 / 5)
  const FRAME_H    = 180;   // px height
  const NUM_FRAMES = 5;
  const FPS        = 10;    // flap animation fps

  // ── Physics ────────────────────────────────────────────────
  const LAG_NORMAL = 0.10;  // how much bird closes gap per frame (0..1)
  const LAG_SNAP   = 0.28;  // tighter lag when over a link
  const SIN_AMP    = 18;    // sin-wave amplitude in px
  const SIN_FREQ   = 0.045; // sin-wave frequency (radians per px of travel)
  const STILL_PX   = 2.5;   // speed below which bird is "still"

  // ── Create DOM element ─────────────────────────────────────
  const el = document.createElement('div');
  el.setAttribute('aria-hidden', 'true');
  el.style.cssText = `
    position: fixed;
    top: 0; left: 0;
    width: ${FRAME_W}px;
    height: ${FRAME_H}px;
    pointer-events: none;
    z-index: 99999;
    image-rendering: pixelated;
    image-rendering: crisp-edges;
    background-repeat: no-repeat;
    background-size: auto ${FRAME_H}px;
    transform-origin: center center;
    will-change: transform;
  `;
  document.body.appendChild(el);

  // ── State ──────────────────────────────────────────────────
  let mouseX = window.innerWidth  / 2;
  let mouseY = window.innerHeight / 2;
  let birdX  = mouseX;
  let birdY  = mouseY;

  let sinT       = 0;       // accumulates as bird travels horizontally
  let frameIdx   = 0;       // current spritesheet frame 0..4
  let lastFrameT = 0;       // timestamp of last frame advance
  let facingLeft = false;   // controls scaleX flip
  let isOverLink = false;   // cursor is on interactive element
  let speed      = 0;       // bird speed this frame

  // Track cursor
  document.addEventListener('mousemove', e => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    // Check if cursor is over a link or button
    isOverLink = !!(e.target && (
      e.target.closest('a') ||
      e.target.closest('button') ||
      e.target.closest('[role="tab"]') ||
      e.target.closest('input') ||
      e.target.closest('label')
    ));
  });

  // ── Render helpers ─────────────────────────────────────────
  function setFrame(idx) {
    // spritesheet: shift background-position-x
    el.style.backgroundImage = `url('/bird-sheet.png')`;
    el.style.backgroundPositionX = `-${idx * FRAME_W}px`;
    el.style.backgroundPositionY = '0px';
  }

  function setSitting() {
    el.style.backgroundImage = `url('/bird-sit.png')`;
    el.style.backgroundPositionX = '0px';
    el.style.backgroundPositionY = '0px';
  }

  // ── Animation loop ─────────────────────────────────────────
  function frame(ts) {
    const lag = isOverLink ? LAG_SNAP : LAG_NORMAL;

    // Move bird toward cursor with lag
    const dx = mouseX - birdX;
    const dy = mouseY - birdY;
    const prevX = birdX;

    birdX += dx * lag;
    // Sin wave perpendicular to travel direction (vertical offset)
    // Only apply sin wave when actually moving horizontally
    const horizSpeed = Math.abs(dx);
    if (horizSpeed > 0.5) {
      sinT += SIN_FREQ * Math.abs(dx * lag);
    }
    const sinOffset = horizSpeed > 0.5 ? Math.sin(sinT) * SIN_AMP : 0;
    birdY += dy * lag + (sinOffset - (Math.sin(sinT - SIN_FREQ * Math.abs(dx * lag)) * SIN_AMP)) * 0.6;

    speed = Math.sqrt(
      (birdX - prevX) * (birdX - prevX) +
      (birdY - (birdY - dy * lag)) * (birdY - (birdY - dy * lag))
    );
    // Simpler speed: just use horizontal+vertical delta
    speed = Math.sqrt((dx * lag) ** 2 + (dy * lag) ** 2);

    const isMoving = speed > STILL_PX;

    // Facing direction — only update when actually moving horizontally
    if (Math.abs(dx * lag) > 0.8) {
      facingLeft = dx < 0;
    }

    // Sprite: animate when moving, sit when still
    if (isMoving) {
      const msPerFrame = 1000 / FPS;
      if (ts - lastFrameT >= msPerFrame) {
        frameIdx = (frameIdx + 1) % NUM_FRAMES;
        lastFrameT = ts;
      }
      setFrame(frameIdx);
    } else {
      setSitting();
      // Reset sinT phase smoothly when stopped so restart is smooth
      sinT = Math.round(sinT / (Math.PI * 2)) * (Math.PI * 2);
    }

    // Position: center the sprite on the bird's logical position
    // Offset so the bird's "center" (roughly mid-body) tracks near cursor
    const drawX = birdX - FRAME_W / 2;
    const drawY = birdY - FRAME_H / 2;

    const flip = facingLeft ? 'scaleX(-1)' : 'scaleX(1)';
    el.style.transform = `translate(${drawX.toFixed(1)}px, ${drawY.toFixed(1)}px) ${flip}`;

    requestAnimationFrame(frame);
  }

  // Start sitting
  setSitting();
  requestAnimationFrame(frame);
})();
