import confetti from "canvas-confetti";

export function triggerConfetti() {
  confetti({
    particleCount: 200,
    spread: 70,
    origin: { y: 0.7 },
    colors: ["#3b82f6", "#8b5cf6", "#ec4899", "#10b981"],
    ticks: 100,
    gravity: 1.5,
    decay: 0.94,
    startVelocity: 30,
  });
}
export function triggerParticles() {
  const particleCanvas = document.getElementById(
    "particleCanvas"
  ) as HTMLCanvasElement | null;
  const canvas = particleCanvas;
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  // ✅ Fix for TypeScript: assert ctx and canvas are not null
  const safeCanvas = canvas as HTMLCanvasElement;
  const safeCtx = ctx as CanvasRenderingContext2D;

  type Particle = {
    x: number;
    y: number;
    vx: number;
    vy: number;
    radius: number;
    alpha: number;
    color: string;
  };

  const particles: Particle[] = [];
  const particleCount = 100;
  for (let i = 0; i < particleCount; i++) {
    particles.push({
      x: safeCanvas.width / 2,
      y: safeCanvas.height / 2,
      vx: (Math.random() - 0.5) * 8,
      vy: (Math.random() - 0.5) * 8,
      radius: Math.random() * 4 + 2,
      alpha: 1,
      color: "#ef4444",
    });
  }

  function animateParticles() {
    safeCtx.clearRect(0, 0, safeCanvas.width, safeCanvas.height);
    let alive = false;
    for (const p of particles) {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.2;
      p.alpha -= 0.02;
      if (p.alpha > 0) alive = true;
      safeCtx.globalAlpha = Math.max(p.alpha, 0);
      safeCtx.beginPath();
      safeCtx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      safeCtx.fillStyle = p.color;
      safeCtx.fill();
    }
    safeCtx.globalAlpha = 1;
    if (alive) {
      requestAnimationFrame(animateParticles);
    } else {
      safeCtx.clearRect(0, 0, safeCanvas.width, safeCanvas.height);
    }
  }

  animateParticles();
}
