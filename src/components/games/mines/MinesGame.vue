<template>
  <div
    class="flex flex-col items-center justify-between h-[72%] md:h-[100%] w-full max-w-[400px] pb-0 pt-2 md:pb-2 md:pt-1 px-1"
  >
    <MinesHeader />

    <!-- now just drop in our new board -->
    <MinesBoard :rows="5" :cols="5" />

    <MinesFooter />
  </div>
</template>

<script setup lang="ts">
import MinesHeader from "@/components/games/mines/MinesHeader.vue";
import MinesFooter from "@/components/games/mines/MinesFooter.vue";
import MinesBoard from "@/components/games/mines/MinesBoard.vue";
</script>

<style scoped></style>
