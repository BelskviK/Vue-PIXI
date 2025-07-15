<template>
  <div class="relative">
    <!-- Main BetInput component -->
    <div
      class="flex items-center justify-between rounded-full px-4 py-2 w-[375px] border shadow-[2px_2px_0_rgba(0,0,0,0.6),inset_2px_2px_0_rgba(255,255,255,0.2)]"
      :style="{ backgroundColor: classes }"
    >
      <!-- both children split 53% / 47% -->
      <span class="flex flex-col items-center w-[53%]">
        <p class="text-sm text-white font-semibold">Bet USD</p>
        <input
          type="decimal"
          :value="store.betValue.toFixed(2)"
          class="bg-[#014873] rounded-full border-[1px] border-black text-white text-center font-bold w-full"
          readonly
        />
      </span>

      <div
        class="flex flex-col items-end w-[47%] bg-blue-900 rounded-full py-1"
      >
        <div class="flex items-center">
          <button
            @click="decrease()"
            class="bg-blue-900 hover:bg-[#025580] transition-colors duration-150 text-white text-lg leading-none focus:outline-none active:translate-y-[2px] border-[1px] border-black rounded-full w-11 h-11 shadow-[1px_1px_0_rgba(0,0,0,0.2),inset_2px_2px_0_rgba(255,255,255,0.2)]"
          >
            &minus;
          </button>

          <span
            ref="toggleBtn"
            @click="toggleDropdown"
            class="flex items-center justify-center mx-2 text-white font-medium border-[1px] border-black rounded-full w-11 h-11 active:translate-y-[2px] shadow-[1px_1px_0_rgba(0,0,0,0.2),inset_2px_2px_0_rgba(255,255,255,0.2)] cursor-pointer"
          >
            <img :src="iconBetVariant" alt="" class="w-5 h-5" />
          </span>

          <button
            @click="increase()"
            class="bg-blue-900 hover:bg-[#025580] transition-colors duration-150 text-white text-lg leading-none focus:outline-none active:translate-y-[2px] border-[1px] border-black rounded-full w-11 h-11 shadow-[1px_1px_0_rgba(0,0,0,0.2),inset_2px_2px_0_rgba(255,255,255,0.2)]"
          >
            &plus;
          </button>
        </div>
      </div>
    </div>

    <!-- Dropdown menu -->
    <div
      v-if="isOpen"
      ref="dropdown"
      class="absolute bottom-full left-0 w-[375px] bg-[#032e49] rounded-xl p-4 z-10"
    >
      <p
        class="text-center text-white text-lg opacity-80 font-semibold -mt-2 mb-1"
      >
        Bet USD
      </p>
      <div class="grid grid-cols-2 gap-2">
        <button
          v-for="amount in amounts"
          :key="amount"
          @click="selectAmount(amount)"
          :class="[
            'rounded-full py-1 text-center font-medium active:translate-y-[2px]',
            selectedAmount === amount
              ? 'bg-[#2f82b5] text-white'
              : 'bg-[#094164] text-white hover:bg-[#0b5679]',
          ]"
        >
          {{ amount }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch } from "vue";
import { useMinesStore } from "@/games/mines/Store";
import iconBetVariant from "@/assets/icon-bet-variant.svg";

// Props
const props = withDefaults(defineProps<{ classes?: string }>(), {
  classes: "#ffffff",
});
const { classes } = props;

// Pinia store for bet value
const store = useMinesStore();

// Dropdown state and refs
const isOpen = ref(false);
const dropdown = ref<HTMLElement | null>(null);
const toggleBtn = ref<HTMLElement | null>(null);

// List of preset amounts
const amounts = [
  "0.10",
  "0.20",
  "0.30",
  "0.40",
  "0.50",
  "0.60",
  "0.70",
  "0.80",
  "1.20",
  "2.00",
  "4.00",
  "10.00",
  "20.00",
  "50.00",
  "100.00",
];

// Currently selected amount
const selectedAmount = ref<string | null>(null);

// Initialize selectedAmount from store
selectedAmount.value = store.betValue.toFixed(2);

// Toggle dropdown visibility
function toggleDropdown() {
  isOpen.value = !isOpen.value;
}

// Increase/decrease functions
function increase() {
  store.betValue = parseFloat((store.betValue + 0.1).toFixed(2));
  selectedAmount.value = store.betValue.toFixed(2);
}
function decrease() {
  const newVal = parseFloat((store.betValue - 0.1).toFixed(2));
  store.betValue = newVal > 0 ? newVal : store.betValue;
  selectedAmount.value = store.betValue.toFixed(2);
}

// Select an amount and emit update (dropdown stays open, button stays highlighted)
function selectAmount(amount: string) {
  store.betValue = parseFloat(amount);
  selectedAmount.value = amount;
}

// Close dropdown when clicking outside
function onClickOutside(event: MouseEvent) {
  const target = event.target as Node;
  if (
    isOpen.value &&
    dropdown.value &&
    toggleBtn.value &&
    !dropdown.value.contains(target) &&
    !toggleBtn.value.contains(target)
  ) {
    isOpen.value = false;
  }
}

onMounted(() => {
  document.addEventListener("click", onClickOutside);
});

onBeforeUnmount(() => {
  document.removeEventListener("click", onClickOutside);
});

// Watch store changes (external updates)
watch(
  () => store.betValue,
  (val) => {
    selectedAmount.value = val.toFixed(2);
  }
);
</script>
