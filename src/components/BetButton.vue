<!-- src/components/BetButton.vue -->
<script setup lang="ts">
import { computed } from "vue";
import iconBet from "@/assets/icon-bet.svg";

const props = defineProps<{
  /**
   * 'betInactive' | 'betActive' | 'cashoutActive' | 'cashoutInactive'
   */
  status: string;
}>();

const emit = defineEmits<{
  (e: "bet"): void;
}>();

const isDisabled = computed(
  () => props.status === "betInactive" || props.status === "cashoutInactive"
);

const gradient = computed(() => {
  if (props.status === "cashoutActive" || props.status === "cashoutInactive") {
    return `
      90deg,
      #c4872e 0%,
      #d89f50 50%,
      #c4872e 100%
    `;
  }
  // betActive or betInactive
  return `
    90deg,
    #327805 0%,
    #559402 50%,
    #327805 100%
  `;
});

const opacityClass = computed(() => (isDisabled.value ? "opacity-50  " : ""));

function handleClick() {
  if (!isDisabled.value) {
    emit("bet");
  }
}
</script>

<template>
  <button
    :disabled="isDisabled"
    @click="handleClick"
    :class="[
      'relative inline-flex items-center justify-center w-[300px] h-14 rounded-3xl font-semibold text-lg text-white tracking-wide transition-transform duration-75 focus:outline-none active:translate-y-[2px]',
      opacityClass,
    ]"
  >
    <!-- outer hard outline -->
    <span
      class="absolute inset-0 rounded-3xl ring-[3px] ring-black shadow-[inset_0_0_10px_rgba(25,0,0,0.6)]"
    />

    <!-- gradient background -->
    <span
      class="absolute inset-0 rounded-3xl pointer-events-none"
      :style="`
        background: linear-gradient(${gradient});
        box-shadow: inset 0 -6px 8px rgba(0, 0, 0, 0.3);
      `"
    />

    <!-- icon + label -->
    <span class="relative z-10 flex items-center justify-between w-full px-6">
      <!-- Left icon -->
      <img :src="iconBet" alt="Bet Icon" class="w-7 h-7 flex-shrink-0" />

      <!-- Centered label -->
      <span
        class="flex-1 text-center font-semibold -ml-6"
        style="text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.6)"
      >
        {{ props.status.includes("cashout") ? "CASH OUT" : "BET" }}
      </span>
    </span>
  </button>
</template>
