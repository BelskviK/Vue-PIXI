<script setup lang="ts">
// Define props based on gameConfigs.betsControlProps
const props = defineProps<{
  panelType: string;
  [key: string]: any;
}>();
</script>

<template>
  <!-- Dynamically choose panel component by panelType -->
  <component
    :is="`BetsPanel${
      props.panelType.charAt(0).toUpperCase() + props.panelType.slice(1)
    }`"
    v-bind="props"
  />
</template>
