<!-- src/components/BetControls.vue -->
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
      <!-- stake input uses only theme.btn for background -->
      <BetInput
        :value="betValue"
        :disabled="roundLocked || autoProcess"
        :theme="theme"
        @increase="inc"
        @decrease="dec"
      />

      <!-- action buttons -->
      <div class="flex flex-row justify-between w-[300px]">
        <BetAuto
          v-if="autoCfg"
          :running="autoRunning"
          :ready="autoEnabled"
          :disabled="betAutoDisabled"
          @toggle="toggleAuto"
        />
        <!-- now always pass betStatus -->
        <BetButton :status="betStatus" @bet="onBetClick" />
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

<script setup lang="ts">
import { ref, computed, watch, defineProps, defineEmits, toRefs } from "vue";
import { gameConfigs } from "@/config/gameConfigs";
import AutoGameModal from "@/components/AutoGameModal.vue";
import BetAuto from "@/components/BetAuto.vue";
import BetButton from "@/components/BetButton.vue";
import BetInput from "@/components/BetInput.vue";

import { useDiceStore } from "@/modules/games/dice/Store";
import { usePlinkoStore } from "@/modules/games/plinko/Store";
import { useMinesUI } from "@/modules/games/mines/store/ui";
import { useMinesRound } from "@/modules/games/mines/store/round";
import { useGoalStore } from "@/modules/games/goal/Store";
import { useHiloStore } from "@/modules/games/hilo/Store";
import { useKenoStore } from "@/modules/games/keno/Store";
import { useMiniRouletteStore } from "@/modules/games/mini-roulette/Store";
import { useHotlineStore } from "@/modules/games/hotline/Store";
import { useBalloonStore } from "@/modules/games/balloon/Store";
import { SoundManager } from "@/utils/SoundManager"; // add at the top

// props passed from parent
const props = defineProps<{
  panelType: string;
  classes?: string;
  maxBet?: number;
  theme: { btn: string };
  showControls?: boolean;
}>();
const { classes, theme, panelType, maxBet, showControls } = toRefs(props);

// select store based on panelType
const stores: Record<string, any> = {
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
const store = stores[panelType.value];

// mines-specific readiness
const minesRound = panelType.value === "mines" ? useMinesRound() : null;
const preselectReady = computed(
  () =>
    panelType.value !== "mines" ||
    (minesRound && minesRound.preselectedTiles > 0)
);

// modal configuration
const autoCfg = computed(() => gameConfigs[panelType.value]?.autoModal);

// local bet value
const betValue = ref(maxBet.value ?? 0);

// UI state flags
const status = computed(() => store.betButtonStatus as string);
const autoEnabled = computed(() => store.auto?.enabled ?? false);
const autoProcess = computed(() => store.auto?.process ?? false);
const autoRunning = computed(() => store.auto?.running ?? false);
const roundLocked = computed(() => store.status !== "betActive");
const betAutoDisabled = computed(
  () => roundLocked.value || !autoEnabled.value || !preselectReady.value
);

// ▶️ NEW: override status when autoProcess is true
const betStatus = computed(() =>
  autoProcess.value ? "betInactive" : status.value
);

// emit events to parent
const emit = defineEmits<{
  (e: "update:bet", v: number): void;
  (e: "toggle:auto", v: boolean): void;
  (e: "place:bet"): void;
}>();
watch(betValue, (v) => emit("update:bet", v));

// helper functions
function inc() {
  betValue.value = parseFloat((betValue.value + 0.1).toFixed(2));
}
function dec() {
  betValue.value = Math.max(0, parseFloat((betValue.value - 0.1).toFixed(2)));
}
function onBetClick() {
  if (betStatus.value === "cashoutActive") {
    SoundManager.instance.play("win");
  } else {
    SoundManager.instance.play("bet");
  }
  store.handleClick?.();
  emit("place:bet");
}

// auto modal handlers
const modalOpen = ref(false);
function toggleAuto() {
  if (betAutoDisabled.value) return;
  if (!autoRunning.value && autoCfg.value) modalOpen.value = true;
}
function handleAutoSubmit(payload?: any) {
  if (payload) store.setAutoConditions?.(payload);
  emit("toggle:auto", true);
  modalOpen.value = false;
}
</script>
