<!-- src/pages/games/mines/index.vue -->
<template>
  <!-- Outer page wrapper provided by GameView -->
  <div class="relative w-full h-full flex items-center justify-center">
    <!-- Background decorations -->
    <img
      :src="minesStar"
      alt="star"
      class="absolute hidden md:block top-1/2 left-[-103px] w-[259px] h-[261px] transform -translate-y-1/2 z-0 pointer-events-none"
    />

    <img
      :src="minesBomb"
      alt="bomb"
      class="absolute hidden md:block top-[46%] right-[-100px] w-[276px] h-[305px] transform -translate-y-1/2 z-0 pointer-events-none"
    />

    <!-- Actual Mines game component -->
    <div
      class="w-full h-[100%] flex flex-col items-center align-center justify-between"
    >
      <MinesGame />
    </div>
  </div>
</template>

<script setup lang="ts">
import minesStar from "@/assets/mines-star.svg";
import minesBomb from "@/assets/mines-bomb.svg";
import MinesGame from "@/modules/games/mines/MinesGame.vue";
</script>
