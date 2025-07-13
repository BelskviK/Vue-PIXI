<template>
  <div class="flex justify-between items-center px-6 py-4 bg-black text-white">
    <h1 class="text-xl font-bold">{{ title }}</h1>
    <div class="text-right">
      👤 {{ user.name }} &nbsp;|&nbsp; 💰 {{ user.balance }}$
    </div>
  </div>
</template>

<script setup lang="ts">
import { useUserStore } from "@/stores/user";

defineProps<{
  title: string;
}>();

const user = useUserStore();
</script>
