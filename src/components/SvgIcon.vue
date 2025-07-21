<!-- components/SvgIcon.vue -->
<template>
  <div
    class="svg-icon-wrapper"
    :class="{
      'svg-icon-selected': isSelected,
      'svg-icon-unselected': !isSelected,
    }"
    v-html="svgContent"
  ></div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from "vue";

const props = defineProps({
  src: {
    type: String,
    required: true,
  },
  isSelected: {
    type: Boolean,
    default: false,
  },
});

const svgContent = ref("");

const fetchSvg = async () => {
  try {
    const response = await fetch(props.src);
    const text = await response.text();
    // Preserve original SVG content without modification
    svgContent.value = text;
  } catch (error) {
    console.error("Error loading SVG:", error);
  }
};

onMounted(fetchSvg);
watch(() => props.src, fetchSvg);
</script>

<style scoped>
.svg-icon-wrapper {
  display: inline-block;
  width: 36px;
  height: 36px;
  transition: all 0.2s ease;
}

/* Selected state - enhance contrast */
.svg-icon-selected :deep(svg) {
  filter: brightness(1.6) contrast(1.5)
    drop-shadow(0 0 0 rgba(255, 255, 255, 0.7));
  transform: scale(1.1);
}

/* Unselected state - reduce prominence */
.svg-icon-unselected :deep(svg) {
  opacity: 0.8;
  filter: brightness(0.9) contrast(0.9);
}

.svg-icon-wrapper :deep(svg) {
  width: 100%;
  height: 100%;
}
</style>
