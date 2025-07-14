<!-- src/games/mines/components/Header.vue -->
<template>
  <div
    class="relative w-full h-9 bg-gradient-to-r from-[#055a8e] to-[#00329a] flex items-center justify-between px-4 shadow-md rounded-xl text-white py-4"
  >
    <!-- Left: game selector -->
    <button
      @click="toggleDropdown"
      class="flex items-center justify-center w-[14%] h-7 rounded-3xl shadow border-[1px] border-black bg-[#0267a5] hover:bg-[#015d94] text-white text-sm px-1 -ml-3 py-[1px]"
    >
      <span class="flex-1 text-center font-normal">MINES</span>
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

    <!-- Dropdown menu -->
    <div
      v-if="open"
      class="absolute top-full left-1 grid grid-cols-4 gap-x-2 gap-y-4 bg-[#212226] border border-black rounded-lg shadow-lg p-4 z-20"
    >
      <a
        v-for="(game, idx) in gameIcons"
        :key="idx"
        :href="game.href"
        class="flex flex-col items-center hover:opacity-80"
      >
        <img :src="game.src" :alt="game.name" class="w-11 h-11 mb-1" />
        <p class="text-sm opacity-70 font-extralight">{{ game.name }}</p>
      </a>
    </div>

    <!-- Right: balance + menu -->
    <div class="flex items-center space-x-3">
      <p class="font-mono text-sm">1,351,651,651 USD</p>
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
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";

// icons
import iconBalloon from "../../../assets/gameIcons/icon-balloon.svg";
import iconDice from "../../../assets/gameIcons/icon-dice.svg";
import iconGoal from "../../../assets/gameIcons/icon-goal.svg";
import iconHiLo from "../../../assets/gameIcons/icon-hi-lo.svg";
import iconHotline from "../../../assets/gameIcons/icon-hotline.svg";
import iconKeno from "../../../assets/gameIcons/icon-keno.svg";
import iconMines from "../../../assets/gameIcons/icon-mines.svg";
import iconMiniRoulette from "../../../assets/gameIcons/icon-mini-roulette.svg";
import iconPlinko from "../../../assets/gameIcons/icon-plinko.svg";

const open = ref(false);
function toggleDropdown() {
  open.value = !open.value;
}

// list of game icons + links for dropdown
const gameIcons = [
  {
    name: "Dice",
    src: iconDice,
    href: "https://turbo.spribegaming.com/dice?currency=USD&operator=demo&jurisdiction=CW&lang=EN&return_url=https:%2F%2Fspribe.co%2Fgames&user=41252&token=1GmUbXboehDv6lYllHy8QAppKTnSJcR5",
  },
  {
    name: "Plinko",
    src: iconPlinko,
    href: "https://turbo.spribegaming.com/plinko?currency=USD&operator=demo&jurisdiction=CW&lang=EN&return_url=https:%2F%2Fspribe.co%2Fgames&user=41252&token=1GmUbXboehDv6lYllHy8QAppKTnSJcR5",
  },
  {
    name: "Goal",
    src: iconGoal,
    href: "https://turbo.spribegaming.com/goal?currency=USD&operator=demo&jurisdiction=CW&lang=EN&return_url=https:%2F%2Fspribe.co%2Fgames&user=41252&token=1GmUbXboehDv6lYllHy8QAppKTnSJcR5",
  },
  {
    name: "Hi-Lo",
    src: iconHiLo,
    href: "https://turbo.spribegaming.com/hi-lo?currency=USD&operator=demo&jurisdiction=CW&lang=EN&return_url=https:%2F%2Fspribe.co%2Fgames&user=41252&token=1GmUbXboehDv6lYllHy8QAppKTnSJcR5",
  },
  {
    name: "Mines",
    src: iconMines,
    href: "https://turbo.spribegaming.com/mines?currency=USD&operator=demo&jurisdiction=CW&lang=EN&return_url=https:%2F%2Fspribe.co%2Fgames&user=41252&token=1GmUbXboehDv6lYllHy8QAppKTnSJcR5",
  },
  {
    name: "Keno",
    src: iconKeno,
    href: "https://turbo.spribegaming.com/keno?currency=USD&operator=demo&jurisdiction=CW&lang=EN&return_url=https:%2F%2Fspribe.co%2Fgames&user=41252&token=1GmUbXboehDv6lYllHy8QAppKTnSJcR5",
  },
  {
    name: "Mini Roulette",
    src: iconMiniRoulette,
    href: "https://turbo.spribegaming.com/mini-roulette?currency=USD&operator=demo&jurisdiction=CW&lang=EN&return_url=https:%2F%2Fspribe.co%2Fgames&user=41252&token=1GmUbXboehDv6lYllHy8QAppKTnSJcR5",
  },
  {
    name: "Hotline",
    src: iconHotline,
    href: "https://turbo.spribegaming.com/hotline?currency=USD&operator=demo&jurisdiction=CW&lang=EN&return_url=https:%2F%2Fspribe.co%2Fgames&user=41252&token=1GmUbXboehDv6lYllHy8QAppKTnSJcR5",
  },
  {
    name: "Balloon",
    src: iconBalloon,
    href: "https://turbo.spribegaming.com/balloon?currency=USD&operator=demo&jurisdiction=CW&lang=EN&return_url=https:%2F%2Fspribe.co%2Fgames&user=41252&token=1GmUbXboehDv6lYllHy8QAppKTnSJcR5",
  },
];
</script>
