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
import { Application } from "pixi.js";
import GameHeader from "../../components/GameHeader.vue";
import { CardGraphics } from "./engine/CardGraphics";
import { Board } from "./engine/Board";
import { ParticleSystem } from "./engine/ParticleSystem";

const pixiContainer = ref<HTMLDivElement | null>(null);
let app: Application | null = null;
let board: Board | null = null;
let particles: ParticleSystem | null = null;

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

function flipCard(card: CardGraphics) {
  if (card.isFlipped || !gameStarted.value || !board) return;
  card.isFlipped = true;
  card.interactive = false;
  if (card.index === board.bombIndex) {
    card.revealBomb();
    endGame(false);
  } else {
    flippedCount.value++;
    multiplier.value += 0.25;
    card.revealSafe(multiplier.value);
    particles?.createParticles(
      card.x + cardSize / 2,
      card.y + cardSize / 2,
      "#4CAF50"
    );
    if (flippedCount.value === gridSize ** 2 - 1) {
      endGame(true);
    }
  }
}

function startGame() {
  if (gameStarted.value || bet.value <= 0 || bet.value > balance.value) return;
  balance.value -= bet.value;
  multiplier.value = 1;
  flippedCount.value = 0;
  gameStarted.value = true;
  board?.generate(false);
}

function endGame(won: boolean) {
  gameStarted.value = false;
  if (!board) return;
  if (won) {
    const winnings = Math.floor(bet.value * multiplier.value);
    balance.value += winnings;
    for (let i = 0; i < 100; i++) {
      const x = Math.random() * app!.screen.width;
      const y = Math.random() * app!.screen.height;
      particles?.createParticles(x, y, "#4CAF50", 5);
    }
    showResultMessage("🎉 You Win!", "#4CAF50");
  } else {
    const bombCard = board.cards[board.bombIndex];
    particles?.createParticles(
      bombCard.x + cardSize / 2,
      bombCard.y + cardSize / 2,
      "#FF5252",
      50
    );
    showResultMessage("💥 Bomb Exploded!", "#FF5252");
  }
  setTimeout(() => {
    board?.generate(true);
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

  particles = new ParticleSystem(pixiContainer.value);

  board = new Board(app, gridSize, spacing, cardSize, flipCard);
  board.generate(true);
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
