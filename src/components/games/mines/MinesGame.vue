<!-- src/components/games/mines/MinesGame.vue -->
<template>
  <div
    class="flex flex-col items-center justify-between h-full w-full max-w-[400px] pb-40 pt-2 md:pb-2 md:pt-1 px-1"
  >
    <MinesHeader />
    <BoardCanvas :rows="5" :cols="5" class="w-full py-2" />
    <MinesFooter />
  </div>
</template>

<script setup lang="ts">
import MinesHeader from "./ui/MinesHeader.vue";
import MinesFooter from "./ui/MinesFooter.vue";
import BoardCanvas from "./board/BoardCanvas.vue";
</script>
