<template>
  <div
    v-if="visible"
    class="fixed inset-0 z-50 flex items-center justify-center text-white"
    @keyup.esc="close"
  >
    <div class="absolute inset-0 bg-black/30" @click.self="close" />

    <!-- CARD -->
    <div
      class="relative w-[420px] max-w-full rounded-2xl border border-[#3f3f3f] bg-[#1e1f26] text-[12px] shadow-2xl"
    >
      <!-- HEADER -->
      <header
        class="flex items-center justify-between px-5 py-4 bg-[#14151a] border-b border-[#3f3f3f]"
      >
        <h5 class="font-semibold tracking-wide">AUTO PLAY</h5>
        <button
          class="text-xl leading-none text-gray-400 hover:text-gray-200 border-r border-[#3f3f3f] rounded-[20px] shadow-[inset_1px_1px_#fff1cd33] w-[22px] h-[22px]"
          @click="close"
          aria-label="Close"
        >
          ×
        </button>
      </header>

      <!-- BODY -->
      <section class="p-5 space-y-6">
        <!-- Number of rounds -->
        <div v-if="showRounds">
          <p class="text-center mb-3">Number of rounds</p>
          <div class="grid grid-cols-2 gap-2">
            <label
              v-for="n in [3, 10, 25, 100, 200, 500]"
              :key="n"
              class="cursor-pointer select-none"
            >
              <input
                type="radio"
                name="rounds"
                class="sr-only"
                :value="n"
                v-model="rounds"
              />
              <div
                :class="[
                  'relative flex items-center justify-center h-10 rounded transition-colors',
                  rounds === n ? 'bg-[#4a4b53]' : 'bg-[#37383f]',
                ]"
              >
                <span
                  :class="[
                    'absolute left-3 w-2.5 h-2.5 rounded-full transition-colors',
                    rounds === n ? 'bg-lime-400' : 'bg-[#1f1f1f]',
                  ]"
                />
                {{ n }}
              </div>
            </label>
          </div>
        </div>

        <!-- Stop/Loss & Take/Profit rows -->
        <template v-for="row in rows" :key="row.key">
          <div
            v-if="row.show"
            class="flex items-center justify-between px-4 py-2.5 rounded bg-[#2a2b33]"
          >
            <!-- toggle switch -->
            <label class="flex items-center gap-3 select-none">
              <input
                type="checkbox"
                class="sr-only"
                v-model="row.enabled.value"
              />
              <span
                :class="[
                  'relative inline-block h-5 w-9 rounded-full transition-colors',
                  row.enabled.value ? 'bg-lime-500' : 'bg-gray-500',
                ]"
              >
                <span
                  :class="[
                    'absolute top-0.5 h-4 w-4 rounded-full bg-white transition-transform',
                    row.enabled.value ? 'translate-x-4 left-0.5' : 'left-0.5',
                  ]"
                />
              </span>
              {{ row.label }}
            </label>

            <!-- spinner -->
            <div class="flex items-center gap-1">
              <button
                type="button"
                class="w-6 h-6 flex items-center justify-center rounded bg-[#1a1b20] disabled:opacity-40"
                :disabled="!row.enabled.value"
                @click="decrement(row)"
              >
                −
              </button>
              <input
                type="number"
                step="1.00"
                min="0"
                class="w-[74px] text-center rounded bg-[#1a1b20] disabled:opacity-40 disabled:cursor-not-allowed"
                v-model.number="row.model.value"
                :disabled="!row.enabled.value"
              />
              <button
                type="button"
                class="w-6 h-6 flex items-center justify-center rounded bg-[#1a1b20] disabled:opacity-40"
                :disabled="!row.enabled.value"
                @click="increment(row)"
              >
                +
              </button>
            </div>
          </div>
        </template>
      </section>

      <!-- FOOTER -->
      <footer class="px-5 pb-5">
        <button
          class="w-full py-2 rounded-md bg-gradient-to-r from-lime-500 to-lime-600 hover:from-lime-400 hover:to-lime-500 text-[#1e1f26] font-bold tracking-wide"
          @click="submit"
        >
          START AUTO
        </button>
        <button
          type="button"
          class="w-full mt-2 text-center text-xs text-gray-400 hover:text-gray-200"
          @click="close"
        >
          Cancel
        </button>
      </footer>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, defineProps, defineEmits, ref } from "vue";
import { useMinesUI } from "@/modules/games/mines/store/ui";
import type { ConditionType } from "@/config/gameConfigs";

const props = defineProps({
  conditions: { type: Array as () => ConditionType[], required: true },
  modelValue: { type: Boolean, default: true },
});
const emit = defineEmits<{
  (e: "update:modelValue", v: boolean): void;
  (e: "submit"): void;
}>();

const store = useMinesUI();

/* visibility */
const visible = computed({
  get: () => props.modelValue,
  set: (v: boolean) => emit("update:modelValue", v),
});
function close() {
  visible.value = false;
}

/* bind directly into store.auto */
const rounds = computed<number>({
  get: () => store.auto.roundsPlanned,
  set: (v) => (store.auto.roundsPlanned = v),
});
const showRounds = computed(() => props.conditions.includes("rounds"));

const withStopLoss = computed({
  get: () => store.auto.stopLoss !== null,
  set: (v: boolean) => {
    if (!v) store.auto.stopLoss = null;
    else if (store.auto.stopLoss === null) store.auto.stopLoss = 0;
  },
});
const stopLoss = computed<number>({
  get: () => store.auto.stopLoss ?? 0,
  set: (v) => (store.auto.stopLoss = v),
});
const showStopLoss = computed(() => props.conditions.includes("stopLoss"));

const withTakeProfit = computed({
  get: () => store.auto.takeProfit !== null,
  set: (v: boolean) => {
    if (!v) store.auto.takeProfit = null;
    else if (store.auto.takeProfit === null) store.auto.takeProfit = 0;
  },
});
const takeProfit = computed<number>({
  get: () => store.auto.takeProfit ?? 0,
  set: (v) => (store.auto.takeProfit = v),
});
const showTakeProfit = computed(() => props.conditions.includes("takeProfit"));

/* rows metadata */
interface Row {
  key: string;
  show: typeof showStopLoss | typeof showTakeProfit;
  enabled: typeof withStopLoss | typeof withTakeProfit;
  label: string;
  model: typeof stopLoss | typeof takeProfit;
}
const rows: Row[] = [
  {
    key: "sl",
    show: showStopLoss,
    enabled: withStopLoss,
    label: "Stop if cash decreases by",
    model: stopLoss,
  },
  {
    key: "tp",
    show: showTakeProfit,
    enabled: withTakeProfit,
    label: "Stop if single win exceeds",
    model: takeProfit,
  },
];

/* spinner behavior */
function increment(row: Row) {
  if (!row.enabled.value) return;
  row.model.value = parseFloat((row.model.value + 1).toFixed(2));
}
function decrement(row: Row) {
  if (!row.enabled.value) return;
  row.model.value = Math.max(0, parseFloat((row.model.value - 1).toFixed(2)));
}

/* submit simply enables auto and closes */
function submit() {
  store.auto.enabled = true;
  emit("submit");
  close();
}
</script>

<style scoped>
/* purely Tailwind utilities */
</style>
