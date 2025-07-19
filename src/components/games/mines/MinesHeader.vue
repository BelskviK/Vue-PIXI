<!-- src/components/games/mines/MinesHeader.vue -->
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
          class="absolute top-full left-0 mt-1 w-[130px] bg-[#032e49] rounded-xl p-4 z-10 max-h-[200px] overflow-y-auto"
        >
          <div class="grid grid-cols-1 gap-2">
            <button
              v-for="n in numbers"
              :key="n"
              @click="selectMines(n)"
              :class="[
                'rounded-full border border-black py-1 text-xs font-medium active:translate-y-[2px]',
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

      <!-- multiplier preview -->
      <div class="flex flex-1 justify-end">
        <div
          class="flex items-center justify-center w-[100px] h-[20px] rounded-3xl bg-[#ffc107] border border-black shadow-[1px_1px_0_rgba(0,0,0,0.3),inset_1px_1px_0_rgba(255,255,255,0.2)] transition active:translate-y-[2px]"
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
import { useMinesSettings } from "@/components/games/mines/settings";
import { useMinesRound } from "@/components/games/mines/round";
import { useMinesStore } from "@/components/games/mines/Store";
import { calcMultiplier } from "@/components/games/mines/math";

/* ─── Global stores ───────────────────────────────────────────────────── */
const settings = useMinesSettings();
const round = useMinesRound();
const ui = useMinesStore();

/* ─── Dropdown state ──────────────────────────────────────────────────── */
const locked = computed(() => ui.status !== "betActive");
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
watch(locked, (v) => v && (isOpen.value = false));

/* close on outside click */
const wrapper = ref<HTMLElement | null>(null);
function onClickOutside(e: MouseEvent) {
  if (wrapper.value && !wrapper.value.contains(e.target as Node)) {
    isOpen.value = false;
  }
}
onMounted(() => document.addEventListener("click", onClickOutside));
onBeforeUnmount(() => document.removeEventListener("click", onClickOutside));

/* ─── Progress & Multiplier ───────────────────────────────────────────── */
const progress = computed(() => round.progressPercent);

const shownMultiplier = ref("—");
function refreshMultiplier() {
  if (round.finished) return;
  const m = calcMultiplier(settings.minesCount, round.revealedTiles + 1);
  shownMultiplier.value = m ? m.toFixed(2) + "x" : "—";
}
watch(
  () => [settings.minesCount, round.revealedTiles, round.finished],
  refreshMultiplier,
  { immediate: true }
);
</script>

<style scoped>
/* entirely Tailwind */
</style>
