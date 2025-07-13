<script setup lang="ts">
import { useRoute } from "vue-router";
import { gameRegistry } from "../games";

const route = useRoute();
const gameId = route.params.id as string;
const GameComponent = gameRegistry[gameId]?.component;
</script>

<template>
  <component :is="GameComponent" v-if="GameComponent" />
  <div v-else class="text-center text-red-500 p-8">Game not found</div>
</template>
