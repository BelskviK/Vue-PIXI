<template>
  <button
    @click="handleClick"
    class="w-full max-w-[50px] h-[50px] mr-3 rounded-full"
    :class="buttonClasses"
  >
    <!-- countdown while running -->
    <span v-if="running" class="text-white font-semibold text-lg">{{
      countdown
    }}</span>

    <!-- icon when idle -->
    <img
      v-else
      :src="iconAutoPlay"
      alt="Auto Play"
      class="w-6 h-6 flex-shrink-0"
    />
  </button>
</template>

<script setup lang="ts">
import { ref, watch, computed } from "vue";
import iconAutoPlay from "@/assets/icon-auto-play.svg";

const props = withDefaults(
  defineProps<{
    running: boolean; // red / countdown mode
    ready: boolean; // checkbox ticked
    disabled: boolean; // round active
  }>(),
  { running: false, ready: false, disabled: false }
);

const emit = defineEmits<{ (e: "toggle"): void }>();

/* simple 5-step visual countdown */
const countdown = ref(0);
watch(
  () => props.running,
  (run) => {
    countdown.value = run ? 5 : 0;
  }
);

/* click: open modal when idle & not disabled */
function handleClick() {
  if (props.disabled) return;
  if (!props.running) emit("toggle");
}

/* classes */
const buttonClasses = computed(() => {
  const base =
    "w-16 h-16 flex items-center justify-center rounded-full border-2 " +
    "shadow-[2px_2px_0_rgba(0,0,0,0.3),inset_2px_2px_0_rgba(255,255,255,0.2)]";

  if (props.disabled) return [base, "opacity-40 cursor-not-allowed"];

  if (props.running) return [base, "bg-[#cc000e] border-gray-400"]; // red

  /* idle  */
  const dim = props.ready ? "opacity-100" : "opacity-40";
  return [base, dim, "bg-green-500 border-green-400 hover:brightness-110"];
});
</script>
