<!-- src/components/shared/BetControls.vue -->
<script setup lang="ts">
import { ref, computed, watch, defineProps, defineEmits } from "vue";
import { gameConfigs } from "@/config/gameConfigs";
import AutoGameModal from "@/components/shared/AutoGameModal.vue";

/* ------- game stores -------- */
import { useDiceStore } from "@/components/games/dice/Store";
import { usePlinkoStore } from "@/components/games/plinko/Store";
import { useMinesUI } from "@/components/games/mines/store/ui";
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
  mines: useMinesUI(),
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
const status = computed(() => store.betButtonStatus as string);
const autoEnabled = computed(() => store.auto?.enabled ?? false);
const autoRunning = computed(() => store.auto?.running ?? false);
const roundLocked = computed(() => store.status !== "betActive"); // 🔒
const betAutoDisabled = computed(() => roundLocked.value || !autoEnabled.value);

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
  store.handleClick?.();
  emit("place:bet");
}

/* auto toggle & modal ------------------------------------------------- */
const modalOpen = ref(false);

function toggleAuto() {
  if (betAutoDisabled.value) return; // locked or not-armed → ignore
  if (!autoRunning.value && autoCfg.value) {
    modalOpen.value = true; // open settings modal
  }
}

function handleAutoSubmit(payload?: any) {
  if (payload) store.setAutoConditions?.(payload);
  emit("toggle:auto", true);
  modalOpen.value = false;
}
</script>

<template>
  <div
    v-if="showControls !== false"
    :class="[
      classes,
      'w-full flex items-center justify-center shadow-inner rounded-xl',
    ]"
  >
    <div
      class="w-full py-4 md:py-3 flex items-center justify-center flex-col-reverse md:flex-row gap-y-5 md:space-x-4 shadow-inner rounded-xl bg-black/30"
    >
      <!-- stake -->
      <BetInput
        :value="betValue"
        :disabled="roundLocked"
        @increase="inc"
        @decrease="dec"
        :classes="theme.btn"
      />

      <!-- buttons -->
      <div class="flex flex-row justify-between w-[300px]">
        <BetAuto
          v-if="autoCfg"
          :running="autoRunning"
          :ready="autoEnabled"
          :disabled="betAutoDisabled"
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
