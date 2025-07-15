<template>
  <div class="flex flex-col items-center space-y-6">
    <!-- placeholder for future canvas -->
    <div
      class="w-80 h-48 bg-gray-800 rounded-lg flex items-center justify-center"
    >
      <p class="text-gray-400">[Mines Game Canvas]</p>
    </div>

    <!-- our Bet/Cashout button -->
    <BetButton :status="store.status" @bet="onButtonClick" />

    <p class="text-white mt-2">
      Current status: <span class="font-mono">{{ store.status }}</span>
    </p>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from "vue";
import { useMinesStore } from "./Store";
import BetButton from "@/components/BetButton.vue";
import { MinesEngine } from "./Engine";

const store = useMinesStore();
let engine: MinesEngine;

onMounted(() => {
  // if/when you add Pixi:
  // engine = new MinesEngine(pixiContainer.value!)
  // engine.start()
});

function onButtonClick() {
  store.handleClick();
}
</script>

<style scoped>
/* center everything nicely */
.flex {
  display: flex;
}
.flex-col {
  flex-direction: column;
}
.items-center {
  align-items: center;
}
.space-y-6 > :not(:last-child) {
  margin-bottom: 1.5rem;
}
</style>
