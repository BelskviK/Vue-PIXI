<!-- src/components/shared/BetButton.vue -->
<template>
  <button
    :disabled="isDisabled"
    @click="handleClick"
    :class="[
      'relative inline-flex items-center justify-center w-full h-[50px] rounded-3xl font-semibold text-lg text-white tracking-wide',
      'transition-transform duration-75 focus:outline-none',
      'shadow-[2px_2px_0_rgba(0,0,0,0.3),inset_2px_2px_0_rgba(255,255,255,0.2)]',
      opacityClass,
    ]"
  >
    <span
      class="absolute inset-0 rounded-2xl ring-[2px] ring-black shadow-[inset_0_0_10px_rgba(25,0,0,0.3)]"
    />
    <span
      class="absolute inset-0 rounded-2xl pointer-events-none"
      :style="gradientStyle"
    />

    <!-- content -->
    <span
      :class="[
        'relative w-full px-6',
        isCashout
          ? 'flex flex-col items-center space-y-1'
          : 'flex items-center justify-between',
      ]"
    >
      <template v-if="isCashout">
        <span class="text-white font-semibold text-[16px] -mb-2">CASH OUT</span>
        <div
          class="bg-[rgba(0,0,0,0.41)] text-white font-semibold text-[12px] text-center px-2 rounded h-4 mt-1 leading-[1.5]"
        >
          {{ liveCash }} USD
        </div>
      </template>

      <template v-else>
        <img :src="iconBet" class="w-6 h-6" alt="bet" />
        <span
          class="flex-1 text-center font-semibold -ml-6 text-[14px]"
          style="text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.6)"
        >
          BET
        </span>
      </template>
    </span>
  </button>
</template>

<script setup lang="ts">
import { computed, PropType } from "vue";
import { useMinesUI } from "@/modules/games/mines/store/ui";
import { useMinesSettings } from "@/modules/games/mines/store/settings";
import { useMinesRound } from "@/modules/games/mines/store/round";
import { calcMultiplier } from "@/modules/games/mines/math";
import iconBet from "@/assets/icon-bet.svg";

// define status with a safe default
const props = defineProps({
  status: {
    type: String as PropType<string>,
    required: false,
    default: "",
  },
});

const emit = defineEmits<{
  (e: "bet"): void;
}>();

/* stores */
const ui = useMinesUI();
const settings = useMinesSettings();
const round = useMinesRound();

/* flags */
const isCashout = computed(() => props.status.includes("cashout"));
const isDisabled = computed(
  () => props.status === "betInactive" || props.status === "cashoutInactive"
);
const opacityClass = computed(() => (isDisabled.value ? "opacity-50" : ""));

/* gradient */
const gradientStyle = computed(() => {
  const shadow = "inset 0 -6px 8px rgba(0,0,0,0.3)";
  return isCashout.value
    ? {
        backgroundImage:
          "radial-gradient(44% 44% at 49.36% 52%,#dba355 0%,#c4872e 100%)",
        boxShadow: shadow,
      }
    : {
        backgroundImage:
          "radial-gradient(circle at 50% 50%, #61a503, #2d7500 94%)",
        boxShadow: shadow,
      };
});

const liveCash = computed(() => {
  if (props.status === "cashoutActive") {
    const mult = calcMultiplier(settings.minesCount, round.revealedTiles);
    return (ui.betValue * mult).toFixed(2);
  }
  if (props.status === "cashoutInactive") {
    return ui.lastWin.toFixed(2);
  }
  return "0.00";
});

function handleClick() {
  if (!isDisabled.value) emit("bet");
}
</script>
