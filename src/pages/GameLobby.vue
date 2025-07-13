<script setup lang="ts">
import { useRouter } from "vue-router";
import { gameRegistry } from "../games/index";

interface Game {
  id: string;
  name: string;
  description: string;
  cover: string;
  component: any;
}

const router = useRouter();

// Type-safe conversion of gameRegistry to array
const games: Game[] = Object.keys(gameRegistry).map(
  (key) => gameRegistry[key as keyof typeof gameRegistry]
);

const goToGame = (id: string): void => {
  router.push(`/games/${id}`);
};
</script>

<template>
  <div class="p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    <div
      v-for="game in games"
      :key="game.id"
      class="cursor-pointer border rounded-lg shadow hover:shadow-lg transition-shadow duration-300"
      @click="() => goToGame(game.id)"
    >
      <img
        :src="game.cover"
        :alt="game.name"
        class="rounded-t-lg w-full h-48 object-cover"
      />
      <div class="p-4">
        <h2 class="text-lg font-bold">{{ game.name }}</h2>
        <p class="text-gray-500 text-sm">{{ game.description }}</p>
      </div>
    </div>
  </div>
</template>
