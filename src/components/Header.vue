<template>
  <div
    ref="dropdownRef"
    class="relative w-full flex items-center px-4 shadow-md rounded-2xl text-white py-4 md:bg-black/30 bg-black/0"
  >
    <div class="flex items-center w-[50%] space-x-4">
      <!-- game selector -->
      <button
        @click="toggleDropdown"
        class="flex items-center justify-center w-[130px] h-[24px] rounded-3xl shadow text-white text-[12px] px-2 transition-transform duration-100 active:translate-y-[2px] shadow-[2px_2px_0_rgba(0,0,0,0.3),inset_2px_2px_0_rgba(255,255,255,0.2)]"
        :style="{ backgroundColor: theme.btn }"
      >
        <span class="flex-1 text-center font-normal truncate">
          {{ selectedGame.name.toUpperCase() }}
        </span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="w-4 h-4 ml-1"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      <!-- how to play -->
      <button
        @click="openHowToPlayModal"
        class="flex items-center justify-center md:w-[150px] h-[22px] rounded-3xl shadow bg-[linear-gradient(to_bottom,_#f9a119,_#f38410)] text-black text-[12px] md:px-2 transition-transform duration-100 active:translate-y-[2px] active:shadow-inner"
      >
        <img
          :src="howTo"
          alt=""
          class="w-[16px] h-[16px] mx-1 md:mr-1 filter brightness-0"
        />
        <span class="hidden md:flex flex-1 text-center truncate">
          HOW TO PLAY?
        </span>
      </button>
    </div>

    <div class="flex justify-end items-center w-[50%] space-x-2 text-[12px]">
      <!-- live cashout label -->
      <p
        v-if="showLiveCash"
        class="bg-[#15902d] text-white font-mono text-[12px] px-2 py-0.5 rounded-xl whitespace-nowrap"
      >
        + {{ liveCash }} USD
      </p>

      <p class="font-mono">{{ balance.toLocaleString() }}</p>
      <p class="opacity-50">USD</p>

      <button
        ref="burgerButtonRef"
        @click="openMenu"
        id="butrger-menu"
        class="p-1 rounded-full w-[24px] h-[24px] transition-transform duration-100 active:translate-y-[2px] shadow-[2px_2px_0_rgba(0,0,0,0.3),inset_2px_2px_0_rgba(255,255,255,0.2)]"
        :style="{ backgroundColor: theme.btn }"
        aria-label="Open menu"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="w-5 h-5"
          fill="none"
          viewBox="0 0 28 28"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M4 6h16M4 12h16M4 18h16"
          />
        </svg>
      </button>
    </div>

    <!-- Game dropdown menu -->
    <div
      v-if="dropdownOpen"
      class="absolute md:top-full top-[-650%] left-1 grid grid-cols-4 gap-1 bg-[#212226] p-4 z-50 rounded-lg"
    >
      <div
        v-for="game in gameIcons"
        :key="game.routeName"
        class="flex flex-col items-center justify-end hover:opacity-80 cursor-pointer mb-2 w-[70px]"
        @click="onSelectGame(game)"
      >
        <SvgIcon
          :src="game.src"
          :is-selected="selectedGame.routeName === game.routeName"
          class="w-9 h-9 mb-1"
        />
        <p
          class="text-[10px] font-[12px] truncate mt-1 transition-all duration-200"
          :class="{
            'font-bold text-[12px]': selectedGame.routeName === game.routeName,
            'text-gray-400 opacity-80':
              selectedGame.routeName !== game.routeName,
          }"
          :style="
            selectedGame.routeName === game.routeName
              ? {
                  color: theme.btn,
                  filter: 'brightness(3) ',
                }
              : {}
          "
        >
          {{ game.name }}
        </p>
      </div>
    </div>

    <!-- ✅ Burger dropdown menu -->
    <div
      ref="menuRef"
      v-if="menuOpen"
      class="absolute right-1 md:top-full top-[-740%] bg-[#1e1f26] text-white rounded-2xl shadow-lg p-4 z-50 h-[250px] w-[300px]"
      style="max-width: 298px; font-size: 13px"
    >
      <div class="flex justify-between items-center mb-3">
        <div class="flex items-center space-x-2">
          <img :src="iconSound" alt="" /><span>Sound</span>
        </div>
        <button
          @click="soundEnabled = !soundEnabled"
          class="w-10 h-6 rounded-full flex items-center p-1 transition-colors duration-300"
          :class="soundEnabled ? 'bg-lime-500' : 'bg-gray-600'"
        >
          <div
            class="bg-white w-4 h-4 rounded-full shadow transform transition-transform duration-300"
            :class="soundEnabled ? 'translate-x-4' : 'translate-x-0'"
          />
        </button>
      </div>

      <div class="text-gray-300 mt-2 space-y-2">
        <p class="hover:text-white opacity-50 cursor-not-allowed">Free Bets</p>
        <p class="hover:text-white opacity-50 cursor-not-allowed">
          Bet History
        </p>
        <p class="hover:text-white opacity-50 cursor-not-allowed">
          Game Limits
        </p>
        <p class="hover:text-white opacity-50 cursor-not-allowed">
          How to Play
        </p>
        <p class="hover:text-white opacity-50 cursor-not-allowed">Game Rules</p>
        <p class="hover:text-white opacity-50 cursor-not-allowed">
          Provably Fair Settings
        </p>
        <p class="hover:text-white opacity-50 cursor-not-allowed">
          Back to Home
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed, onMounted, onBeforeUnmount } from "vue";
import { useRoute } from "vue-router";

const route = useRoute();

import { useRouter } from "vue-router";
import { useUserStore } from "@/stores/user";
import { storeToRefs } from "pinia";
import SvgIcon from "@/components/SvgIcon.vue";

import iconBalloon from "@/assets/gameIcons/icon-balloon.svg";
import iconDice from "@/assets/gameIcons/icon-dice.svg";
import iconGoal from "@/assets/gameIcons/icon-goal.svg";
import iconHiLo from "@/assets/gameIcons/icon-hi-lo.svg";
import iconHotline from "@/assets/gameIcons/icon-hotline.svg";
import iconKeno from "@/assets/gameIcons/icon-keno.svg";
import iconMines from "@/assets/gameIcons/icon-mines.svg";
import iconMiniRoulette from "@/assets/gameIcons/icon-mini-roulette.svg";
import iconPlinko from "@/assets/gameIcons/icon-plinko.svg";
import howTo from "@/assets/icon-how-to-play.svg";
import iconSound from "@/assets/icon-sounds.svg";

import { useMinesUI } from "@/modules/games/mines/store/ui";
import { useMinesRound } from "@/modules/games/mines/store/round";

interface GameType {
  name: string;
  src: string;
  routeName: string;
}

const props = defineProps<{ theme: { btn: string } }>();
const { theme } = props;

const router = useRouter();
const dropdownOpen = ref(false);
const menuOpen = ref(false);
function openMenu() {
  menuOpen.value = !menuOpen.value;
}

const dropdownRef = ref<HTMLElement | null>(null);

const menuRef = ref<HTMLElement | null>(null);
const burgerButtonRef = ref<HTMLElement | null>(null);
const selectedGame = ref<GameType>({
  name: "Mines",
  src: iconMines,
  routeName: "Mines",
});

const gameIcons: GameType[] = [
  { name: "Dice", src: iconDice, routeName: "Dice" },
  { name: "Plinko", src: iconPlinko, routeName: "Plinko" },
  { name: "Goal", src: iconGoal, routeName: "Goal" },
  { name: "Hi-Lo", src: iconHiLo, routeName: "HiLo" },
  { name: "Mines", src: iconMines, routeName: "Mines" },
  { name: "Keno", src: iconKeno, routeName: "Keno" },
  { name: "Mini Roulette", src: iconMiniRoulette, routeName: "miniroulette" },
  { name: "Hotline", src: iconHotline, routeName: "Hotline" },
  { name: "Balloon", src: iconBalloon, routeName: "Balloon" },
];

const userStore = useUserStore();
const { balance } = storeToRefs(userStore);

function toggleDropdown() {
  dropdownOpen.value = !dropdownOpen.value;
}
function handleClickOutside(e: MouseEvent) {
  const target = e.target as Node;

  // close game dropdown
  if (
    dropdownOpen.value &&
    dropdownRef.value &&
    !dropdownRef.value.contains(target)
  ) {
    dropdownOpen.value = false;
  }

  // close burger menu (only if clicked outside both the menu itself and its button)
  if (
    menuOpen.value &&
    menuRef.value &&
    !menuRef.value.contains(target) &&
    burgerButtonRef.value &&
    !burgerButtonRef.value.contains(target)
  ) {
    menuOpen.value = false;
  }
}

onMounted(() => {
  document.addEventListener("click", handleClickOutside);
  initializeSelectedGame();
});
onBeforeUnmount(() =>
  document.removeEventListener("click", handleClickOutside)
);

function openHowToPlayModal() {}
function onSelectGame(game: GameType) {
  selectedGame.value = game;
  dropdownOpen.value = false;
  router.push({
    name: "GameView",
    params: { id: game.routeName.toLowerCase() },
  });
}

// live cashout logic
const ui = useMinesUI();
const round = useMinesRound();
const showLiveCash = ref(false);

const liveCash = computed(() => {
  if (ui.status === "cashoutActive") {
    // preview cash-out
    return (ui.betValue * ui.nextMultiplier).toFixed(2);
  }
  // final win
  return ui.lastWin.toFixed(2);
});
const soundEnabled = ref(localStorage.getItem("soundEnabled") !== "false");
const initializeSelectedGame = () => {
  const gameId = route.params.id?.toString();
  console.log("Current game ID:", gameId); // Debug log

  if (!gameId) {
    selectedGame.value = {
      name: "Mines",
      src: iconMines,
      routeName: "Mines",
    };
    return;
  }

  const currentGame = gameIcons.find(
    (game) => game.routeName.toLowerCase() === gameId.toLowerCase()
  );

  if (currentGame) {
    selectedGame.value = currentGame;
  } else {
    // Fallback to Mines if no match found
    selectedGame.value = {
      name: "Mines",
      src: iconMines,
      routeName: "Mines",
    };
  }
};

watch(soundEnabled, (val) => {
  localStorage.setItem("soundEnabled", String(val));
});
// on manual cash-out
watch(
  () => ui.cashoutTrigger,
  (newVal, oldVal) => {
    if (newVal > oldVal) {
      showLiveCash.value = true;
      setTimeout(() => (showLiveCash.value = false), 2000);
    }
  }
);

// on any round finish with a win (auto or manual)
watch(
  () => round.finished,
  (finished) => {
    if (finished && ui.lastWin > 0) {
      showLiveCash.value = true;
      setTimeout(() => (showLiveCash.value = false), 2000);
    }
  }
);
// Watch for both route name and params changes
watch(
  () => route.params.id,
  (newId) => {
    if (newId) {
      initializeSelectedGame();
    }
  }
);
</script>

<style scoped>
/* no additional custom styles needed */
</style>
