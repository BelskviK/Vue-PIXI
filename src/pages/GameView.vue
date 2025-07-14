<!-- src/pages/GameView.vue -->
<script setup lang="ts">
import { useRoute } from "vue-router";
import { gameRegistry } from "../games";

const route = useRoute();
const gameId = route.params.id as string;
const GameComponent = gameRegistry[gameId]?.component;
</script>
<template>
  <div class="flex flex-col h-full bg-[#202020]">
    <!-- You can also force this wrapper to grow if its parent is flex-1 -->
    <div class="flex-1 flex items-center justify-center">
      <component :is="GameComponent" v-if="GameComponent" />
      <div v-else class="text-center text-red-500 p-8">Game not found</div>
    </div>
  </div>
</template>
