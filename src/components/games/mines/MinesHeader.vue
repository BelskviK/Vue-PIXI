<template>
  <div
    class="flex flex-row w-full h-[22px] salign-center justify-center bg-[#15171969] rounded-[12px]"
  >
    <div class="flex w-full align-center">
      <button
        class="flex items-center justify-center w-[130px] h-[20px] rounded-3xl shadow text-white text-[12px] px-2 transition-transform duration-100 active:translate-y-[2px] shadow-[1px_1px_0_rgba(0,0,0,0.3),inset_1px_1px_0_rgba(255,255,255,0.2)] border border-black"
      >
        <span class="flex-1 text-center font-normal truncate">
          Mines : {{ minesCount }}
        </span>
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
    </div>
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
  <progress class="w-full h-[8px] color-white bg-red-500" fill="50%"></progress>
</template>

<script setup lang="ts">
const minesCount = 3;
const nextMultiplier = 1.1;
</script>

<style scoped></style>
