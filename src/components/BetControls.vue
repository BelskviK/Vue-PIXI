<!-- src/components/BetControls.vue -->
<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { useDiceStore } from "@/components/games/dice/Store";
import { usePlinkoStore } from "@/components/games/plinko/Store";
import { useMinesStore } from "@/components/games/mines/Store";
import { useGoalStore } from "@/components/games/goal/Store";
import { useHiloStore } from "@/components/games/hilo/Store";
import { useKenoStore } from "@/components/games/keno/Store";
import { useMiniRouletteStore } from "@/components/games/mini-roulette/Store";
import { useHotlineStore } from "@/components/games/hotline/Store";
import { useBalloonStore } from "@/components/games/balloon/Store";

import BetAuto from "@/components/BetAuto.vue";
import BetButton from "@/components/BetButton.vue";
import BetInput from "@/components/BetInput.vue";

// Props from GameView
const props = defineProps<{
  classes?: string;
  panelType: string;
  maxBet?: number;
  gridSize?: number;
  theme: {
    btn: string;
  };
  showControls?: boolean;
}>();

// Figure out which store to use by panelType
const gameStores: Record<string, any> = {
  dice: useDiceStore(),
  plinko: usePlinkoStore(),
  mines: useMinesStore(),
  goal: useGoalStore(),
  hilo: useHiloStore(),
  keno: useKenoStore(),
  miniRoulette: useMiniRouletteStore(),
  hotline: useHotlineStore(),
  balloon: useBalloonStore(),
};

const store = gameStores[props.panelType];

// Local UI state
const betValue = ref<number>(props.maxBet ?? 0);
const isAuto = ref<boolean>(false);

// Handlers for input & auto
function increase() {
  const step = 0.1;
  if (!props.maxBet || betValue.value + step <= props.maxBet) {
    betValue.value = parseFloat((betValue.value + step).toFixed(2));
  }
}
function decrease() {
  const step = 0.1;
  if (betValue.value - step >= 0) {
    betValue.value = parseFloat((betValue.value - step).toFixed(2));
  }
}
function toggleAuto() {
  isAuto.value = !isAuto.value;
  // you could wire this into store if you want
}

// Emit events up if you still need them
const emit = defineEmits<{
  (e: "update:bet", value: number): void;
  (e: "toggle:auto", active: boolean): void;
  (e: "place:bet"): void;
}>();
watch(betValue, (v) => emit("update:bet", v));

// Derive button status from store
const status = computed(() => store.status as string);

// When BetButton clicked, call the store’s handler
function onBetClick() {
  store.handleClick();
  emit("place:bet");
}
</script>

<template>
  <div
    v-if="showControls !== false"
    :class="[
      classes,
      'w-full   flex items-center justify-center shadow-inner rounded-xl',
    ]"
  >
    <div
      class="w-full py-4 md:py-3 flex items-center justify-center flex-col-reverse md:flex-row gap-y-6 md:space-x-4 space-x-0 shadow-inner rounded-xl bg-black/30"
    >
      <BetInput
        :value="betValue"
        @increase="increase"
        @decrease="decrease"
        :classes="theme.btn"
      />
      <div class="flex flex-row justify-between w-[300px]">
        <BetAuto :active="isAuto" @toggle="toggleAuto" />
        <!-- now driven by each game’s store -->
        <BetButton :status="status" @bet="onBetClick" />
      </div>
    </div>
  </div>
</template>

<style scoped>
/* no changes needed */
</style>
