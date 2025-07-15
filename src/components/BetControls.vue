<script setup lang="ts">
const props = defineProps<{
  classes?: string;
  panelType?: string;
  maxBet?: number;
  gridSize?: number;
  theme: {
    // ✅ Remove '?' to make required
    layoutgradientFrom: string;
    layoutgradientTo: string;
  };
  [key: string]: any;
}>();
</script>

<template>
  <div
    :class="[
      props.classes,
      'w-full h-20 flex items-center justify-center shadow-inner rounded-xl',
    ]"
  >
    <div
      class="w-full h-20 flex items-center justify-center space-x-4 shadow-inner rounded-xl"
      :style="{
        background: `linear-gradient(to right, ${props.theme.layoutgradientFrom}, ${props.theme.layoutgradientTo})`,
      }"
    >
      <!-- your inner controls here -->
    </div>
  </div>
</template>
