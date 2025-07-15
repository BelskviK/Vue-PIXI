<!-- src/pages/games/mines/index.vue -->
<template>
  <!-- Outer page wrapper provided by GameView -->
  <div class="relative w-full h-full flex items-center justify-center">
    <!-- Background decorations -->
    <img
      :src="minesStar"
      alt="star"
      class="absolute hidden md:flex top-1/2 left-[-8rem] transform -translate-y-1/2 w-80 h-80 z-0 pointer-events-none"
    />
    <img
      :src="minesBomb"
      alt="bomb"
      class="absolute hidden md:flex top-1/2 right-[-8rem] transform -translate-y-1/2 w-80 h-80 z-0 pointer-events-none"
    />

    <!-- Actual Mines game component -->
    <div class="z-10 w-full h-full flex items-center justify-center">
      <MinesGame />
    </div>
  </div>
</template>

<script setup lang="ts">
import minesStar from "@/assets/mines-star.svg";
import minesBomb from "@/assets/mines-bomb.svg";
import MinesGame from "@/games/mines/MinesGame.vue";
</script>
