<template>
  <div class="relative">
    <!-- Main BetInput component -->
    <div
      class="flex items-center justify-between w-[300px] h-[50px] border border-[rgba(0,0,0,0.53)] rounded-[30px] shadow-[inset_1px_1px_#fff1cd33] px-3"
    >
      <span class="flex flex-col items-start w-full relative">
        <div
          class="flex flex-col items-center justify-center text-[12px] w-full"
        >
          <p class="text-white text-center font-semibold">Bet USD</p>
          <input
            type="text"
            :value="inputValue"
            @click.stop="openNumPad"
            class="rounded-full border border-black/60 bg-black/30 text-white text-center font-bold cursor-pointer w-full"
            readonly
          />
        </div>
        <!-- Number pad dropdown -->
        <div
          v-if="numPadOpen"
          ref="numPad"
          class="absolute -top-[265px] left-1/2 transform -translate-x-1/2 w-[300px] bg-[#2d7194] rounded-2xl p-4 z-20 border"
          :style="{ backgroundColor: classes }"
        >
          <div class="grid grid-cols-3 gap-1 mb-1">
            <button
              v-for="key in keys"
              :key="key"
              @mousedown.prevent
              @click="pressKey(key)"
              class="text-white rounded-lg shadow-[1px_1px_1px_rgba(0,0,0,0.4),inset_1px_1px_0_rgba(255,255,255,0.2)] py-1 text-2xl font-semibold active:translate-y-[2px] border-black filter hover:brightness-90 transition-[filter] duration-150"
              :style="{ backgroundColor: classes }"
            >
              <template v-if="key === 'back'">⌫</template>
              <template v-else>{{ key }}</template>
            </button>
          </div>
          <div class="flex justify-center">
            <button
              @click="confirmInput"
              class="flex items-center justify-center bg-[#013352] rounded-lg px-6 w-full py-2 active:translate-y-[2px]"
            >
              <img :src="iconTick" alt="Confirm" class="w-6 h-6" />
            </button>
          </div>
        </div>
      </span>

      <!-- +/- and preset dropdown trigger -->
      <div class="flex flex-col w-full bg-blue-900 rounded-full py-1 items-end">
        <div class="flex items-center">
          <button
            @click="decrease"
            class="bg-blue-900 hover:bg-[#025580] transition-colors duration-150 text-white text-lg leading-none focus:outline-none active:translate-y-[2px] border-[1px] border-black rounded-full w-[36px] h-[32px] shadow-[1px_1px_0_rgba(0,0,0,0.2),inset_2px_2px_0_rgba(255,255,255,0.2)]"
          >
            &minus;
          </button>
          <span
            ref="toggleBtn"
            @click.stop="toggleDropdown"
            class="flex items-center justify-center mx-2 text-white font-medium border-[1px] border-black rounded-full w-[38px] h-[36px] active:translate-y-[2px] shadow-[1px_1px_0_rgba(0,0,0,0.2),inset_2px_2px_0_rgba(255,255,255,0.2)] cursor-pointer"
          >
            <img :src="iconBetVariant" alt="" class="w-5 h-5" />
          </span>
          <button
            @click="increase"
            class="bg-blue-900 hover:bg-[#025580] transition-colors duration-150 text-white text-lg leading-none focus:outline-none active:translate-y-[2px] border-[1px] border-black rounded-full w-[36px] h-[32px] shadow-[1px_1px_0_rgba(0,0,0,0.2),inset_2px_2px_0_rgba(255,255,255,0.2)]"
          >
            &plus;
          </button>
        </div>
      </div>
    </div>

    <!-- Preset dropdown menu -->
    <div
      v-if="isOpen"
      ref="dropdown"
      class="absolute bottom-full left-0 w-[300px] bg-[#032e49] rounded-xl p-4 z-10"
    >
      <p
        class="text-center text-white text-[14px] opacity-80 font-bold -mt-2 mb-1"
      >
        Bet USD
      </p>
      <div class="grid grid-cols-2 gap-2">
        <button
          v-for="amount in amounts"
          :key="amount"
          @click="selectAmount(amount)"
          :class="[
            'rounded-full border border-black py-1 text-center font-medium active:translate-y-[2px] text-xs',
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
import { useUserStore } from "@/stores/user";
import iconBetVariant from "@/assets/icon-bet-variant.svg";
import iconTick from "@/assets/icon-calculator-tick.svg";

const props = withDefaults(defineProps<{ classes?: string }>(), {
  classes: "#ffffff",
});
const { classes } = props;

const store = useMinesStore();
const userStore = useUserStore();

const isOpen = ref(false);
const numPadOpen = ref(false);
const inputValue = ref(store.betValue.toFixed(2));
const selectedAmount = ref(store.betValue.toFixed(2));
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
const keys = ["1", "2", "3", "4", "5", "6", "7", "8", "9", ".", "0", "back"];

const toggleBtn = ref<HTMLElement | null>(null);
const dropdown = ref<HTMLElement | null>(null);
const numPad = ref<HTMLElement | null>(null);

function toggleDropdown() {
  isOpen.value = !isOpen.value;
  if (isOpen.value) numPadOpen.value = false;
}

function openNumPad() {
  numPadOpen.value = true;
  inputValue.value = "";
  isOpen.value = false;
}

function closeAll() {
  isOpen.value = false;
  numPadOpen.value = false;
}

function selectAmount(amount: string) {
  setBet(amount);
}

function increase() {
  setBet((store.betValue + 0.1).toFixed(2));
}

function decrease() {
  const next = store.betValue - 0.1;
  setBet((next >= 0.1 ? next : store.betValue).toFixed(2));
}

function pressKey(key: string) {
  if (key === "back") inputValue.value = inputValue.value.slice(0, -1);
  else if (key === "." && inputValue.value.includes(".")) return;
  else inputValue.value += key;
}

function confirmInput() {
  let val = parseFloat(inputValue.value);
  if (isNaN(val) || val === 0) val = 0.1;
  setBet(val.toFixed(2));
  closeAll();
}

function setBet(amountStr: string) {
  const amount = parseFloat(amountStr);
  const cap = parseFloat(userStore.balance.toFixed(2));
  const final = amount > cap ? cap : amount;
  store.setBetValue(final);
  inputValue.value = final.toFixed(2);
  selectedAmount.value = final.toFixed(2);
}

function handleClickOutside(e: MouseEvent) {
  const t = e.target as Node;
  if (
    !dropdown.value?.contains(t) &&
    !toggleBtn.value?.contains(t) &&
    !numPad.value?.contains(t)
  ) {
    closeAll();
  }
}

onMounted(() => document.addEventListener("click", handleClickOutside));
onBeforeUnmount(() =>
  document.removeEventListener("click", handleClickOutside)
);

watch(
  () => store.betValue,
  (val) => {
    inputValue.value = val.toFixed(2);
    selectedAmount.value = val.toFixed(2);
  }
);
</script>
