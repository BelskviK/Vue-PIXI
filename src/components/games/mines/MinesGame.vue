<template>
  <div
    class="flex flex-col items-center justify-between h-full w-[400px] space-y-6 py-2"
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
