<!-- src/games/mines/MinesGameWrapper.vue -->
<template>
  <div class="flex flex-col h-full bg-[#202020]">
    <div class="flex-1 flex items-center justify-center">
      <div
        class="relative flex flex-col w-[56%] h-[57%] border-[2px] border-[#FB9C23] bg-gradient-to-r from-[#0781cc] to-[#0049db] overflow-hidden rounded-xl"
      >
        <!-- background icons: half outside left and right, vertically centered -->
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

        <!-- header takes its natural height -->
        <Header class="flex-none w-full z-10" />

        <!-- game area grows -->
        <div class="flex-1 pt-16 pb-16 flex items-center justify-center z-10">
          <p>Game area placeholder</p>
        </div>

        <!-- footer takes its natural height -->
        <BetControls class="flex-none w-full z-10" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import Header from "@/components/Header.vue";
import BetControls from "@/components/BetControls.vue";

// background icons
import minesStar from "@/assets/mines-star.svg";
import minesBomb from "@/assets/mines-bomb.svg";
</script>

<style scoped>
/* positioning is handled via Tailwind; overflow is now hidden */
</style>
