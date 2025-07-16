<template>
  <button
    :disabled="isDisabled"
    @click="handleClick"
    :class="[
      'relative inline-flex items-center justify-center w-full h-[50px] rounded-3xl font-semibold text-lg text-white tracking-wide transition-transform duration-75 focus:outline-none active:translate-y-[2px] shadow-[2px_2px_0_rgba(0,0,0,0.3),inset_2px_2px_0_rgba(255,255,255,0.2)]',
      opacityClass,
    ]"
  >
    <!-- outer hard outline -->
    <span
      class="absolute inset-0 rounded-2xl ring-[2px] ring-black shadow-[inset_0_0_10px_rgba(25,0,0,0.3)]"
    />

    <!-- dynamic gradient background -->
    <span
      class="absolute inset-0 rounded-2xl pointer-events-none"
      :style="gradientStyle"
    />

    <!-- content: icon+label for bet, amount with cashout label for cashout -->
    <span
      :class="[
        'relative   w-full px-6',
        props.status.includes('cashout')
          ? 'flex flex-col items-center justify-center space-y-1'
          : 'flex items-center justify-between',
      ]"
    >
      <!-- Cashout: label on top and amount with background -->
      <template v-if="props.status.includes('cashout')">
        <span class="text-white font-semibold text-[16px] -mb-2">CASH OUT</span>
        <div
          class="bg-[rgba(0,0,0,0.41)] text-white font-semibold text-[12px] text-center px-2 rounded h-4 mt-1 leading-[1.5]"
        >
          {{ formattedCashOutValue }} USD
        </div>
      </template>
      <!-- Bet: icon + label -->
      <template v-else>
        <img :src="iconBet" alt="Bet Icon" class="w-6 h-6 flex-shrink-0" />
        <span
          class="flex-1 text-center font-semibold -ml-6 text-[14px]"
          style="text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.6)"
        >
          BET
        </span>
      </template>
    </span>
  </button>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useMinesStore } from "@/components/games/mines/Store";
import iconBet from "@/assets/icon-bet.svg";

const props = defineProps<{
  /** 'betInactive' | 'betActive' | 'cashoutActive' | 'cashoutInactive' */
  status: string;
}>();
const emit = defineEmits<{ (e: "bet"): void }>();

// store for retrieving bet amount
const store = useMinesStore();

const isDisabled = computed(
  () => props.status === "betInactive" || props.status === "cashoutInactive"
);
const opacityClass = computed(() => (isDisabled.value ? "opacity-50" : ""));

// gradient style: orange radial for cashout, green radial for bet
const gradientStyle = computed(() => {
  const shadow = "inset 0 -6px 8px rgba(0, 0, 0, 0.3)";
  if (props.status === "cashoutActive" || props.status === "cashoutInactive") {
    return {
      backgroundImage:
        "radial-gradient(44% 44% at 49.36% 52%,#dba355 0%,#c4872e 100%)",
      boxShadow: shadow,
    };
  }
  return {
    backgroundImage: "radial-gradient(circle at 50% 50%, #61a503, #2d7500 94%)",
    boxShadow: shadow,
  };
});

// formatted bet value for cashout display
const formattedCashOutValue = computed(() => store.cashOut.toFixed(2));

function handleClick() {
  if (!isDisabled.value) {
    emit("bet");
  }
}
</script>
