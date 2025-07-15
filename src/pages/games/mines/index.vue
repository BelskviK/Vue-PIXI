<template>
  <!-- GameView has already provided the outer card and layout -->
  <div class="relative w-full h-full flex items-center justify-center">
    <!-- background floats -->
    <img
      :src="minesStar"
      alt="star"
      class="absolute top-1/2 left-[-8rem] transform -translate-y-1/2 w-80 h-80 z-0 pointer-events-none"
    />
    <img
      :src="minesBomb"
      alt="bomb"
      class="absolute top-1/2 right-[-8rem] transform -translate-y-1/2 w-80 h-80 z-0 pointer-events-none"
    />

    <!-- Your actual Mines game goes here -->
    <div class="z-10">
      <!-- e.g. <MinesGameCanvas /> or whatever -->
      <p class="text-white">Mines game placeholder</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import minesStar from "@/assets/mines-star.svg";
import minesBomb from "@/assets/mines-bomb.svg";
</script>
