<template>
  <div
    v-if="visible"
    class="fixed inset-0 z-50 flex items-center justify-center text-white"
    @keyup.esc="close"
  >
    <div class="absolute inset-0 bg-black/30" @click.self="close" />

    <!-- CARD: constrain height and allow Y-scroll -->
    <div
      class="relative w-[420px] max-w-full max-h-[90vh] overflow-y-auto rounded-2xl border border-[#3f3f3f] bg-[#1e1f26] text-[12px] shadow-2xl"
    >
      <!-- HEADER -->
      <header
        class="flex items-center justify-between px-5 py-4 bg-[#14151a] border-b border-[#3f3f3f] rounded-t-2xl"
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
        <div class="bg-black/30 p-3 rounded-lg">
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
            class="flex items-center justify-between px-4 py-2.5 rounded bg-[#2a2b33]"
          >
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
                step="1"
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

        <!-- More options toggle -->
        <details>
          <summary
            class="flex items-center justify-center py-2 text-white font-semibold cursor-pointer select-none"
          >
            More options
          </summary>

          <div class="mt-4 space-y-6">
            <!-- Stop if cash increases by -->
            <div
              class="flex items-center justify-between px-4 py-2.5 rounded bg-[#2a2b33]"
            >
              <label class="flex items-center gap-3 select-none">
                <input
                  type="checkbox"
                  class="sr-only"
                  v-model="withProfitLimit"
                />
                <span
                  :class="[
                    'relative inline-block h-5 w-9 rounded-full transition-colors',
                    withProfitLimit ? 'bg-lime-500' : 'bg-gray-500',
                  ]"
                >
                  <span
                    :class="[
                      'absolute top-0.5 h-4 w-4 rounded-full bg-white transition-transform',
                      withProfitLimit ? 'translate-x-4 left-0.5' : 'left-0.5',
                    ]"
                  />
                </span>
                Stop if cash increases by
              </label>
              <div class="flex items-center gap-1">
                <button
                  type="button"
                  class="w-6 h-6 flex items-center justify-center rounded bg-[#1a1b20] disabled:opacity-40"
                  :disabled="!withProfitLimit"
                  @click="profitLimit = Math.max(0, profitLimit - 1)"
                >
                  −
                </button>
                <input
                  type="number"
                  step="1"
                  min="0"
                  class="w-[74px] text-center rounded bg-[#1a1b20] disabled:opacity-40 disabled:cursor-not-allowed"
                  v-model.number="profitLimit"
                  :disabled="!withProfitLimit"
                />
                <button
                  type="button"
                  class="w-6 h-6 flex items-center justify-center rounded bg-[#1a1b20] disabled:opacity-40"
                  :disabled="!withProfitLimit"
                  @click="profitLimit++"
                >
                  +
                </button>
              </div>
            </div>

            <!-- If I lost -->
            <div
              v-if="props.conditions.includes('onLoss')"
              class="space-y-2 bg-black/30 p-3 rounded-lg"
            >
              <p class="text-center">If I lost</p>
              <div>
                <!-- Return to initial -->
                <label
                  class="relative flex items-center bg-[#37383f] rounded gap-3 select-none cursor-pointer"
                >
                  <input
                    type="radio"
                    class="sr-only"
                    value="initial"
                    v-model="lostAction"
                  />
                  <span
                    :class="[
                      'absolute left-3 w-2.5 h-2.5 rounded-full transition-colors',
                      lostAction === 'initial' ? 'bg-lime-400' : 'bg-[#1f1f1f]',
                    ]"
                  />
                  <div
                    :class="[
                      'w-full text-center py-2 rounded',
                      lostAction === 'initial' ? 'bg-[#4a4b53]' : '',
                    ]"
                  >
                    Return to initial bet
                  </div>
                </label>

                <div class="grid grid-cols-2 gap-2 py-3">
                  <!-- Increase -->
                  <label
                    class="relative flex flex-col items-center gap-1 bg-[#37383f] rounded cursor-pointer"
                  >
                    <div
                      :class="[
                        'w-full text-center p-3 rounded',
                        lostAction === 'increase' ? 'bg-[#4a4b53]' : '',
                      ]"
                    >
                      <input
                        type="radio"
                        class="sr-only"
                        value="increase"
                        v-model="lostAction"
                      />
                      <span
                        :class="[
                          'absolute left-3 w-2.5 h-2.5 rounded-full transition-colors',
                          lostAction === 'increase'
                            ? 'bg-lime-400'
                            : 'bg-[#1f1f1f]',
                        ]"
                      />
                      <span class="text-[12px]">Increase bet by</span>
                      <div
                        class="flex items-center gap-1 w-full justify-center"
                      >
                        <button
                          type="button"
                          class="w-6 h-6 flex items-center justify-center rounded bg-[#1a1b20] disabled:opacity-40"
                          :disabled="lostAction !== 'increase'"
                          @click="lostIncrease = Math.max(0, lostIncrease - 1)"
                        >
                          −
                        </button>
                        <input
                          type="number"
                          min="0"
                          class="w-12 text-center rounded bg-[#1a1b20] disabled:opacity-40 disabled:cursor-not-allowed"
                          v-model.number="lostIncrease"
                          :disabled="lostAction !== 'increase'"
                        />%
                        <button
                          type="button"
                          class="w-6 h-6 flex items-center justify-center rounded bg-[#1a1b20] disabled:opacity-40"
                          :disabled="lostAction !== 'increase'"
                          @click="lostIncrease++"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </label>

                  <!-- Decrease -->
                  <label
                    class="relative flex flex-col items-center gap-1 bg-[#37383f] rounded cursor-pointer"
                  >
                    <div
                      :class="[
                        'w-full text-center p-3 rounded',
                        lostAction === 'decrease' ? 'bg-[#4a4b53]' : '',
                      ]"
                    >
                      <input
                        type="radio"
                        class="sr-only"
                        value="decrease"
                        v-model="lostAction"
                      />
                      <span
                        :class="[
                          'absolute left-3 w-2.5 h-2.5 rounded-full transition-colors',
                          lostAction === 'decrease'
                            ? 'bg-lime-400'
                            : 'bg-[#1f1f1f]',
                        ]"
                      />
                      <span class="text-[12px]">Decrease bet by</span>
                      <div
                        class="flex items-center gap-1 w-full justify-center"
                      >
                        <button
                          type="button"
                          class="w-6 h-6 flex items-center justify-center rounded bg-[#1a1b20] disabled:opacity-40"
                          :disabled="lostAction !== 'decrease'"
                          @click="lostDecrease = Math.max(0, lostDecrease - 1)"
                        >
                          −
                        </button>
                        <input
                          type="number"
                          min="0"
                          class="w-12 text-center rounded bg-[#1a1b20] disabled:opacity-40 disabled:cursor-not-allowed"
                          v-model.number="lostDecrease"
                          :disabled="lostAction !== 'decrease'"
                        />%
                        <button
                          type="button"
                          class="w-6 h-6 flex items-center justify-center rounded bg-[#1a1b20] disabled:opacity-40"
                          :disabled="lostAction !== 'decrease'"
                          @click="lostDecrease++"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            <!-- If I win -->
            <div
              v-if="props.conditions.includes('onWin')"
              class="space-y-2 bg-black/30 p-3 rounded-lg"
            >
              <p class="text-center">If I win</p>
              <div>
                <!-- Return to initial -->
                <label
                  class="relative flex items-center bg-[#37383f] rounded gap-3 select-none cursor-pointer"
                >
                  <input
                    type="radio"
                    class="sr-only"
                    value="initial"
                    v-model="winAction"
                  />
                  <span
                    :class="[
                      'absolute left-3 w-2.5 h-2.5 rounded-full transition-colors',
                      winAction === 'initial' ? 'bg-lime-400' : 'bg-[#1f1f1f]',
                    ]"
                  />
                  <div
                    :class="[
                      'w-full text-center py-2 rounded',
                      winAction === 'initial' ? 'bg-[#4a4b53]' : '',
                    ]"
                  >
                    Return to initial bet
                  </div>
                </label>

                <div class="grid grid-cols-2 gap-2 py-3">
                  <!-- Increase -->
                  <label
                    class="relative flex flex-col items-center gap-1 bg-[#37383f] rounded cursor-pointer"
                  >
                    <div
                      :class="[
                        'w-full text-center p-3 rounded',
                        winAction === 'increase' ? 'bg-[#4a4b53]' : '',
                      ]"
                    >
                      <input
                        type="radio"
                        class="sr-only"
                        value="increase"
                        v-model="winAction"
                      />
                      <span
                        :class="[
                          'absolute left-3 w-2.5 h-2.5 rounded-full transition-colors',
                          winAction === 'increase'
                            ? 'bg-lime-400'
                            : 'bg-[#1f1f1f]',
                        ]"
                      />
                      <span class="text-[12px]">Increase bet by</span>
                      <div
                        class="flex items-center gap-1 w-full justify-center"
                      >
                        <button
                          type="button"
                          class="w-6 h-6 flex items-center justify-center rounded bg-[#1a1b20] disabled:opacity-40"
                          :disabled="winAction !== 'increase'"
                          @click="winIncrease = Math.max(0, winIncrease - 1)"
                        >
                          −
                        </button>
                        <input
                          type="number"
                          min="0"
                          class="w-12 text-center rounded bg-[#1a1b20] disabled:opacity-40 disabled:cursor-not-allowed"
                          v-model.number="winIncrease"
                          :disabled="winAction !== 'increase'"
                        />%
                        <button
                          type="button"
                          class="w-6 h-6 flex items-center justify-center rounded bg-[#1a1b20] disabled:opacity-40"
                          :disabled="winAction !== 'increase'"
                          @click="winIncrease++"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </label>

                  <!-- Decrease -->
                  <label
                    class="relative flex flex-col items-center gap-1 bg-[#37383f] rounded cursor-pointer"
                  >
                    <div
                      :class="[
                        'w-full text-center p-3 rounded',
                        winAction === 'decrease' ? 'bg-[#4a4b53]' : '',
                      ]"
                    >
                      <input
                        type="radio"
                        class="sr-only"
                        value="decrease"
                        v-model="winAction"
                      />
                      <span
                        :class="[
                          'absolute left-3 w-2.5 h-2.5 rounded-full transition-colors',
                          winAction === 'decrease'
                            ? 'bg-lime-400'
                            : 'bg-[#1f1f1f]',
                        ]"
                      />
                      <span class="text-[12px]">Decrease bet by</span>
                      <div
                        class="flex items-center gap-1 w-full justify-center"
                      >
                        <button
                          type="button"
                          class="w-6 h-6 flex items-center justify-center rounded bg-[#1a1b20] disabled:opacity-40"
                          :disabled="winAction !== 'decrease'"
                          @click="winDecrease = Math.max(0, winDecrease - 1)"
                        >
                          −
                        </button>
                        <input
                          type="number"
                          min="0"
                          class="w-12 text-center rounded bg-[#1a1b20] disabled:opacity-40 disabled:cursor-not-allowed"
                          v-model.number="winDecrease"
                          :disabled="winAction !== 'decrease'"
                        />%
                        <button
                          type="button"
                          class="w-6 h-6 flex items-center justify-center rounded bg-[#1a1b20] disabled:opacity-40"
                          :disabled="winAction !== 'decrease'"
                          @click="winDecrease++"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </details>
      </section>

      <!-- FOOTER -->
      <footer class="px-5 pb-5">
        <button
          class="w-full py-2 rounded-md bg-gradient-to-r from-lime-500 to-lime-600 hover:from-lime-400 hover:to-lime-500 text-[#1e1f26] font-bold tracking-wide"
          @click="submit"
        >
          START AUTO
        </button>
      </footer>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { useMinesUI } from "@/modules/games/mines/store/ui";
import type { ConditionType } from "@/config/gameConfigs";

const props = defineProps<{
  conditions: ConditionType[];
  modelValue?: boolean;
}>();
const emit = defineEmits<{
  (e: "update:modelValue", v: boolean): void;
  (e: "submit"): void;
}>();

const store = useMinesUI();

// visibility
const visible = computed({
  get: () => props.modelValue ?? true,
  set: (v) => emit("update:modelValue", v),
});
function close() {
  visible.value = false;
}

// rounds
const rounds = computed<number>({
  get: () => store.auto.roundsPlanned,
  set: (v) => (store.auto.roundsPlanned = v),
});

// default rows: stopLoss & takeProfit
const withStopLoss = computed({
  get: () => store.auto.stopLoss !== null,
  set: (v) => {
    if (!v) store.auto.stopLoss = null;
    else if (store.auto.stopLoss === null) store.auto.stopLoss = 0;
  },
});
const stopLoss = computed<number>({
  get: () => store.auto.stopLoss ?? 0,
  set: (v) => (store.auto.stopLoss = v),
});

const withTakeProfit = computed({
  get: () => store.auto.takeProfit !== null,
  set: (v) => {
    if (!v) store.auto.takeProfit = null;
    else if (store.auto.takeProfit === null) store.auto.takeProfit = 0;
  },
});
const takeProfit = computed<number>({
  get: () => store.auto.takeProfit ?? 0,
  set: (v) => (store.auto.takeProfit = v),
});

interface Row {
  key: string;
  enabled: typeof withStopLoss | typeof withTakeProfit;
  label: string;
  model: typeof stopLoss | typeof takeProfit;
}
const rows: Row[] = [
  {
    key: "sl",
    enabled: withStopLoss,
    label: "Stop if cash decreases by",
    model: stopLoss,
  },
  {
    key: "tp",
    enabled: withTakeProfit,
    label: "Stop if single win exceeds",
    model: takeProfit,
  },
];

function increment(row: Row) {
  row.model.value++;
}
function decrement(row: Row) {
  row.model.value = Math.max(0, row.model.value - 1);
}

// profitLimit inside details
const withProfitLimit = computed({
  get() {
    return store.auto.profitLimit != null;
  },
  set(value) {
    if (!value) {
      store.auto.profitLimit = null;
    } else if (store.auto.profitLimit == null) {
      store.auto.profitLimit = 0;
    }
  },
});

const profitLimit = computed<number>({
  get: () => store.auto.profitLimit ?? 0,
  set: (v) => {
    store.auto.profitLimit = v;
  },
});

// “If I lost” & “If I win”
const lostAction = ref<"initial" | "increase" | "decrease">("initial");
const lostIncrease = ref(0);
const lostDecrease = ref(0);

const winAction = ref<"initial" | "increase" | "decrease">("initial");
const winIncrease = ref(0);
const winDecrease = ref(0);

function submit() {
  store.setAutoConditions({
    rounds: rounds.value,
    stopLoss: store.auto.stopLoss,
    takeProfit: store.auto.takeProfit,
    profitLimit: store.auto.profitLimit,
    onLoss: {
      type: lostAction.value,
      increase: lostIncrease.value,
      decrease: lostDecrease.value,
    },
    onWin: {
      type: winAction.value,
      increase: winIncrease.value,
      decrease: winDecrease.value,
    },
  });
  if (store.status === "betActive") store.handleClick();
  emit("submit");
  close();
}
</script>

<style scoped>
/* All styling via Tailwind */
</style>
