<!-- src/components/BetButton.vue -->
<script setup lang="ts">
import iconBet from "@/assets/icon-bet.svg";
const emit = defineEmits<{
  (e: "bet"): void;
}>();
</script>

<template>
  <button
    @click="emit('bet')"
    class="relative inline-flex items-center justify-center w-[300px] h-14 rounded-3xl font-semibold text-lg text-white tracking-wide transition-transform duration-75 active:translate-y-[2px] focus:outline-none"
  >
    <!-- outer hard outline -->
    <span
      class="absolute inset-0 rounded-3xl ring-[3px] ring-black shadow-[inset_0_0_10px_rgba(25,0,0,0.6)]"
    />

    <!-- UPDATED GRADIENT: ends darker, center light -->
    <span
      class="absolute inset-0 rounded-3xl pointer-events-none"
      style="
        background: linear-gradient(
          90deg,
          #327805 0%,
          #5b9f02 50%,
          #327805 100%
        );
        box-shadow: inset 0 -6px 8px rgba(0, 0, 0, 0.3);
      "
    ></span>

    <!-- icon + label -->
    <span class="relative z-10 flex items-center justify-between w-full px-6">
      <!-- Left icon -->
      <img :src="iconBet" alt="Bet Icon" class="w-7 h-7 flex-shrink-0" />

      <!-- Centered label -->
      <span
        class="flex-1 text-center font-semibold -ml-6"
        style="text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.6)"
      >
        BET
      </span>
      <!-- Right side content -->
    </span>
  </button>
</template>
