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
        !(
          store.randomButtonEnabled ||
          (store.status === 'cashoutInactive' && store.randomEnabled)
        )
      "
      :class="[
        'w-full p-0 text-white border border-[rgba(0,0,0,0.5)] rounded-[20px] shadow-[inset_1px_1px_#fff1cd33]',
        'bg-[#00000026] hover:shadow-inner active:shadow-inner',
        'active:translate-y-[2px] disabled:active:translate-y-0',
        'transition-opacity duration-200',
        store.auto.process ||
        !(
          store.randomButtonEnabled ||
          (store.status === 'cashoutInactive' && store.randomEnabled)
        )
          ? 'opacity-40 cursor-not-allowed'
          : 'opacity-100 cursor-pointer',
      ]"
    >
      <span class="flex-1 text-center font-normal truncate text-[14px]">
        RANDOM
      </span>
    </button>

    <!-- AUTO toggle --------------------------------------------------- -->
    <label
      class="inline-flex items-center cursor-pointer space-x-2 truncate bg-black/30 rounded-3xl w-full h-[26px] p-1"
      :class="
        store.status === 'betActive'
          ? 'opacity-100'
          : 'opacity-40 cursor-not-allowed'
      "
    >
      <!-- icon -->
      <img
        :src="iconAuto"
        alt="Auto"
        class="w-[18px] h-[20px]"
        :class="
          preselectMode
            ? 'hover:opacity-80 active:translate-y-[1px]'
            : 'opacity-60 cursor-not-allowed'
        "
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
  // manual mode: place a bet first if not auto
  if (!store.auto.enabled && store.status === "betActive") {
    store.handleClick();
  }
  // always trigger random pick/preselect
  store.pickRandomTile();
}

/* one-step undo, but only when allowed */
function handleUndoPreselect() {
  if (preselectMode.value) store.undoPreselectedTile();
}
</script>
