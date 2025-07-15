<!--  src/components/BetAuto.vue -->
<template>
  <button
    @click="$emit('toggle')"
    :class="[
      'w-16 h-16 flex items-center justify-center rounded-full border-2',
      active ? 'border-green-400 bg-green-500' : 'border-gray-400 bg-gray-800',
    ]"
  >
    <img :src="iconAutoPlay" alt="Bet Icon" class="w-7 h-7 flex-shrink-0" />
  </button>
</template>

<script setup lang="ts">
import { defineProps, defineEmits } from "vue";
import iconAutoPlay from "@/assets/icon-auto-play.svg";

defineProps<{ active: boolean }>();
const emit = defineEmits<{
  (e: "toggle"): void;
}>();
</script>
