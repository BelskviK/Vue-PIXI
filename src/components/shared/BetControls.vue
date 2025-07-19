<!-- src/components/shared/BetControls.vue -->
<script setup lang="ts">
import { ref, computed, watch, defineProps, defineEmits } from "vue";
import { gameConfigs } from "@/config/gameConfigs";
import AutoGameModal from "@/components/shared/AutoGameModal.vue";

/* ------- game stores -------- */
import { useDiceStore } from "@/components/games/dice/Store";
import { usePlinkoStore } from "@/components/games/plinko/Store";
import { useMinesStore } from "@/components/games/mines/Store";
import { useGoalStore } from "@/components/games/goal/Store";
import { useHiloStore } from "@/components/games/hilo/Store";
import { useKenoStore } from "@/components/games/keno/Store";
import { useMiniRouletteStore } from "@/components/games/mini-roulette/Store";
import { useHotlineStore } from "@/components/games/hotline/Store";
import { useBalloonStore } from "@/components/games/balloon/Store";

/* ------- ui pieces ---------- */
import BetAuto from "@/components/shared/BetAuto.vue";
import BetButton from "@/components/shared/BetButton.vue";
import BetInput from "@/components/shared/BetInput.vue";

/* props -------------------------------------------------------------- */
const props = defineProps<{
  panelType: string;
  classes?: string;
  maxBet?: number;
  theme: { btn: string };
  showControls?: boolean;
}>();

/* pick store ---------------------------------------------------------- */
const gameStores: Record<string, any> = {
  dice: useDiceStore(),
  plinko: usePlinkoStore(),
  mines: useMinesStore(),
  goal: useGoalStore(),
  hilo: useHiloStore(),
  keno: useKenoStore(),
  miniroulette: useMiniRouletteStore(),
  hotline: useHotlineStore(),
  balloon: useBalloonStore(),
};
const store = gameStores[props.panelType];

/* modal spec ---------------------------------------------------------- */
const autoCfg = computed(() => gameConfigs[props.panelType]?.autoModal);

/* stake --------------------------------------------------------------- */
const betValue = ref(props.maxBet ?? 0);

/* reactive flags ------------------------------------------------------ */
const status = computed(() => store.status as string);
const autoActive = computed(() => store.auto?.enabled ?? false);
const autoLocked = computed(() => status.value !== "betActive");

/* emit bridge --------------------------------------------------------- */
const emit = defineEmits<{
  (e: "update:bet", v: number): void;
  (e: "toggle:auto", v: boolean): void;
  (e: "place:bet"): void;
}>();
watch(betValue, (v) => emit("update:bet", v));

/* helpers ------------------------------------------------------------- */
function inc() {
  betValue.value = parseFloat((betValue.value + 0.1).toFixed(2));
}
function dec() {
  betValue.value = Math.max(0, parseFloat((betValue.value - 0.1).toFixed(2)));
}

function onBetClick() {
  store.handleClick?.(); // some stores may not expose this
  emit("place:bet");
}

/* auto toggle & modal ------------------------------------------------- */
const modalOpen = ref(false);

function toggleAuto() {
  if (autoLocked.value) return;

  /* first click when Auto inactive → open settings */
  if (!autoActive.value && autoCfg.value) {
    modalOpen.value = true;
    return;
  }

  /* otherwise switch off (only if store has auto) */
  if (store.auto) store.auto.enabled = false;
  emit("toggle:auto", false);
}

function handleAutoSubmit() {
  /* store.setAutoConditions is defined for mines (others safely ignored) */
  store.setAutoConditions?.({});
  emit("toggle:auto", true);
  modalOpen.value = false;
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
      class="w-full py-4 md:py-3 flex items-center justify-center flex-col-reverse md:flex-row gap-y-5 md:space-x-4 space-x-0 shadow-inner rounded-xl bg-black/30"
    >
      <!-- stake -->
      <BetInput
        :value="betValue"
        @increase="inc"
        @decrease="dec"
        :classes="theme.btn"
      />

      <!-- buttons -->
      <div class="flex flex-row justify-between w-[300px]">
        <BetAuto
          v-if="autoCfg"
          :active="autoActive"
          :disabled="autoLocked"
          @toggle="toggleAuto"
        />
        <BetButton :status="status" @bet="onBetClick" />
      </div>
    </div>

    <!-- Auto-Play modal -->
    <AutoGameModal
      v-if="modalOpen && autoCfg"
      v-model="modalOpen"
      :conditions="autoCfg.conditions"
      @submit="handleAutoSubmit"
    />
  </div>
</template>

<style scoped>
/* Tailwind only */
</style>
