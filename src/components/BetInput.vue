<template>
  <div
    class="flex items-center space-x-2 rounded-full px-4 py-2 w-[375px]"
    :style="{ backgroundColor: classes }"
  >
    <span class="text-sm text-white">Bet USD</span>
    <div class="flex items-center bg-blue-900 rounded-full px-3 py-1">
      <button
        @click="emit('decrease')"
        class="text-white text-lg leading-none focus:outline-none"
      >
        &minus;
      </button>
      <span class="mx-2 text-white font-medium">{{ value.toFixed(2) }}</span>
      <button
        @click="emit('increase')"
        class="text-white text-lg leading-none focus:outline-none"
      >
        &plus;
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
// Define props with default color for button background
const props = withDefaults(defineProps<{ value: number; classes?: string }>(), {
  classes: "#ffffff",
});
const { value, classes } = props;

// define emits
const emit = defineEmits<{
  (e: "increase"): void;
  (e: "decrease"): void;
}>();
</script>
