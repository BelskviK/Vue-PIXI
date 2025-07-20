<!-- src/modules/games/mines/ui/MinesHeader.vue -->
<template>
  <div class="w-full">
    <!-- selector + multiplier row -->
    <div class="flex w-full h-[22px] rounded-[12px] bg-[#15171969]">
      <!-- mines dropdown -->
      <div class="relative flex-1" ref="wrapper">
        <button
          @click="toggleDropdown"
          :disabled="locked"
          :class="[
            'flex items-center justify-center w-[130px] h-[20px] rounded-3xl px-2 text-white text-[12px]',
            'border border-black shadow-[inset_1px_1px_0_rgba(0,0,0,0.3),inset_1px_1px_0_rgba(255,255,255,0.2)]',
            locked
              ? 'opacity-40 cursor-not-allowed disabled:active:translate-y-0'
              : 'cursor-pointer active:translate-y-[2px]',
          ]"
          style="background-color: #0267a5"
        >
          <span class="flex-1 truncate">Mines : {{ minesCount }}</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="w-4 h-4 ml-1"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>

        <!-- dropdown menu -->
        <div
          v-if="isOpen"
          class="absolute top-full left-0 mt-1 w-[150px] bg-[#032e49] rounded-xl p-3 z-10 max-h-[200px] overflow-y-auto"
        >
          <div class="grid grid-cols-1 gap-2">
            <button
              v-for="n in numbers"
              :key="n"
              @click="selectMines(n)"
              :class="[
                'rounded-full border border-black py-1 text-[10px] font-medium active:translate-y-[2px]',
                minesCount === n
                  ? 'bg-[#2f82b5] text-white'
                  : 'bg-[#094164] text-white hover:bg-[#0b5679]',
              ]"
            >
              {{ n }}
            </button>
          </div>
        </div>
      </div>

      <!-- multiplier pill -->
      <div class="flex flex-1 justify-end">
        <div
          class="flex items-center justify-center w-[100px] h-[20px] rounded-3xl border border-black shadow-[1px_1px_0_rgba(0,0,0,0.3),inset_1px_1px_0_rgba(255,255,255,0.2)]"
          :style="{ backgroundColor: multiplierColor }"
        >
          <span class="flex-1 text-center text-[12px] truncate">
            Next: {{ shownMultiplier }}
          </span>
        </div>
      </div>
    </div>

    <!-- progress bar -->
    <div
      class="w-full h-[4px] bg-[#15171969] rounded-full mt-2 overflow-hidden"
      role="progressbar"
      :aria-valuenow="progress"
      aria-valuemin="0"
      aria-valuemax="100"
    >
      <div class="h-full bg-[#28a745]" :style="{ width: progress + '%' }" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onBeforeUnmount } from "vue";
import { useMinesSettings } from "@/modules/games/mines/store/settings";
import { useMinesRound } from "@/modules/games/mines/store/round";
import { useMinesUI } from "@/modules/games/mines/store/ui";

/* ─── stores ─────────────────────────────────────────────────── */
const settings = useMinesSettings();
const round = useMinesRound();
const ui = useMinesUI();

/* ─── dropdown helpers ───────────────────────────────────────── */
const locked = computed(() => ui.dropdownLocked);
const isOpen = ref(false);
const numbers = Array.from({ length: 20 }, (_, i) => i + 1);
const minesCount = computed(() => settings.minesCount);

function toggleDropdown() {
  if (!locked.value) isOpen.value = !isOpen.value;
}
function selectMines(n: number) {
  settings.setMinesCount(n);
  isOpen.value = false;
}

const wrapper = ref<HTMLElement | null>(null);
function onClickOutside(e: MouseEvent) {
  if (wrapper.value && !wrapper.value.contains(e.target as Node)) {
    isOpen.value = false;
  }
}
onMounted(() => document.addEventListener("click", onClickOutside));
onBeforeUnmount(() => document.removeEventListener("click", onClickOutside));

/* ─── reactive UI --------------------------------------------------- */
const progress = computed(() => round.progressPercent);
// freeze shownMultiplier once auto.process=true
const shownMultiplier = ref<string>("0.00x");

// Update shownMultiplier only when auto.process is false
watch(
  () => ui.nextMultiplier,
  (n) => {
    if (!ui.auto.process) {
      shownMultiplier.value = `${n.toFixed(2)}x`;
    }
  },
  { immediate: true }
);

// When a new auto session ends, allow shownMultiplier to update again
watch(
  () => ui.auto.process,
  (proc) => {
    if (!proc) {
      const n = ui.nextMultiplier;
      shownMultiplier.value = `${n.toFixed(2)}x`;
    }
  }
);

/* pill colour – green when Auto is armed */
const multiplierColor = computed(() =>
  ui.auto.enabled ? "#28a745" : "#ffc107"
);
</script>

<style scoped>
/* All styling handled by Tailwind */
</style>
