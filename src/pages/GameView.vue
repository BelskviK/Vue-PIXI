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
          class="order-last md:order-first md:h-[32px] h-[34px]"
        />

        <!-- Game content stays in middle -->
        <Suspense>
          <template #default>
            <component :is="GameComponent" class="order-1" />
          </template>
          <template #fallback>
            <div
              class="text-white flex items-center justify-center h-full order-1"
            >
              Loading game…
            </div>
          </template>
        </Suspense>

        <!-- BetsControl: above header on small, below game on md+ -->
        <BetsControl
          v-if="config.betsControlProps.showControls !== false"
          :key="gameId"
          :classes="config.betsClasses"
          v-bind="config.betsControlProps"
          :theme="{ btn: config.theme.btn }"
          class="order-1 md:order-last md:h-[70px] h-[145px]"
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
