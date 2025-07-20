// src/pages/GameView.vue
<template>
  <div class="flex flex-col h-screen bg-[#000000]">
    <div class="flex items-center justify-center h-full w-full">
      <div
        class="relative flex flex-col w-full max-w-[970px] mx-2 h-full md:max-h-[540px] overflow-hidden rounded-xl border-0 md:border-2 md:border-solid"
        :style="wrapperStyle"
      >
        <!-- Header: bottom on small screens, top on md+ -->
        <Header
          :key="gameId"
          :theme="config.theme"
          :classes="config.betsClasses"
          class="absolute bottom-[0px] h-[34px] md:h-[32px] md:order-first md:top-0 order-last"
        />

        <!-- Game content -->
        <Suspense>
          <template #default>
            <component
              :is="GameComponent"
              class="order-1 h-[calc(100%-202px)] md:h-[calc(100%-100px)]"
            />
          </template>
          <template #fallback>
            <div class="text-white flex items-center justify-center order-1">
              Loading game…
            </div>
          </template>
        </Suspense>

        <!-- BetsControl -->
        <BetsControl
          v-if="config.betsControlProps.showControls !== false"
          :key="gameId"
          :classes="config.betsClasses"
          v-bind="config.betsControlProps"
          :theme="{ btn: config.theme.btn }"
          class="absolute bottom-[34px] h-[145px] mb-1 md:bottom-0 md:h-[70px] md:mb-0 md:order-last order-1 z-40 pointer-events-auto"
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
  backgroundImage: config.value.theme.background,
  borderColor: config.value.theme.border,
}));
</script>
