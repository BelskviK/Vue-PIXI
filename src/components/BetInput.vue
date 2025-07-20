<template>
  <!-- wrapper fades when locked -->
  <div :class="['relative', disabled ? 'opacity-50' : '']">
    <!-- Main input with dynamic btn background -->
    <div
      :class="[
        'flex items-center justify-between w-[300px] h-[50px] border border-[rgba(0,0,0,0.53)] rounded-[30px] shadow-[inset_1px_1px_#fff1cd33] px-3',
        disabled ? 'pointer-events-none' : '',
      ]"
      :style="{ backgroundColor: theme.btn }"
    >
      <!-- Text + readonly input -->
      <span class="flex flex-col items-start w-full sm:relative static">
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

        <!-- Num-pad popup -->
        <div
          v-if="numPadOpen"
          ref="numPad"
          class="absolute -top-[265px] left-1/2 transform -translate-x-1/2 w-[300px] rounded-2xl p-4 z-20 border"
          :style="{ backgroundColor: theme.btn }"
        >
          <div class="grid grid-cols-3 gap-1 mb-1">
            <button
              v-for="key in keys"
              :key="key"
              @mousedown.prevent
              @click="pressKey(key)"
              class="text-white rounded-lg py-1 text-2xl font-semibold active:translate-y-[2px] border-black shadow-[1px_1px_1px_rgba(0,0,0,0.4),inset_1px_1px_0_rgba(255,255,255,0.2)] filter hover:brightness-90 transition duration-150"
            >
              <template v-if="key === 'back'">⌫</template>
              <template v-else>{{ key }}</template>
            </button>
          </div>
          <div class="flex justify-center">
            <button
              @click="confirmInput"
              class="flex items-center justify-center bg-black/40 rounded-lg px-6 w-full py-2 active:translate-y-[2px]"
            >
              <img :src="iconTick" alt="Confirm" class="w-6 h-6" />
            </button>
          </div>
        </div>
      </span>

      <!-- +/- controls -->
      <div class="flex flex-col w-full bg-blue-900 rounded-full py-1 items-end">
        <div class="flex items-center">
          <button
            @click="decrease"
            class="bg-blue-900 hover:bg-[#025580] text-white text-lg rounded-full w-[36px] h-[32px] active:translate-y-[2px] border border-black shadow-[1px_1px_0_rgba(0,0,0,0.2),inset_2px_2px_0_rgba(255,255,255,0.2)]"
          >
            &minus;
          </button>

          <span
            ref="toggleBtn"
            @click.stop="toggleDropdown"
            class="flex items-center justify-center mx-2 text-white font-medium border border-black rounded-full w-[38px] h-[36px] active:translate-y-[2px] cursor-pointer shadow-[1px_1px_0_rgba(0,0,0,0.2),inset_2px_2px_0_rgba(255,255,255,0.2)]"
          >
            <img :src="iconBetVariant" alt="" class="w-4 h-4" />
          </span>

          <button
            @click="increase"
            class="bg-blue-900 hover:bg-[#025580] text-white text-lg rounded-full w-[36px] h-[32px] active:translate-y-[2px] border border-black shadow-[1px_1px_0_rgba(0,0,0,0.2),inset_2px_2px_0_rgba(255,255,255,0.2)]"
          >
            &plus;
          </button>
        </div>
      </div>
    </div>

    <!-- preset amounts -->
    <div
      v-if="isOpen"
      ref="dropdown"
      class="absolute bottom-full left-0 w-[300px] rounded-xl p-4 z-10"
      :style="{
        background: `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), ${theme.btn}`,
      }"
    >
      <p
        class="text-center text-white text-[14px] opacity-80 font-bold -mt-2 mb-1"
      >
        Bet USD
      </p>
      <div class="grid grid-cols-2 gap-2 text-white">
        <button
          v-for="amount in amounts"
          :key="amount"
          @click="selectAmount(amount)"
          :class="[
            'rounded-full border border-black py-1 text-center font-medium active:translate-y-[2px] text-xs',
            selectedAmount === amount
              ? 'bg-[#2f82b5]'
              : 'bg-[#094164] hover:bg-[#0b5679]',
          ]"
          :style="{
            background: `linear-gradient(rgba(0,0,0,0.2), rgba(0,0,0,0.2)), ${theme.btn}`,
          }"
        >
          {{ amount }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch, toRefs } from "vue";
import { useMinesUI } from "@/modules/games/mines/store/ui";
import iconBetVariant from "@/assets/icon-bet-variant.svg";
import iconTick from "@/assets/icon-calculator-tick.svg";

// accept only theme.btn and disabled
const props = defineProps<{ theme: { btn: string }; disabled?: boolean }>();
const { theme, disabled } = toRefs(props);

const store = useMinesUI();
const isOpen = ref(false);
const numPadOpen = ref(false);

// start at store.betValue if >0, otherwise default "0.10"
const inputValue = ref(store.betValue > 0 ? store.betValue.toFixed(2) : "0.10");
const selectedAmount = ref(inputValue.value);

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
  if (disabled?.value) return;
  isOpen.value = !isOpen.value;
  if (isOpen.value) numPadOpen.value = false;
}

function openNumPad() {
  if (disabled?.value) return;
  numPadOpen.value = true;
  inputValue.value = ""; // clear for fresh entry
  isOpen.value = false;
}

function closeAll() {
  // when numPad is open and closing, apply dialed input or default
  if (numPadOpen.value) {
    let v: number;
    if (inputValue.value) {
      v = parseFloat(inputValue.value);
      if (isNaN(v) || v === 0) v = 0.1;
    } else {
      v = 0.1;
    }
    setBet(v.toFixed(2));
  }
  isOpen.value = false;
  numPadOpen.value = false;
}

function selectAmount(a: string) {
  if (disabled?.value) return;
  setBet(a);
}
function increase() {
  if (disabled?.value) return;
  setBet((store.betValue + 0.1).toFixed(2));
}
function decrease() {
  if (disabled?.value) return;
  const next = store.betValue - 0.1;
  setBet((next >= 0.1 ? next : store.betValue).toFixed(2));
}

function pressKey(k: string) {
  if (disabled?.value) return;
  if (k === "back") inputValue.value = inputValue.value.slice(0, -1);
  else if (k === "." && inputValue.value.includes(".")) return;
  else inputValue.value += k;
}

function confirmInput() {
  if (disabled?.value) return;
  let v = parseFloat(inputValue.value);
  if (isNaN(v) || v === 0) v = 0.1;
  setBet(v.toFixed(2));
  closeAll();
}

function setBet(amountStr: string) {
  const num = parseFloat(amountStr);
  store.setBetValue(num);
  inputValue.value = store.betValue.toFixed(2);
  selectedAmount.value = inputValue.value;
}

function handleClickOutside(e: MouseEvent) {
  const t = e.target as Node;
  if (
    !dropdown.value?.contains(t) &&
    !toggleBtn.value?.contains(t) &&
    !numPad.value?.contains(t)
  )
    closeAll();
}

onMounted(() => document.addEventListener("click", handleClickOutside));
onBeforeUnmount(() =>
  document.removeEventListener("click", handleClickOutside)
);

watch(
  () => store.betValue,
  (v) => {
    inputValue.value = v.toFixed(2);
    selectedAmount.value = inputValue.value;
  }
);

watch(disabled, (d) => {
  if (d) closeAll();
});
</script>
