<template>
  <div
    class="flex flex-col items-center justify-between h-full w-[400px] space-y-6 py-2"
  >
    <MinesHeader />
    <div
      class="w-full h-full bg-gray-800 rounded-lg flex items-center justify-center"
    >
      <p class="text-gray-400">[Mines Game Canvas]</p>
    </div>
    <MinesFooter />
  </div>
</template>

<script setup lang="ts">
import MinesHeader from "@/components/games/mines/MinesHeader.vue";
import MinesFooter from "@/components/games/mines/MinesFooter.vue";
</script>

<style scoped></style>
