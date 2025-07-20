<template>
  <button
    @click="handleClick"
    class="w-full max-w-[50px] h-[50px] mr-3 rounded-full"
    :disabled="props.disabled && !store.auto.process"
    :class="buttonClasses"
    :style="processStyle"
  >
    <!-- countdown while auto process is active -->
    <span v-if="store.auto.process" class="text-white font-semibold text-lg">
      {{ countdown }}
    </span>

    <!-- icon when idle -->
    <img
      v-else
      :src="iconAutoPlay"
      alt="Auto Play"
      class="w-6 h-6 flex-shrink-0"
    />
  </button>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useMinesUI } from "@/modules/games/mines/store/ui";
import iconAutoPlay from "@/assets/icon-auto-play.svg";

const store = useMinesUI();

const props = withDefaults(
  defineProps<{
    ready: boolean; // checkbox state when idle
    disabled: boolean; // disabled when round locked or not ready
  }>(),
  { ready: false, disabled: false }
);

const emit = defineEmits<{ (e: "toggle"): void }>();

// remaining auto rounds countdown
const countdown = computed(() =>
  store.auto.process ? store.auto.roundsPlanned - store.auto.currentRound : 0
);

function handleClick() {
  // guard click when disabled and not in process
  if (props.disabled && !store.auto.process) return;

  if (store.auto.process) {
    // request to stop auto-game after current round finishes
    store.requestStopAutoGame();
    return;
  }

  // open modal when idle
  if (!store.auto.running) emit("toggle");
}

const buttonClasses = computed(() => {
  const base =
    "w-16 h-16 flex items-center justify-center rounded-full border-2 " +
    "shadow-[2px_2px_0_rgba(0,0,0,0.3),inset_2px_2px_0_rgba(255,255,255,0.2)]";

  // during auto process: gradient via style, clickable, opacity reflects stopRequested
  if (store.auto.process) {
    const op = store.auto.stopRequested ? "opacity-50" : "opacity-100";
    return [base, `${op} cursor-pointer`, "border-gray-400"];
  }

  // disabled state
  if (props.disabled) {
    return [base, "opacity-40 cursor-not-allowed"];
  }

  // idle state: green background
  const dim = props.ready ? "opacity-100" : "opacity-40";
  return [base, dim, "bg-green-500 border-green-400 hover:brightness-110"];
});

// radial gradient applied during countdown
const processStyle = computed(() =>
  store.auto.process
    ? { background: "radial-gradient(circle at 50% 50%,#ee0011,#b3000c 94%)" }
    : {}
);
</script>
