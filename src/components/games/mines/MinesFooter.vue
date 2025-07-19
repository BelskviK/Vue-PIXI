<!-- src/components/games/mines/MinesFooter.vue -->
<template>
  <div class="flex flex-row w-full items-center justify-center space-x-4">
    <!-- RANDOM -------------------------------------------------------- -->
    <button
      @click="store.pickRandomTile()"
      :disabled="!randomClickable"
      :class="[
        'w-full p-0 text-white border border-[rgba(0,0,0,0.5)] rounded-[20px] shadow-[inset_1px_1px_#fff1cd33]',
        'bg-[#00000026] hover:shadow-inner active:shadow-inner',
        'active:translate-y-[2px] disabled:active:translate-y-0',
        'transition-opacity duration-200',
        randomClickable
          ? 'opacity-100 cursor-pointer'
          : 'opacity-40 cursor-not-allowed',
      ]"
    >
      <span class="flex-1 text-center font-normal truncate text-[14px]">
        RANDOM
      </span>
    </button>

    <!-- AUTO toggle --------------------------------------------------- -->
    <label
      class="inline-flex items-center cursor-pointer space-x-2 truncate bg-black/30 rounded-3xl w-full h-[26px] p-1"
      :class="
        store.status === 'betActive'
          ? 'opacity-100'
          : 'opacity-40 cursor-not-allowed'
      "
    >
      <img :src="iconAuto" alt="Auto" class="w-[18px] h-[20px]" />

      <!-- hidden checkbox drives peer styles -->
      <input
        id="auto-toggle"
        name="auto-toggle"
        type="checkbox"
        class="sr-only peer"
        v-model="store.auto.enabled"
        :disabled="store.status !== 'betActive'"
      />

      <!-- track -->
      <div
        class="w-9 h-5 rounded-full bg-white/20 relative peer-checked:bg-lime-500 after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:h-4 after:w-4 after:rounded-full after:bg-white after:transition peer-checked:after:translate-x-4 peer-checked:after:bg-green-400"
      ></div>

      <span class="text-white text-center text-[12px]">Auto Game</span>
    </label>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import iconAuto from "@/assets/icon-auto.svg";
import { useMinesStore } from "@/components/games/mines/Store";

const store = useMinesStore();
const randomClickable = computed(() => store.randomButtonEnabled);
</script>

<style scoped>
/* Tailwind handles styling */
</style>
