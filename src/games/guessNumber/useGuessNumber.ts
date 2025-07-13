import { ref, reactive, computed, Ref } from "vue";
import { triggerConfetti, triggerParticles } from "./canvasHelpers";

export function useGuessNumber(particleCanvas: Ref<HTMLCanvasElement | null>) {
  const HOUSE_EDGE = 0.025;
  const balance = ref(100);
  const betAmount = ref(10);
  const history = ref<{ number: number; win: boolean }[]>([]);
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
    const ctx = new (window.AudioContext ||
      (window as any).webkitAudioContext)();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    oscillator.type = type as OscillatorType;
    oscillator.frequency.value = frequency;
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    gainNode.gain.setValueAtTime(0.5, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(
      0.001,
      ctx.currentTime + duration
    );
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
    const clickAudio = document.getElementById(
      "clickSound"
    ) as HTMLAudioElement;
    if (clickAudio) clickAudio.play();
  }

  function playSlideSound() {
    playTone(659.25, 0.05);
    const slideAudio = document.getElementById(
      "slideSound"
    ) as HTMLAudioElement;
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
        condition.value === "less"
          ? sliderValue.value
          : 100 - sliderValue.value;
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
        triggerConfetti();
      } else {
        playLoseSound();
        balance.value -= bet;
        stats.losses++;
        stats.currentStreak = 0;
        resultDisplay.value = `LOSE`;
        if (resultEl) resultEl.classList.add("result-lose");
        if (resultGlow) resultGlow.style.opacity = "0.7";
        triggerParticles();
      }
      stats.totalWagered += bet;
      addToHistory({ number: result, win });
    });
  }

  function addToHistory({ number, win }: { number: number; win: boolean }) {
    history.value.unshift({ number, win });
    if (history.value.length > 7) history.value.pop();
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
    const modal = document.getElementById("statsModal");
    if (modal) modal.classList.remove("hidden");
  }

  function closeStats() {
    const modal = document.getElementById("statsModal");
    if (modal) modal.classList.add("hidden");
  }

  function toggleSound() {
    soundEnabled.value = !soundEnabled.value;
  }

  return {
    HOUSE_EDGE,
    balance,
    betAmount,
    history,
    condition,
    sliderValue,
    isAnimating,
    stats,
    soundEnabled,
    resultDisplay,
    winRate,
    multiplierDisplay,
    multiplierClass,
    playTone,
    playWinSound,
    playLoseSound,
    playClickSound,
    playSlideSound,
    adjustBet,
    validateBetInput,
    updateSliderValue,
    setCondition,
    getRandomNumber,
    showBetError,
    hideBetError,
    animateNumberCycle,
    guessNumber,
    addToHistory,
    updateHistory,
    showStats,
    closeStats,
    toggleSound,
  };
}
