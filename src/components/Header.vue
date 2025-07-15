<!-- src/components/Header.vue -->
<template>
  <div
    class="relative w-full h-9 bg-gradient-to-r from-[#055a8e] to-[#00329a] flex items-center px-4 shadow-md rounded-2xl text-white py-4"
  >
    <div class="flex items-center w-[50%] space-x-7">
      <!-- game selector button -->
      <button
        @click="toggleDropdown"
        class="flex items-center justify-center w-[30%] h-7 rounded-3xl shadow border-[1px] border-black bg-[#0267a5] hover:bg-[#015d94] text-white text-sm px-1 mx-2 -ml-3 py-[1px] transition-transform duration-100 active:translate-y-1 active:shadow-inner"
      >
        <span class="flex-1 text-center font-normal">{{
          selectedGame.name.toUpperCase()
        }}</span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="w-4 h-4 mr-2"
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
      <button
        @click="openHowToPlayModal"
        class="flex items-center justify-left w-[30%] h-7 rounded-3xl shadow bg-[#f89a17] text-black text-sm px-1 mx-2 -ml-3 py-[1px] transition-transform duration-100 active:translate-y-1 active:shadow-inner"
      >
        <img :src="howTo" alt="" class="w-5 h-5 filter brightness-0" />
        <span class="flex-1 text-center truncate">How To Play?</span>
      </button>
    </div>

    <div class="flex justify-end items-center w-[50%] space-x-2">
      <p class="font-mono text-sm">{{ balance.toLocaleString() }}</p>
      <p class="opacity-50">USD</p>
      <button
        class="p-1 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full"
        aria-label="Open menu"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="w-5 h-5"
          fill="none"
          viewBox="0 0 24 24"
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
      class="absolute top-full left-1 grid grid-cols-4 gap-2 bg-[#212226] p-4 z-50"
    >
      <div
        v-for="game in gameIcons"
        :key="game.routeName"
        class="flex flex-col items-center hover:opacity-80 cursor-pointer"
        @click="onSelectGame(game)"
      >
        <img :src="game.src" :alt="game.name" class="w-11 h-11 mb-1" />
        <p class="text-sm opacity-70 font-extralight">{{ game.name }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
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

const router = useRouter();
const dropdownOpen = ref(false);
const modalOpen = ref(false);

// Default to Mines
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
  { name: "Mini Roulette", src: iconMiniRoulette, routeName: "MiniRoulette" },
  { name: "Hotline", src: iconHotline, routeName: "Hotline" },
  { name: "Balloon", src: iconBalloon, routeName: "Balloon" },
];

const userStore = useUserStore();
const { balance } = storeToRefs(userStore);

function toggleDropdown() {
  dropdownOpen.value = !dropdownOpen.value;
}

function openHowToPlayModal() {
  modalOpen.value = !modalOpen.value;
}

function onSelectGame(game: GameType) {
  selectedGame.value = game;
  dropdownOpen.value = false;
  // Navigate via the dynamic GameView route by id param
  router.push({
    name: "GameView",
    params: { id: game.routeName.toLowerCase() },
  });
}
</script>

<style scoped>
/* no additional styles */
</style>
