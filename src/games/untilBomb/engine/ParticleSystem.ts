export type Particle = {
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  color: string;
  alpha: number;
  decay: number;
};

export class ParticleSystem {
  particles: Particle[] = [];
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D | null;
  animating = false;

  constructor(parent: HTMLElement) {
    this.canvas = document.createElement("canvas");
    this.ctx = this.canvas.getContext("2d");
    this.canvas.style.position = "absolute";
    this.canvas.style.top = "0";
    this.canvas.style.left = "0";
    this.canvas.style.pointerEvents = "none";
    this.canvas.style.zIndex = "100";
    parent.appendChild(this.canvas);
    this.resize(parent.offsetWidth, parent.offsetHeight);
    window.addEventListener("resize", () =>
      this.resize(parent.offsetWidth, parent.offsetHeight)
    );
  }

  resize(width: number, height: number) {
    this.canvas.width = width;
    this.canvas.height = height;
  }

  createParticles(x: number, y: number, color: string, count = 30) {
    for (let i = 0; i < count; i++) {
      this.particles.push({
        x,
        y,
        size: Math.random() * 5 + 2,
        speedX: Math.random() * 6 - 3,
        speedY: Math.random() * -10 - 5,
        color: color || `hsl(${Math.random() * 60 + 10}, 100%, 50%)`,
        alpha: 1,
        decay: Math.random() * 0.02 + 0.01,
      });
    }
    if (!this.animating) {
      this.animating = true;
      this.animateParticles();
    }
  }

  animateParticles() {
    if (!this.ctx) return;
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    let aliveParticles = 0;
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.speedX;
      p.y += p.speedY;
      p.speedY += 0.1;
      p.alpha -= p.decay;
      if (p.y < this.canvas.height && p.alpha > 0) {
        aliveParticles++;
        this.ctx.globalAlpha = p.alpha;
        this.ctx.beginPath();
        this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        this.ctx.fillStyle = p.color;
        this.ctx.fill();
      } else {
        this.particles.splice(i, 1);
      }
    }
    if (aliveParticles > 0) {
      requestAnimationFrame(() => this.animateParticles());
    } else {
      this.animating = false;
    }
  }
}
