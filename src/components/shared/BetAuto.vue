<template>
  <button
    @click="handleClick"
    class="w-full max-w-[50px] h-[50px] mr-3 rounded-full"
    :class="buttonClasses"
  >
    <span v-if="mode === 'countdown'" class="font-semibold">
      {{ countdown }}
    </span>
    <img v-else :src="iconAutoPlay" alt="Auto" class="w-6 h-6" />
  </button>
</template>

<script setup lang="ts">
import { ref, watch, computed } from "vue";
import iconAutoPlay from "@/assets/icon-auto-play.svg";

const props = withDefaults(
  defineProps<{ active: boolean; disabled?: boolean }>(),
  { active: false, disabled: false }
);
const emit = defineEmits<{ (e: "toggle"): void }>();

const countdown = ref(0);
const mode = ref<"active" | "countdown">("active");
let timer: ReturnType<typeof setInterval> | null = null;

watch(
  () => props.active,
  (val) => {
    clear();
    if (!val) {
      // start countdown when turned off
      mode.value = "countdown";
      countdown.value = 5;
      timer = setInterval(() => {
        if (countdown.value > 0) countdown.value--;
        else {
          clear();
          emit("toggle");
        }
      }, 1000);
    } else mode.value = "active";
  },
  { immediate: true }
);

function clear() {
  if (timer) clearInterval(timer);
  timer = null;
}

function handleClick() {
  if (props.disabled || mode.value === "countdown") return;
  emit("toggle");
}

const buttonClasses = computed(() => {
  const base =
    "w-16 h-16 flex items-center justify-center rounded-full border-2 " +
    "shadow-[2px_2px_0_rgba(0,0,0,0.3),inset_2px_2px_0_rgba(255,255,255,0.2)]";

  if (props.disabled) return [base, "opacity-40 cursor-not-allowed"];
  if (mode.value === "active") return [base, "bg-green-500 border-green-400"];
  return [base, "bg-[#cc000e] border-gray-400 text-white"];
});
</script>

<style scoped>
span {
  font-size: 1.125rem;
} /* same as Tailwind text-lg */
</style>
