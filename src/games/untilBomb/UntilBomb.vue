<template>
  <div class="w-full h-[calc(100vh-64px)] bg-gray-900 relative">
    <GameHeader :title="'Until Bomb'" />
    <div
      id="ui"
      class="absolute top-3 left-3 right-3 max-w-[480px] mx-auto z-10"
    >
      <div class="row flex justify-between items-center mb-2">
        <label
          >💰 Balance: <span>{{ balance }}</span> $</label
        >
      </div>
      <div class="row flex justify-between items-center mb-2">
        <label>
          🎯 Bet:
          <input
            v-model.number="bet"
            type="number"
            min="1"
            :max="balance"
            class="bg-[#2b3540] text-white border border-[#3a4753] px-3 py-2 rounded w-20"
          />
        </label>
        <button
          @click="startGame"
          :disabled="gameStarted || bet <= 0 || bet > balance"
          class="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-2 rounded font-bold shadow hover:scale-105 transition"
        >
          🎲 Start Game
        </button>
      </div>
      <div class="row flex justify-between items-center">
        🚀 Multiplier: <span>{{ multiplier.toFixed(2) }}x</span>
      </div>
    </div>
    <div ref="pixiContainer" class="w-full h-full"></div>
    <div
      v-if="resultMessage"
      class="fixed top-1/2 left-1/2 text-4xl font-bold"
      :style="resultStyle"
    >
      {{ resultMessage }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, CSSProperties } from "vue";
import { Application, Container, Graphics, Text, BlurFilter } from "pixi.js";
import GameHeader from "../../components/GameHeader.vue";

// --- Custom Card Class ---
class CardGraphics extends Graphics {
  index: number;
  isFlipped: boolean;
  label: Text;

  constructor(
    index: number,
    x: number,
    y: number,
    size: number,
    onFlip: (card: CardGraphics) => void
  ) {
    super();
    this.index = index;
    this.isFlipped = false;
    this.x = x;
    this.y = y;
    this.interactive = true;
    this.cursor = "pointer";
    this.label = new Text("?", {
      fontFamily: "Arial",
      fontSize: 32,
      fill: 0xffffff,
      align: "center",
    });
    this.label.anchor.set(0.5);
    this.label.x = size / 2;
    this.label.y = size / 2;
    this.beginFill(0x2196f3);
    this.drawRoundedRect(0, 0, size, size, 10);
    this.endFill();
    this.addChild(this.label);
    this.on("pointertap", () => onFlip(this));
  }
}

type ParticlesType = Array<{
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  color: string;
  alpha: number;
  decay: number;
}> & {
  canvas?: HTMLCanvasElement;
  ctx?: CanvasRenderingContext2D | null;
  animating?: boolean;
};

const pixiContainer = ref<HTMLDivElement | null>(null);
let app: Application | null = null;
let board: Container | null = null;
let particles = [] as ParticlesType;

const gridSize = 5;
const spacing = 10;
const cardSize = Math.min(window.innerWidth, window.innerHeight) / 7;

const balance = ref(1000);
const bet = ref(50);
const multiplier = ref(1);
const flippedCount = ref(0);
const gameStarted = ref(false);
const resultMessage = ref("");
const resultStyle = ref<CSSProperties>({});

let bombIndex = -1;
let cards: CardGraphics[] = [];

function showResultMessage(message: string, color: string) {
  resultMessage.value = message;
  resultStyle.value = {
    color,
    textShadow: `0 0 20px ${color}`,
    transform: "translate(-50%, -50%) scale(1.2)",
    opacity: "1",
    zIndex: "1000",
    pointerEvents: "none",
    left: "50%",
    top: "50%",
    position: "fixed",
  };
  setTimeout(() => {
    resultStyle.value = {
      ...resultStyle.value,
      opacity: "0",
      transform: "translate(-50%, -50%) scale(0.8)",
    };
    setTimeout(() => {
      resultMessage.value = "";
    }, 500);
  }, 2000);
}

function createParticles(x: number, y: number, color: string, count = 30) {
  if (!particles || !particles.ctx || !particles.canvas) return;
  for (let i = 0; i < count; i++) {
    particles.push({
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
  if (!particles.animating) {
    particles.animating = true;
    animateParticles();
  }
}

function animateParticles() {
  if (!particles.ctx || !particles.canvas) return;
  particles.ctx.clearRect(
    0,
    0,
    particles.canvas.width,
    particles.canvas.height
  );
  let aliveParticles = 0;
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.x += p.speedX;
    p.y += p.speedY;
    p.speedY += 0.1;
    p.alpha -= p.decay;
    if (p.y < particles.canvas.height && p.alpha > 0) {
      aliveParticles++;
      particles.ctx.globalAlpha = p.alpha;
      particles.ctx.beginPath();
      particles.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      particles.ctx.fillStyle = p.color;
      particles.ctx.fill();
    } else {
      particles.splice(i, 1);
    }
  }
  if (aliveParticles > 0) {
    requestAnimationFrame(animateParticles);
  } else {
    particles.animating = false;
  }
}

function resetBoard(app: Application, blurred = false) {
  if (!board) {
    board = new Container();
    app.stage.addChild(board);
  }
  board.removeChildren();
  cards = [];
  bombIndex = Math.floor(Math.random() * gridSize ** 2);
  const totalSize = gridSize * cardSize + (gridSize - 1) * spacing;
  const startX = (app.screen.width - totalSize) / 2;
  const startY = (app.screen.height - totalSize) / 2;
  for (let i = 0; i < gridSize ** 2; i++) {
    const row = Math.floor(i / gridSize);
    const col = i % gridSize;
    const x = startX + col * (cardSize + spacing);
    const y = startY + row * (cardSize + spacing);
    const card = new CardGraphics(i, x, y, cardSize, flipCard);
    board.addChild(card); // No type error: CardGraphics extends Graphics
    cards.push(card);
  }
  if (blurred) {
    const blurFilter = new BlurFilter();
    blurFilter.blur = 3;
    board.filters = [blurFilter];
    board.alpha = 0.3;
  } else {
    board.filters = [];
    board.alpha = 1;
  }
}

function flipCard(card: CardGraphics) {
  if (card.isFlipped || !gameStarted.value) return;
  card.isFlipped = true;
  card.interactive = false;
  if (card.index === bombIndex) {
    revealBomb(card);
    endGame(false);
  } else {
    flippedCount.value++;
    multiplier.value += 0.25;
    revealSafe(card, multiplier.value);
    createParticles(card.x + cardSize / 2, card.y + cardSize / 2, "#4CAF50");
    if (flippedCount.value === gridSize ** 2 - 1) {
      endGame(true);
    }
  }
}

function revealBomb(card: CardGraphics) {
  card.label.text = "💣";
  card.label.style.fill = 0xff0000;
  card.tint = 0xff5252;
  shake(card);
}

function revealSafe(card: CardGraphics, mult: number) {
  card.label.text = `${mult.toFixed(2)}x`;
  card.label.style.fill = 0xffffff;
  card.tint = 0x4caf50;
  pulse(card);
}

function shake(card: CardGraphics) {
  const startTime = Date.now();
  const duration = 500;
  const origX = card.x,
    origY = card.y;
  function animate() {
    const elapsed = Date.now() - startTime;
    if (elapsed >= duration) {
      card.position.set(origX, origY);
      return;
    }
    const progress = elapsed / duration;
    const shakeIntensity = 10 * (1 - progress);
    const offsetX = Math.sin(progress * 20) * shakeIntensity;
    const offsetY = Math.cos(progress * 20) * shakeIntensity;
    card.position.set(origX + offsetX, origY + offsetY);
    requestAnimationFrame(animate);
  }
  animate();
}

function pulse(card: CardGraphics) {
  const startScale = card.scale.x;
  const targetScale = 1.2;
  const duration = 300;
  const startTime = Date.now();
  function animate() {
    const elapsed = Date.now() - startTime;
    if (elapsed >= duration) {
      card.scale.set(1, 1);
      return;
    }
    const progress = elapsed / duration;
    const scaleProgress =
      progress < 0.5 ? progress * 2 : 1 - (progress - 0.5) * 2;
    const currentScale =
      startScale + (targetScale - startScale) * scaleProgress;
    card.scale.set(currentScale, currentScale);
    requestAnimationFrame(animate);
  }
  animate();
}

function startGame() {
  if (gameStarted.value || bet.value <= 0 || bet.value > balance.value) return;
  balance.value -= bet.value;
  multiplier.value = 1;
  flippedCount.value = 0;
  gameStarted.value = true;
  resetBoard(app!, false);
}

function endGame(won: boolean) {
  gameStarted.value = false;
  if (won) {
    const winnings = Math.floor(bet.value * multiplier.value);
    balance.value += winnings;
    for (let i = 0; i < 100; i++) {
      const x = Math.random() * app!.screen.width;
      const y = Math.random() * app!.screen.height;
      createParticles(x, y, "#4CAF50", 5);
    }
    showResultMessage("🎉 You Win!", "#4CAF50");
  } else {
    const bombCard = cards[bombIndex];
    createParticles(
      bombCard.x + cardSize / 2,
      bombCard.y + cardSize / 2,
      "#FF5252",
      50
    );
    showResultMessage("💥 Bomb Exploded!", "#FF5252");
  }
  setTimeout(() => {
    resetBoard(app!, true);
  }, 2200);
}

onMounted(async () => {
  if (!pixiContainer.value) return;
  app = new Application({
    backgroundColor: 0x222222,
    resizeTo: pixiContainer.value,
  });
  await app.init();
  pixiContainer.value.appendChild(app.canvas);

  particles = [] as ParticlesType;
  particles.canvas = document.createElement("canvas");
  particles.ctx = particles.canvas.getContext("2d");
  particles.canvas.style.position = "absolute";
  particles.canvas.style.top = "0";
  particles.canvas.style.left = "0";
  particles.canvas.style.pointerEvents = "none";
  particles.canvas.style.zIndex = "100";
  pixiContainer.value.appendChild(particles.canvas);

  function resizeParticles() {
    if (particles.canvas && pixiContainer.value) {
      particles.canvas.width = pixiContainer.value.offsetWidth;
      particles.canvas.height = pixiContainer.value.offsetHeight;
    }
  }
  resizeParticles();
  window.addEventListener("resize", resizeParticles);

  resetBoard(app, true);
});

onBeforeUnmount(() => {
  if (app) {
    app.destroy(true, { children: true, texture: true });
    app = null;
  }
});
</script>

<style scoped>
#ui {
  background: rgba(20, 24, 37, 0.9);
  padding: 16px;
  border-radius: 12px;
  box-shadow: 0 4px 30px rgba(0, 0, 0, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.05);
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
@media (max-width: 600px) {
  #ui {
    font-size: 14px;
    padding: 12px;
  }
  input[type="number"] {
    width: 60px;
  }
  button {
    padding: 8px 12px;
    font-size: 14px;
  }
}
</style>
