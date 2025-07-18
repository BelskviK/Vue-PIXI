<template>
  <div
    class="flex flex-col items-center justify-between h-full w-full max-w-[400px] pb-40 pt-2 md:pb-2 md:pt-1 px-1"
  >
    <MinesHeader />

    <!-- now just drop in our new board -->
    <MinesBoard :rows="5" :cols="5" class="w-full px-1 py-2" />

    <MinesFooter />
  </div>
</template>

<script setup lang="ts">
import MinesHeader from "@/components/games/mines/MinesHeader.vue";
import MinesFooter from "@/components/games/mines/MinesFooter.vue";
import MinesBoard from "@/components/games/mines/MinesBoard.vue";
</script>

<style scoped></style>
