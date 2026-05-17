/* ══════════════════════════════════════════════════════════════
   SARGEM CyberSense Lab — Animation Utilities
   ══════════════════════════════════════════════════════════════ */

const coarsePointer = window.matchMedia('(pointer: coarse)').matches;

// ── Mouse Trail (canvas) ─────────────────────────────────────────────────────
export function initMouseTrail(sectionId) {
  if (coarsePointer) return;
  const hero = document.getElementById(sectionId);
  if (!hero) return;

  const canvas = document.createElement('canvas');
  canvas.setAttribute('aria-hidden', 'true');
  canvas.style.cssText =
    'position:absolute;inset:0;width:100%;height:100%;pointer-events:none;z-index:3;';
  hero.appendChild(canvas);

  const ctx = canvas.getContext('2d');
  let W = 0, H = 0;

  const resize = () => {
    W = canvas.width  = hero.offsetWidth;
    H = canvas.height = hero.offsetHeight;
  };
  resize();
  new ResizeObserver(resize).observe(hero);

  const pts = []; // { x, y, at }
  const TTL = 750; // ms each segment lives

  hero.addEventListener('mousemove', e => {
    const r = hero.getBoundingClientRect();
    pts.push({ x: e.clientX - r.left, y: e.clientY - r.top, at: performance.now() });
  }, { passive: true });

  (function loop() {
    requestAnimationFrame(loop);
    ctx.clearRect(0, 0, W, H);
    const now = performance.now();

    // Expire old points
    while (pts.length > 0 && now - pts[0].at > TTL) pts.shift();
    if (pts.length < 2) return;

    ctx.save();
    ctx.lineCap  = 'round';
    ctx.lineJoin = 'round';

    // Draw connecting lines with fade-out
    for (let i = 1; i < pts.length; i++) {
      const a    = pts[i - 1];
      const b    = pts[i];
      const life = Math.max(0, 1 - (now - b.at) / TTL);

      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.strokeStyle = `rgba(0,200,232,${life * 0.55})`;
      ctx.lineWidth   = life * 2.5 + 0.5;
      ctx.stroke();
    }

    // Glowing tip at cursor position
    const tip     = pts[pts.length - 1];
    const tipLife = Math.max(0, 1 - (now - tip.at) / TTL);
    if (tipLife > 0) {
      const radius = tipLife * 8 + 2;
      const grd = ctx.createRadialGradient(tip.x, tip.y, 0, tip.x, tip.y, radius);
      grd.addColorStop(0,    `rgba(0,230,255,${tipLife * 0.95})`);
      grd.addColorStop(0.45, `rgba(0,200,232,${tipLife * 0.35})`);
      grd.addColorStop(1,    'rgba(0,200,232,0)');
      ctx.beginPath();
      ctx.arc(tip.x, tip.y, radius, 0, Math.PI * 2);
      ctx.fillStyle = grd;
      ctx.fill();
    }

    ctx.restore();
  })();
}

// ── Ambient cursor glow (soft radial follows mouse) ──────────────────────────
export function initCursorGlow(sectionId) {
  if (coarsePointer) return;
  const hero = document.getElementById(sectionId);
  if (!hero) return;

  const blob = document.createElement('div');
  blob.setAttribute('aria-hidden', 'true');
  blob.style.cssText = [
    'position:absolute',
    'width:380px',
    'height:380px',
    'border-radius:50%',
    'pointer-events:none',
    'z-index:1',
    'left:-999px',
    'top:-999px',
    'transform:translate(-50%,-50%)',
    'will-change:left,top',
    'background:radial-gradient(circle,rgba(0,200,232,.09) 0%,transparent 66%)',
  ].join(';');
  hero.appendChild(blob);

  hero.addEventListener('mousemove', e => {
    const r = hero.getBoundingClientRect();
    blob.style.left = (e.clientX - r.left) + 'px';
    blob.style.top  = (e.clientY - r.top)  + 'px';
  }, { passive: true });

  hero.addEventListener('mouseleave', () => {
    blob.style.left = '-999px';
    blob.style.top  = '-999px';
  }, { passive: true });
}
