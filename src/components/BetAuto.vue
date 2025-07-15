<template>
  <button @click="handleClick" :class="buttonClasses">
    <span v-if="mode === 'countdown'" class="text-white font-semibold">
      {{ countdown }}
    </span>
    <img
      v-else
      :src="iconAutoPlay"
      alt="Auto Play Icon"
      class="w-7 h-7 flex-shrink-0"
    />
  </button>
</template>

<script setup lang="ts">
import { ref, watch, computed } from "vue";
import iconAutoPlay from "@/assets/icon-auto-play.svg";

// props and emits
const props = withDefaults(defineProps<{ active: boolean }>(), {
  active: false,
});
const emit = defineEmits<{ (e: "toggle"): void }>();

// local state
const countdown = ref(0);
const mode = ref<"active" | "disabled" | "countdown">(
  props.active ? "active" : "disabled"
);
let timer: ReturnType<typeof setInterval> | null = null;

// watch active prop
watch(
  () => props.active,
  (val) => {
    if (val) {
      mode.value = "active";
      clearTimer();
    } else {
      mode.value = "countdown";
      countdown.value = 5;
      timer = setInterval(() => {
        if (countdown.value > 0) {
          countdown.value--;
        } else {
          clearTimer();
          mode.value = "active";
          emit("toggle");
        }
      }, 1000);
    }
  },
  { immediate: true }
);

function clearTimer() {
  if (timer) {
    clearInterval(timer);
    timer = null;
  }
  countdown.value = 0;
}

function handleClick() {
  if (mode.value === "active") {
    mode.value = "disabled";
    emit("toggle");
  }
}

// compute classes
const buttonClasses = computed(() => {
  const base =
    "w-16 h-16 flex items-center justify-center rounded-full border-2 shadow-[2px_2px_0_rgba(0,0,0,0.3),inset_2px_2px_0_rgba(255,255,255,0.2)]";
  if (mode.value === "active") {
    return [base, "active:translate-y-[2px]", "border-green-400 bg-green-500"];
  } else if (mode.value === "countdown") {
    return [base, "border-gray-400 bg-[#cc000e] text-lg"];
  } else {
    // disabled
    return [base, "border-gray-400 bg-gray-800 opacity-50"];
  }
});
</script>
