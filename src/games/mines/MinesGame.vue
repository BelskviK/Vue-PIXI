<template>
  <div
    class="relative flex flex-col w-[56%] h-[57%] border-[2px] border-[#FB9C23] bg-gradient-to-r from-[#0781cc] to-[#0049db] overflow-hidden rounded-xl"
  >
    <!-- header takes its natural height -->
    <Header class="flex-none w-full z-10" />

    <!-- game area grows -->
    <div class="flex-1 pt-16 pb-16 flex items-center justify-center">
      <p>Game area placeholder</p>
    </div>

    <!-- footer takes its natural height -->
    <BetControls class="flex-none w-full z-10" />
  </div>
</template>

<script setup lang="ts">
import Header from "../mines/components/Header.vue";
import BetControls from "../mines/components/BetControls.vue";
</script>

<style scoped>
/* Container is relative so header/footer span full width */
</style>
