<!-- src/pages/GameView.vue -->
<script setup lang="ts">
import { useRoute } from "vue-router";
import { computed, defineAsyncComponent } from "vue";

const route = useRoute();

// Compute the async component factory based on the `id` param
const GameComponent = computed(() => {
  const id = route.params.id as string;

  // If you’ve kept each game under /pages/games/<id>/index.vue:
  return defineAsyncComponent(() => import(`@/pages/games/${id}/index.vue`));

  // Or, if you must support MinesGame.vue naming:
  // return defineAsyncComponent(() => import(`@/pages/games/${id}/${id === 'mines' ? 'MinesGame.vue' : 'index.vue'}`))
});
</script>

<template>
  <div class="flex flex-col h-full bg-[#202020]">
    <div class="flex-1 flex items-center justify-center">
      <!--
        Suspense gives you a built-in loading/error fallback.
        You can style these slots or remove Suspense if you don’t need it.
      -->
      <Suspense>
        <template #default>
          <component :is="GameComponent" />
        </template>
        <template #fallback>
          <div class="text-white">Loading game…</div>
        </template>
      </Suspense>
    </div>
  </div>
</template>
