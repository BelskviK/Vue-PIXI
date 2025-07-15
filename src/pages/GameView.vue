<template>
  <div class="flex flex-col h-screen" :style="{ backgroundColor: pageBg }">
    <!-- Pass per-game props to BetsControl -->

    <!-- Game card wrapper with dynamic theme -->
    <div class="flex-1 flex items-center justify-center">
      <div :class="config.wrapperBaseClasses" :style="wrapperStyle">
        <Header />
        <Suspense>
          <template #default>
            <component :is="GameComponent" />
          </template>
          <template #fallback>
            <div class="text-white flex items-center justify-center h-full">
              Loading game…
            </div>
          </template>
        </Suspense>
        <BetsControl v-bind="config.betsControlProps" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRoute } from "vue-router";
import { computed, defineAsyncComponent } from "vue";
import Header from "@/components/Header.vue";
import BetsControl from "@/components/BetControls.vue";
import { gameConfigs } from "@/config/gameConfigs";

// Current game ID
const route = useRoute();
const gameId = computed(() => (route.params.id as string) || "mines");
// Load config or fallback
const config = computed(
  () => gameConfigs[gameId.value] || gameConfigs["mines"]
);

// Lazy-load game component
const GameComponent = computed(() =>
  defineAsyncComponent(config.value.component)
);

// Inline styles for theme
const wrapperStyle = computed(() => ({
  background: `linear-gradient(to right, ${config.value.theme.gradientFrom}, ${config.value.theme.gradientTo})`,
  border: `2px solid ${config.value.theme.border}`,
}));

// Page background (solid)
const pageBg = computed(() => config.value.theme.bg);
</script>
