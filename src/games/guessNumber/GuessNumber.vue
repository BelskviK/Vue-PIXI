<template>
  <div class="w-full h-[calc(100vh-64px)] bg-gray-900">
    <!-- Confetti canvas -->
    <canvas
      id="confetti-canvas"
      class="fixed top-0 left-0 w-full h-full pointer-events-none z-50"
      ref="confettiCanvas"
    ></canvas>

    <!-- Particle canvas -->
    <canvas
      id="particle-canvas"
      class="fixed top-0 left-0 w-full h-full pointer-events-none z-40"
      ref="particleCanvas"
    ></canvas>

    <!-- Stats Modal -->
    <div
      id="statsModal"
      class="fixed inset-0 bg-black/70 z-50 hidden items-center justify-center p-4"
    >
      <div class="bg-[#1e293b] rounded-xl p-6 max-w-md w-full">
        <h3 class="text-xl font-bold mb-4">Game Statistics</h3>
        <div class="space-y-3">
          <div class="flex justify-between">
            <span>Wins:</span>
            <span id="statWins">{{ stats.wins }}</span>
          </div>
          <div class="flex justify-between">
            <span>Losses:</span>
            <span id="statLosses">{{ stats.losses }}</span>
          </div>
          <div class="flex justify-between">
            <span>Total Wagered:</span>
            <span id="statWagered">${{ stats.totalWagered.toFixed(2) }}</span>
          </div>
          <div class="flex justify-between">
            <span>Biggest Win:</span>
            <span id="statBigWin">${{ stats.biggestWin.toFixed(2) }}</span>
          </div>
          <div class="flex justify-between">
            <span>Win Rate:</span>
            <span id="statWinRate">{{ winRate }}%</span>
          </div>
        </div>
        <button
          @click="closeStats"
          class="mt-6 w-full py-2 bg-blue-600 rounded-lg hover:bg-blue-700 transition"
        >
          Close
        </button>
      </div>
    </div>

    <div
      class="flex flex-col justify-between min-h-screen relative w-full max-w-md mx-auto"
    >
      <!-- Glow effects -->
      <div class="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          class="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-blue-500/10 blur-3xl animate-pulse"
        ></div>
        <div
          class="absolute bottom-1/4 right-1/4 w-64 h-64 rounded-full bg-purple-500/10 blur-3xl animate-pulse delay-300"
        ></div>
      </div>

      <!-- Header -->
      <header
        class="flex items-center bg-[#14191f] p-4 pb-2 justify-between relative z-10 border-b border-[#2b3540]/50"
      >
        <div class="flex items-center gap-4">
          <button
            @click="showStats"
            class="text-white flex size-12 items-center hover:bg-[#2b3540]/50 rounded-lg transition-all duration-200"
            title="Show Stats"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              fill="currentColor"
              viewBox="0 0 256 256"
            >
              <path
                d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm0,192a88,88,0,1,1,88-88A88.1,88.1,0,0,1,128,216Zm16-40a8,8,0,0,1-8,8,16,16,0,0,1-16-16V128a8,8,0,0,1,0-16,16,16,0,0,1,16,16v40A8,8,0,0,1,144,176ZM112,84a12,12,0,1,1,12,12A12,12,0,0,1,112,84Z"
              ></path>
            </svg>
          </button>
          <button
            id="soundToggle"
            @click="toggleSound"
            class="text-white flex size-12 items-center hover:bg-[#2b3540]/50 rounded-lg transition-all duration-200"
            title="Toggle Sound"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              fill="currentColor"
              viewBox="0 0 256 256"
            >
              <path
                d="M155.51,24.81a8,8,0,0,0-8.42.88L77.25,80H32A16,16,0,0,0,16,96v64a16,16,0,0,0,16,16H77.25l69.84,54.31A8,8,0,0,0,160,224V32A8,8,0,0,0,155.51,24.81ZM32,96H72v64H32Z"
              ></path>
            </svg>
          </button>
        </div>
        <h2
          class="text-lg font-bold text-center left-1/2 transform -translate-x-1/2 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500"
        >
          LAMBADA
        </h2>
        <div class="flex items-center gap-2">
          <div class="flex sm:hidden">
            <div
              id="mobileBalance"
              class="text-white text-sm px-2 py-1 rounded bg-[#2b3540]/50"
            >
              ${{ balance.toFixed(2) }}
            </div>
          </div>
          <div class="hidden sm:flex flex-col items-end">
            <div
              id="balanceDisplay"
              class="text-white text-center rounded-xl h-10 px-3 flex items-center justify-center bg-[#2b3540] text-sm font-medium border border-[#3a4753] shadow-sm"
            >
              ${{ balance.toFixed(2) }}
            </div>
          </div>
        </div>
      </header>

      <!-- Result -->
      <div class="flex-grow flex items-center justify-center relative z-10">
        <div class="relative">
          <h1
            id="result"
            class="text-white text-[clamp(48px,15vw,96px)] font-bold text-center py-6 transition-all duration-300"
          >
            {{ resultDisplay }}
          </h1>
          <div
            id="result-glow"
            class="absolute inset-0 rounded-full opacity-0 blur-xl transition-all duration-500"
          ></div>
        </div>
        <div class="absolute top-0 right-0 w-16">
          <div
            id="history"
            class="flex flex-col items-center gap-3 py-4 relative"
            style="height: 336px"
          ></div>
        </div>
      </div>

      <!-- User Control Panel -->
      <div class="w-full z-10">
        <div class="flex gap-2 sm:gap-4 w-full items-end px-4">
          <label class="flex flex-col flex-1 min-w-0">
            <p class="text-sm font-medium pb-2 truncate text-[#dce7f3]/80">
              Balance
            </p>
            <div
              id="balanceDisplayMobile"
              class="text-white text-center rounded-xl h-14 flex items-center justify-center bg-[#2b3540] truncate px-2 border border-[#3a4753] shadow-sm font-medium"
            >
              ${{ balance.toFixed(2) }}
            </div>
          </label>
          <label class="flex flex-col flex-1 min-w-0 relative">
            <p class="text-sm font-medium pb-2 truncate text-[#dce7f3]/80">
              Bet Amount
            </p>
            <div
              class="flex items-center justify-center bg-[#2b3540] rounded-xl h-14 border border-[#3a4753] shadow-sm"
              id="betWrapper"
            >
              <button
                @click="adjustBet(-1)"
                class="w-8 sm:w-10 h-full text-white text-xl hover:bg-[#3a4753] transition-all duration-200 rounded-l-xl flex items-center justify-center"
              >
                -
              </button>
              <input
                id="betAmount"
                type="number"
                step="0.1"
                min="0.1"
                v-model.number="betAmount"
                @input="validateBetInput"
                @blur="validateBetInput"
                class="w-16 sm:w-20 text-center bg-transparent outline-none text-white border-none ring-0 focus:ring-0 focus:outline-none font-medium"
              />
              <button
                @click="adjustBet(1)"
                class="w-8 sm:w-10 h-full text-white text-xl hover:bg-[#3a4753] transition-all duration-200 rounded-r-xl flex items-center justify-center"
              >
                +
              </button>
            </div>
          </label>
          <label class="flex flex-col flex-1 min-w-0">
            <p class="text-sm font-medium pb-2 truncate text-[#dce7f3]/80">
              Multiplier (x)
            </p>
            <div
              id="multiplierDisplay"
              :class="multiplierClass"
              class="text-white text-center rounded-xl h-14 flex items-center justify-center bg-[#2b3540] truncate px-2 border border-[#3a4753] shadow-sm font-medium"
            >
              {{ multiplierDisplay }}
            </div>
          </label>
        </div>
        <div class="@container">
          <div
            class="relative flex w-full flex-col items-start justify-between gap-3 p-4 @[480px]:flex-row @[480px]:items-center"
          >
            <div class="flex w-full items-center justify-between">
              <p class="text-sm font-medium text-[#dce7f3]/80">Adjust Bet</p>
              <div
                class="text-white text-center mb-4 px-2 whitespace-nowrap text-sm font-medium"
                id="sidebarSliderValue"
              >
                Number: {{ sliderValue }}
              </div>
              <p
                class="text-sm hidden @[480px]:block font-medium"
                id="sliderValue"
              >
                {{ sliderValue }}
              </p>
            </div>
            <input
              id="slider"
              type="range"
              min="1"
              max="99"
              v-model.number="sliderValue"
              @input="updateSliderValue(sliderValue)"
              class="w-full"
            />
          </div>
        </div>
        <div
          class="flex flex-1 gap-2 sm:gap-4 flex-row px-4 py-3 justify-center"
        >
          <button
            @click="setCondition('less')"
            :class="[
              'min-w-[84px] w-full h-12 px-2 sm:px-6 justify-center rounded-full bg-[#2b3540] text-white font-extrabold hover:bg-[#3a4753] transition-all duration-200 border border-[#3a4753] shadow-sm hover:shadow-md hover:shadow-blue-500/20 active:scale-95',
              condition === 'less' ? 'btn-selected' : '',
            ]"
            id="btnLess"
          >
            Less
          </button>
          <button
            @click="setCondition('greater')"
            :class="[
              'min-w-[84px] w-full h-12 px-2 sm:px-6 justify-center rounded-full bg-[#2b3540] text-white font-extrabold hover:bg-[#3a4753] transition-all duration-200 border border-[#3a4753] shadow-sm hover:shadow-md hover:shadow-purple-500/20 active:scale-95',
              condition === 'greater' ? 'btn-selected' : '',
            ]"
            id="btnMore"
          >
            More
          </button>
        </div>
        <div class="flex flex-1 px-4 py-3">
          <button
            id="btnGuess"
            @click="guessNumber"
            :disabled="!condition || isAnimating"
            class="w-full h-14 px-6 justify-center rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 text-white font-extrabold hover:shadow-lg hover:shadow-blue-500/30 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
          >
            GUESS
          </button>
        </div>
        <div class="h-5"></div>
      </div>
    </div>
    <!-- Audio elements -->
    <audio
      id="winSound"
      src="https://assets.mixkit.co/sfx/preview/mixkit-winning-chimes-2015.mp3"
      preload="auto"
    ></audio>
    <audio
      id="loseSound"
      src="https://assets.mixkit.co/sfx/preview/mixkit-arcade-retro-game-over-213.mp3"
      preload="auto"
    ></audio>
    <audio
      id="clickSound"
      src="https://assets.mixkit.co/sfx/preview/mixkit-modern-click-box-check-1120.mp3"
      preload="auto"
    ></audio>
    <audio
      id="slideSound"
      src="https://assets.mixkit.co/sfx/preview/mixkit-arcade-game-jump-coin-216.mp3"
      preload="auto"
    ></audio>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from "vue";
import confetti from "canvas-confetti";

const HOUSE_EDGE = 0.025;
const balance = ref(100);
interface BetAmountRef {
  value: number;
}
const betAmount: BetAmountRef = ref(10);
type HistoryItem = { number: number; win: boolean };
const history = ref<HistoryItem[]>([]);
const condition = ref<string | null>(null);
const sliderValue = ref(50);
const isAnimating = ref(false);
const stats = reactive({
  wins: 0,
  losses: 0,
  totalWagered: 0,
  biggestWin: 0,
  currentStreak: 0,
  maxStreak: 0,
});
const soundEnabled = ref(true);

const confettiCanvas = ref<HTMLCanvasElement | null>(null);
const particleCanvas = ref<HTMLCanvasElement | null>(null);

const resultDisplay = ref("?");
const winRate = computed(() =>
  stats.wins + stats.losses > 0
    ? ((stats.wins / (stats.wins + stats.losses)) * 100).toFixed(1)
    : "0"
);

const multiplierDisplay = computed(() => {
  if (!condition.value) return "-";
  let chance =
    condition.value === "less" ? sliderValue.value : 100 - sliderValue.value;
  if (chance < 1) chance = 1;
  const rawMultiplier = 100 / chance;
  let adjusted = rawMultiplier * (1 - HOUSE_EDGE);
  adjusted = Math.max(1, adjusted);
  return `${adjusted.toFixed(2)}x`;
});

const multiplierClass = computed(() => {
  if (!condition.value) return "";
  let chance =
    condition.value === "less" ? sliderValue.value : 100 - sliderValue.value;
  if (chance < 1) chance = 1;
  const rawMultiplier = 100 / chance;
  let adjusted = rawMultiplier * (1 - HOUSE_EDGE);
  if (adjusted >= 5) return "text-red-500";
  if (adjusted >= 2) return "text-yellow-500";
  return "text-green-500";
});

function playTone(frequency: number, duration: number, type = "sine") {
  if (!soundEnabled.value) return;
  const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
  const oscillator = ctx.createOscillator();
  const gainNode = ctx.createGain();
  oscillator.type = type as OscillatorType;
  oscillator.frequency.value = frequency;
  oscillator.connect(gainNode);
  gainNode.connect(ctx.destination);
  gainNode.gain.setValueAtTime(0.5, ctx.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
  oscillator.start();
  oscillator.stop(ctx.currentTime + duration);
}

function playWinSound() {
  playTone(880, 0.5);
  setTimeout(() => playTone(1318.51, 0.5), 200);
  const winAudio = document.getElementById("winSound") as HTMLAudioElement;
  if (winAudio) winAudio.play();
}

function playLoseSound() {
  playTone(220, 1.5, "square");
  const loseAudio = document.getElementById("loseSound") as HTMLAudioElement;
  if (loseAudio) loseAudio.play();
}

function playClickSound() {
  playTone(523.25, 0.1);
  const clickAudio = document.getElementById("clickSound") as HTMLAudioElement;
  if (clickAudio) clickAudio.play();
}

function playSlideSound() {
  playTone(659.25, 0.05);
  const slideAudio = document.getElementById("slideSound") as HTMLAudioElement;
  if (slideAudio) slideAudio.play();
}

function adjustBet(delta: number) {
  playClickSound();
  let value = betAmount.value || 0;
  value = Math.max(0.1, value + delta * 0.1);
  value = Math.round(value * 10) / 10;
  betAmount.value = value;
}

function validateBetInput() {
  let value = betAmount.value || 0;
  value = Math.max(0.1, Math.min(balance.value, value));
  value = Math.round(value * 10) / 10;
  betAmount.value = value;
}

function updateSliderValue(val: number) {
  playSlideSound();
  sliderValue.value = val;
}

function setCondition(newCondition: string) {
  playClickSound();
  condition.value = newCondition;
}

function getRandomNumber() {
  return Math.floor(Math.random() * 99) + 1;
}

function showBetError() {
  const betWrapper = document.getElementById("betWrapper");
  if (betWrapper) {
    betWrapper.classList.add("border-red-500", "shake-animation");
    setTimeout(() => {
      betWrapper.classList.remove("shake-animation");
    }, 500);
  }
}

function hideBetError() {
  const betWrapper = document.getElementById("betWrapper");
  if (betWrapper) {
    betWrapper.classList.remove("border-red-500");
  }
}

function animateNumberCycle(finalNumber: number, callback: () => void) {
  isAnimating.value = true;
  resultDisplay.value = "?";
  const resultEl = document.getElementById("result");
  const resultGlow = document.getElementById("result-glow");

  if (resultEl) {
    resultEl.classList.remove(
      "text-green-500",
      "text-red-600",
      "number-cycle",
      "result-win",
      "result-lose"
    );
  }
  if (resultGlow) {
    resultGlow.style.opacity = "0";
  }

  // Disable all buttons during animation
  const btnGuess = document.getElementById("btnGuess") as HTMLButtonElement;
  const btnLess = document.getElementById("btnLess") as HTMLButtonElement;
  const btnMore = document.getElementById("btnMore") as HTMLButtonElement;
  const slider = document.getElementById("slider") as HTMLInputElement;
  if (btnGuess) btnGuess.disabled = true;
  if (btnLess) btnLess.disabled = true;
  if (btnMore) btnMore.disabled = true;
  if (slider) slider.disabled = true;

  let count = 0;
  const totalCycles = 15 + Math.floor(Math.random() * 10); // 15-24 cycles
  const startTime = Date.now();
  const duration = 1500 + Math.random() * 500; // 1.5-2 seconds total

  function updateNumber() {
    if (!isAnimating.value) return;

    const elapsed = Date.now() - startTime;
    const progress = elapsed / duration;

    if (progress >= 1) {
      // Final number
      resultDisplay.value = finalNumber.toString();
      if (resultEl) {
        resultEl.classList.add("number-cycle");
      }
      if (resultGlow) {
        resultGlow.style.opacity = "0.7";
      }
      isAnimating.value = false;
      // Re-enable buttons
      if (btnGuess) btnGuess.disabled = false;
      if (btnLess) btnLess.disabled = false;
      if (btnMore) btnMore.disabled = false;
      if (slider) slider.disabled = false;
      callback();
      return;
    }

    // Slow down as we approach the end
    if (count < totalCycles) {
      const randomNum = Math.floor(Math.random() * 99) + 1;
      resultDisplay.value = randomNum.toString();
      if (resultEl) {
        resultEl.classList.add("number-cycle");
        setTimeout(() => {
          resultEl.classList.remove("number-cycle");
        }, 100);
      }
      count++;

      // Gradually slow down the animation
      let delay;
      if (count < totalCycles * 0.3) {
        delay = 50 + Math.random() * 50; // Fast at first (50-100ms)
      } else if (count < totalCycles * 0.7) {
        delay = 100 + Math.random() * 100; // Then medium speed (100-200ms)
      } else {
        delay = 150 + Math.random() * 150; // Then slower (150-300ms)
      }

      setTimeout(updateNumber, delay);
    } else {
      // Show the final number with animation
      resultDisplay.value = finalNumber.toString();
      if (resultEl) {
        resultEl.classList.add("number-cycle");
      }
      if (resultGlow) {
        resultGlow.style.opacity = "0.7";
      }
      isAnimating.value = false;
      // Re-enable buttons
      if (btnGuess) btnGuess.disabled = false;
      if (btnLess) btnLess.disabled = false;
      if (btnMore) btnMore.disabled = false;
      if (slider) slider.disabled = false;
      callback();
    }
  }

  updateNumber();
}
function guessNumber() {
  if (isAnimating.value) return;
  playClickSound();
  let bet = betAmount.value;
  if (isNaN(bet)) return;
  if (bet > balance.value) {
    bet = balance.value;
    betAmount.value = balance.value;
    showBetError();
    return;
  }
  hideBetError();
  const result = getRandomNumber();
  animateNumberCycle(result, () => {
    let win = false;
    let chance =
      condition.value === "less" ? sliderValue.value : 100 - sliderValue.value;
    const resultEl = document.getElementById("result");
    const resultGlow = document.getElementById("result-glow");
    // Remove previous win/lose classes
    if (resultEl) {
      resultEl.classList.remove("result-win", "result-lose");
    }
    if (
      (condition.value === "less" && result < sliderValue.value) ||
      (condition.value === "greater" && result > sliderValue.value)
    ) {
      win = true;
      playWinSound();
      const rawMultiplier = 100 / chance;
      let adjusted = rawMultiplier * (1 - HOUSE_EDGE);
      adjusted = Math.max(1, adjusted);
      const winAmount = bet * adjusted;
      balance.value += winAmount;
      stats.wins++;
      stats.currentStreak++;
      stats.maxStreak = Math.max(stats.maxStreak, stats.currentStreak);
      stats.biggestWin = Math.max(stats.biggestWin, winAmount);
      resultDisplay.value = `WIN $${winAmount.toFixed(2)}`;
      if (resultEl) resultEl.classList.add("result-win");
      if (resultGlow) resultGlow.style.opacity = "0.7";
      triggerConfetti(); // <-- UNCOMMENT THIS
    } else {
      playLoseSound();
      balance.value -= bet;
      stats.losses++;
      stats.currentStreak = 0;
      resultDisplay.value = `LOSE`;
      if (resultEl) resultEl.classList.add("result-lose");
      if (resultGlow) resultGlow.style.opacity = "0.7";
      triggerParticles(); // <-- UNCOMMENT THIS
    }
    stats.totalWagered += bet;
    addToHistory({ number: result, win });
  });
}

function addToHistory({ number, win }: { number: number; win: boolean }) {
  history.value.unshift({ number, win });
  if (history.value.length > 7) history.value.pop();
  // For now, update DOM directly for history
  updateHistory();
}

function updateHistory() {
  const container = document.getElementById("history");
  if (!container) return;
  container.innerHTML = "";
  history.value.forEach((item) => {
    const entry = document.createElement("div");
    entry.className =
      "history-item rounded-full w-10 h-10 flex items-center justify-center font-bold text-white";
    entry.textContent = item.number.toString();
    if (item.win) {
      entry.classList.add("win-glow", "bg-green-500");
    } else {
      entry.classList.add("bg-red-600");
    }
    container.appendChild(entry);
  });
}

function showStats() {
  updateStatsDisplay();
  const modal = document.getElementById("statsModal");
  if (modal) modal.classList.remove("hidden");
}

function closeStats() {
  const modal = document.getElementById("statsModal");
  if (modal) modal.classList.add("hidden");
}

function updateStatsDisplay() {
  // Stats are reactive, so Vue will update them automatically
}

function toggleSound() {
  soundEnabled.value = !soundEnabled.value;
}

function triggerConfetti() {
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
function triggerParticles() {
  const canvas = particleCanvas.value;
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

onMounted(() => {
  function resizeCanvases() {
    if (confettiCanvas.value) {
      confettiCanvas.value.width = window.innerWidth;
      confettiCanvas.value.height = window.innerHeight;
    }
    if (particleCanvas.value) {
      particleCanvas.value.width = window.innerWidth;
      particleCanvas.value.height = window.innerHeight;
    }
  }
  resizeCanvases();
  window.addEventListener("resize", resizeCanvases);
});
</script>

<style>
/* Paste styles.css content here */
body {
  font-family: "Space Grotesk", "Noto Sans", sans-serif;
}

input[type="range"] {
  appearance: none;
  -webkit-appearance: none;
  width: 100%;
  height: 8px;
  background: #2b3540;
  border-radius: 4px;
  outline: none;
  border: 1px solid #3a4753;
}

input[type="range"]::-webkit-slider-thumb {
  -webkit-appearance: none;
  height: 24px;
  width: 24px;
  border-radius: 50%;
  background: linear-gradient(135deg, #3b82f6, #8b5cf6);
  cursor: pointer;
  border: 2px solid #dce7f3;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

input[type="range"]::-webkit-slider-thumb:hover {
  transform: scale(1.1);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
}

input[type="range"]::-moz-range-thumb {
  height: 24px;
  width: 24px;
  border-radius: 50%;
  background: linear-gradient(135deg, #3b82f6, #8b5cf6);
  cursor: pointer;
  border: 2px solid #dce7f3;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

input[type="range"]::-moz-range-thumb:hover {
  transform: scale(1.1);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
}

.btn-selected {
  background: linear-gradient(135deg, #3b82f6, #8b5cf6) !important;
  color: white !important;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3) !important;
  border: none !important;
}

@keyframes numberCycle {
  0% {
    transform: scale(0.8);
    opacity: 0;
  }
  50% {
    transform: scale(1.1);
    opacity: 1;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

.number-cycle {
  animation: numberCycle 0.1s ease-out;
}

/* Hide arrows for input type number (Chrome, Safari, Edge) */
input[type="number"]::-webkit-outer-spin-button,
input[type="number"]::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

/* Hide arrows for Firefox */
input[type="number"] {
  appearance: textfield;
  -moz-appearance: textfield;
}

@keyframes slideIn {
  0% {
    opacity: 0;
    transform: translateY(-48px) scale(0.9);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}
#history {
  height: 336px; /* 7 items * 48px each */
  overflow: hidden; /* Hide items that are moving out */
}

.history-item {
  animation: slideIn 0.3s ease-out forwards;
  transition: all 0.3s ease;
  will-change: transform, opacity;
  margin-bottom: 8px; /* Add gap between items */
}

@keyframes pulseGlow {
  0% {
    box-shadow: 0 0 10px rgba(74, 222, 128, 0.5);
  }
  50% {
    box-shadow: 0 0 20px rgba(74, 222, 128, 0.8);
  }
  100% {
    box-shadow: 0 0 10px rgba(74, 222, 128, 0.5);
  }
}

.win-glow {
  animation: pulseGlow 1.5s ease-in-out infinite;
}

@keyframes shake {
  0%,
  100% {
    transform: translateX(0);
  }
  10%,
  30%,
  50%,
  70%,
  90% {
    transform: translateX(-5px);
  }
  20%,
  40%,
  60%,
  80% {
    transform: translateX(5px);
  }
}

.shake-animation {
  animation: shake 0.5s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
}

@keyframes float {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

.float-animation {
  animation: float 3s ease-in-out infinite;
}

.result-win {
  text-shadow: 0 0 10px rgba(74, 222, 128, 0.7);
}

.result-lose {
  text-shadow: 0 0 10px rgba(239, 68, 68, 0.7);
}

/* Stats modal animation */
@keyframes modalFadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

#statsModal > div {
  animation: modalFadeIn 0.3s ease-out forwards;
}

/* Responsive adjustments */
@media (max-width: 480px) {
  #history {
    height: 280px;
  }

  .history-item {
    margin-bottom: 6px; /* Reduce gap between items */
  }
}

canvas#confetti-canvas,
canvas#particle-canvas {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw !important;
  height: 100vh !important;
  pointer-events: none;
  z-index: 9999;
}
</style>
