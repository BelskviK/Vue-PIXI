<template>
  <div class="flex flex-col h-screen" :style="{ backgroundColor: pageBg }">
    <div class="flex-1 flex items-center justify-center">
      <div :class="config.wrapperBaseClasses" :style="wrapperStyle">
        <Header
          :key="gameId"
          :theme="config.theme"
          :classes="config.betsClasses"
        />

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

        <BetsControl
          v-if="config.betsControlProps.showControls !== false"
          :key="gameId"
          :classes="config.betsClasses"
          v-bind="config.betsControlProps"
          :theme="{
            layoutgradientFrom: config.theme.layoutgradientFrom,
            layoutgradientTo: config.theme.layoutgradientTo,
            btn: config.theme.btn,
          }"
        />
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

const route = useRoute();
const gameId = computed(() => (route.params.id as string) || "mines");
const config = computed(
  () => gameConfigs[gameId.value] || gameConfigs["mines"]
);

const GameComponent = computed(() =>
  defineAsyncComponent(config.value.component)
);

const wrapperStyle = computed(() => ({
  background: `linear-gradient(
    to right,
    ${config.value.theme.gradientFrom},
    ${config.value.theme.gradientTo}
  )`,
  border: `2px solid ${config.value.theme.border}`,
}));

const pageBg = computed(() => config.value.theme.bg);
</script>
