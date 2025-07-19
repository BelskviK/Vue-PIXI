<template>
  <div class="w-full">
    <!-- ───── first row (dropdown + multiplier) ───── -->
    <div
      class="flex flex-row w-full h-[22px] salign-center justify-center bg-[#15171969] rounded-[12px]"
    >
      <!-- left: mines selector -->
      <div class="flex w-full align-center">
        <div class="relative" ref="wrapper">
          <button
            @click="toggleDropdown"
            class="flex items-center justify-center w-[130px] h-[20px] rounded-3xl shadow text-white text-[12px] px-2 transition-transform duration-100 active:translate-y-[2px] shadow-[1px_1px_0_rgba(0,0,0,0.3),inset_1px_1px_0_rgba(255,255,255,0.2)] border border-black bg-[#0267a5]"
          >
            <span class="flex-1 text-center font-normal truncate">
              Mines : {{ minesCount }}
            </span>
            <!-- chevron -->
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="w-4 h-4 ml-1"
              fill="none"
              viewBox="0 0 24 24"
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

          <!-- dropdown list -->
          <div
            v-if="isOpen"
            ref="dropdown"
            class="absolute top-full left-0 mt-1 w-[130px] bg-[#032e49] rounded-xl p-4 z-10 max-h-[200px] overflow-y-auto"
          >
            <div class="grid grid-cols-1 gap-2">
              <button
                v-for="number in numbers"
                :key="number"
                @click="selectMines(number)"
                :class="[
                  'rounded-full border border-black py-1 text-center font-medium active:translate-y-[2px] text-xs',
                  minesCount === number
                    ? 'bg-[#2f82b5] text-white'
                    : 'bg-[#094164] text-white hover:bg-[#0b5679]',
                ]"
              >
                {{ number }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- right: next multiplier (placeholder for now) -->
      <div class="flex w-full align-center justify-end">
        <div
          class="flex items-center justify-center w-[100px] h-[20px] rounded-3xl shadow text-black text-[12px] px-2 transition-transform duration-100 active:translate-y-[2px] shadow-[1px_1px_0_rgba(0,0,0,0.3),inset_1px_1px_0_rgba(255,255,255,0.2)] border border-black bg-[#ffc107]"
        >
          <span class="flex-1 text-center font-normal truncate">
            Next: : {{ nextMultiplier }}
          </span>
        </div>
      </div>
    </div>

    <!-- ───── progress bar ───── -->
    <div
      role="progressbar"
      :aria-valuenow="minesProgress"
      aria-valuemin="0"
      aria-valuemax="100"
      class="w-full h-[4px] bg-[#15171969] rounded-full overflow-hidden mt-2"
    >
      <div
        class="h-full bg-[#28a745]"
        :style="{ width: minesProgress + '%' }"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from "vue";
import { useMinesSettings } from "@/components/games/mines/settings";
import { useMinesRound } from "@/components/games/mines/round"; // 🆕

/* ─ dropdown logic ─ */
const settings = useMinesSettings();
const isOpen = ref(false);
const numbers = Array.from({ length: 24 }, (_, i) => i + 1); // 1-24 bombs
const minesCount = computed(() => settings.minesCount);

function toggleDropdown() {
  isOpen.value = !isOpen.value;
}
function selectMines(n: number) {
  settings.setMinesCount(n);
  isOpen.value = false;
}

/* ─ outside-click helper ─ */
const wrapper = ref<HTMLElement | null>(null);
function handleClickOutside(e: MouseEvent) {
  if (wrapper.value && !wrapper.value.contains(e.target as Node))
    isOpen.value = false;
}
onMounted(() => document.addEventListener("click", handleClickOutside));
onBeforeUnmount(() =>
  document.removeEventListener("click", handleClickOutside)
);

/* ─ real progress bar data ─ */
const round = useMinesRound(); // 🆕
const minesProgress = computed(() => round.progressPercent);

/* ─ placeholder multiplier (static for now) ─ */
const nextMultiplier = ref(1.1);
</script>

<style scoped></style>
