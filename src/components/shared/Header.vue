<template>
  <div
    ref="dropdownRef"
    class="relative w-full flex items-center px-4 shadow-md rounded-2xl text-white py-4 md:bg-black/30 bg-black/0"
  >
    <div class="flex items-center w-[50%] space-x-4">
      <!-- game selector button -->
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

      <!-- how to play button (static color) -->
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

    <div class="flex justify-end items-center w-[50%] space-x-1 text-[12px]">
      <p class="font-mono">{{ balance.toLocaleString() }}</p>
      <p class="opacity-50">USD</p>
      <button
        @click="openMenu"
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

    <!-- Dropdown menu -->
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
        <img :src="game.src" :alt="game.name" class="w-108 h-108 mb-1" />
        <p class="text-[10px] opacity-70 font-extralight truncate">
          {{ game.name }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from "vue";
import { useRouter } from "vue-router";
import { useUserStore } from "@/stores/user";
import { storeToRefs } from "pinia";

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

interface GameType {
  name: string;
  src: string;
  routeName: string;
}

const props = defineProps<{
  theme: {
    btn: string;
  };
}>();
const { theme } = props;

const router = useRouter();
const dropdownOpen = ref(false);
const dropdownRef = ref<HTMLElement | null>(null);

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

function handleClickOutside(event: MouseEvent) {
  if (
    dropdownOpen.value &&
    dropdownRef.value &&
    !dropdownRef.value.contains(event.target as Node)
  ) {
    dropdownOpen.value = false;
  }
}

onMounted(() => {
  document.addEventListener("click", handleClickOutside);
});

onBeforeUnmount(() => {
  document.removeEventListener("click", handleClickOutside);
});

function openHowToPlayModal() {}
function openMenu() {}

function onSelectGame(game: GameType) {
  selectedGame.value = game;
  dropdownOpen.value = false;
  router.push({
    name: "GameView",
    params: { id: game.routeName.toLowerCase() },
  });
}
</script>

<style scoped>
/* no additional custom styles */
</style>
