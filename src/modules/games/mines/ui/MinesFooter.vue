<!-- src/modules/games/mines/ui/MinesFooter.vue -->
<template>
  <div
    :class="[
      'flex flex-row w-full items-center justify-center space-x-4',
      store.auto.process ? 'pointer-events-none' : '',
    ]"
  >
    <!-- RANDOM -------------------------------------------------------- -->
    <button
      @click="onRandomClick"
      :disabled="
        store.auto.process ||
        (store.status === 'betActive' && !store.randomButtonEnabled)
      "
      :class="[
        'w-full p-0 text-white border border-[rgba(0,0,0,0.5)] rounded-[20px] shadow-[inset_1px_1px_#fff1cd33]',
        'bg-[#00000026] hover:shadow-inner active:shadow-inner',
        'active:translate-y-[2px] disabled:active:translate-y-0',
        '  duration-200',
        store.auto.process ||
        (store.status === 'betActive' && !store.randomButtonEnabled)
          ? 'opacity-40  '
          : 'opacity-100 cursor-pointer',
      ]"
    >
      <span class="flex-1 text-center font-normal truncate text-[14px]">
        RANDOM
      </span>
    </button>

    <!-- AUTO toggle --------------------------------------------------- -->
    <label
      class="inline-flex items-center space-x-2 truncate bg-black/30 rounded-3xl w-full h-[26px] p-1 transition duration-200"
      :class="[
        // normal enable vs disabled by status
        store.status === 'betActive' && !store.auto.process
          ? 'opacity-100 cursor-pointer'
          : 'opacity-40 cursor-not-allowed',
        // blur & fully disable when auto process running
        store.auto.process ? 'pointer-events-none ' : '',
      ]"
    >
      <!-- icon -->
      <img
        :src="iconAuto"
        alt="Auto"
        class="w-[18px] h-[20px]"
        :class="[
          // always forced to 60% opacity when auto.process is true
          store.auto.process
            ? 'opacity-60'
            : // otherwise fall back to your existing logic
            preselectMode
            ? 'hover:opacity-80 active:translate-y-[1px]'
            : 'opacity-60',
        ]"
        @click.stop.prevent="handleUndoPreselect"
      />

      <!-- hidden checkbox -->
      <input
        id="auto-toggle"
        type="checkbox"
        class="sr-only peer"
        v-model="store.auto.enabled"
        :disabled="
          store.auto.process ||
          store.status !== 'betActive' ||
          store.autoGameInProgress
        "
      />

      <!-- track -->
      <div
        class="w-9 h-5 rounded-full bg-white/20 relative peer-checked:bg-lime-500 after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:h-4 after:w-4 after:rounded-full after:bg-white after:transition peer-checked:after:translate-x-4 peer-checked:after:bg-green-400"
      ></div>

      <span class="text-white text-center text-[12px]">Auto&nbsp;Game</span>
    </label>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import iconAuto from "@/assets/icon-auto.svg";
import { useMinesUI } from "@/modules/games/mines/store/ui";

const store = useMinesUI();

/* UI helpers */
const preselectMode = computed(
  () => store.auto.enabled && store.status === "betActive"
);

/* combined Random behavior */
function onRandomClick() {
  if (!store.auto.enabled && store.status === "betActive") {
    store.handleClick();
  }
  store.pickRandomTile();
}

/* one-step undo, but only when allowed */
function handleUndoPreselect() {
  if (preselectMode.value) store.undoPreselectedTile();
}
</script>
