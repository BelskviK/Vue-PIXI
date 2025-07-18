<template>
  <div class="flex flex-row w-full items-center justify-center space-x-4">
    <!-- RANDOM button -->
    <button
      class="cursor-default text-white p-0 border border-[rgba(0,0,0,0.5)] rounded-[20px] bg-[#00000026] shadow-[inset_1px_1px_#fff1cd33] w-full active:translate-y-[2px] hover:shadow-inner active:shadow-inner"
      :disabled="isRandomDisabled"
      @click="$emit('random')"
    >
      <span class="flex-1 text-center font-normal truncate text-[14px]"
        >RANDOM</span
      >
    </button>

    <!-- Auto Game toggle -->
    <label
      class="inline-flex items-center cursor-pointer space-x-2 truncate bg-black/30 rounded-3xl w-full h-[26px] p-1"
    >
      <img :src="iconAuto" alt="Auto Game" class="w-[18px] h-[20px]" />
      <input type="checkbox" class="sr-only peer" v-model="autoGame" />
      <div
        class="w-9 h-5 bg-white/20 rounded-full peer-focus:ring-2 peer-focus:ring-green-300 peer-checked:bg-green-500 relative after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border after:border-gray-300 after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-full"
      ></div>
      <span class="text-white text-center text-[12px]">Auto Game</span>
    </label>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import iconAuto from "@/assets/icon-auto.svg";

const isRandomDisabled = ref(false);
const autoGame = ref(false);
</script>

<style scoped>
/* All styling is handled via Tailwind CSS */
</style>
