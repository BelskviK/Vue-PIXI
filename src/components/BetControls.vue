<!-- src/components/BetControls.vue -->
<script setup lang="ts">
import { ref, watch } from "vue";
import BetAuto from "@/components/BetAuto.vue";
import BetButton from "@/components/BetButton.vue";
import BetInput from "@/components/BetInput.vue";

// Define props for external customization
const props = defineProps<{
  classes?: string;
  panelType?: string;
  maxBet?: number;
  gridSize?: number;
  theme: {
    layoutgradientFrom: string;
    layoutgradientTo: string;
    btn: string;
  };
}>();

// Emit events to parent
const emit = defineEmits<{
  (e: "update:bet", value: number): void;
  (e: "toggle:auto", active: boolean): void;
  (e: "place:bet"): void;
}>();

// Local state
const betValue = ref<number>(props.maxBet ? 0 : 0);
const isAuto = ref<boolean>(false);

// Handlers
function increase() {
  const step = 0.1;
  if (!props.maxBet || betValue.value + step <= props.maxBet) {
    betValue.value = parseFloat((betValue.value + step).toFixed(2));
  }
}

function decrease() {
  const step = 0.1;
  if (betValue.value - step >= 0) {
    betValue.value = parseFloat((betValue.value - step).toFixed(2));
  }
}

function toggleAuto() {
  isAuto.value = !isAuto.value;
  emit("toggle:auto", isAuto.value);
}

function placeBet() {
  emit("place:bet");
}

// Watch and propagate bet value changes
watch(betValue, (newVal) => {
  emit("update:bet", newVal);
});
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
      <BetInput
        :value="betValue"
        @increase="increase"
        @decrease="decrease"
        :classes="props.theme.btn"
      />
      <BetAuto :active="isAuto" @toggle="toggleAuto" />
      <!-- BetButton now has a static green background -->
      <BetButton @bet="placeBet" />
    </div>
  </div>
</template>

<style scoped>
/* No changes needed here */
</style>
