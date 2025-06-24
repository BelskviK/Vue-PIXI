<script setup lang="ts">
import { ref } from "vue";
import { RouterLink } from "vue-router";
import { Bars3Icon, XMarkIcon } from "@heroicons/vue/24/outline";

const isMobileMenuOpen = ref(false);

function toggleMobileMenu() {
  isMobileMenuOpen.value = !isMobileMenuOpen.value;
}
</script>

<template>
  <nav class="bg-white shadow-sm">
    <div class="container mx-auto px-4 py-4 flex justify-between items-center">
      <RouterLink to="/" class="text-xl font-bold text-indigo-600">
        Vue Tailwind
      </RouterLink>

      <!-- Desktop Nav -->
      <div class="hidden md:flex space-x-8">
        <RouterLink
          to="/"
          class="text-gray-700 hover:text-indigo-600 transition-colors"
          active-class="text-indigo-600 font-medium"
        >
          Home
        </RouterLink>
        <RouterLink
          to="/about"
          class="text-gray-700 hover:text-indigo-600 transition-colors"
          active-class="text-indigo-600 font-medium"
        >
          About
        </RouterLink>
      </div>

      <!-- Mobile Burger Button -->
      <button @click="toggleMobileMenu" class="md:hidden">
        <Bars3Icon v-if="!isMobileMenuOpen" class="h-6 w-6 text-gray-700" />
        <XMarkIcon v-else class="h-6 w-6 text-gray-700" />
      </button>
    </div>

    <!-- Mobile Dropdown Menu -->
    <div v-if="isMobileMenuOpen" class="md:hidden px-4 pb-4 space-y-2">
      <RouterLink
        to="/"
        @click="toggleMobileMenu"
        class="block text-gray-700 hover:text-indigo-600 transition-colors"
        active-class="text-indigo-600 font-medium"
      >
        Home
      </RouterLink>
      <RouterLink
        to="/about"
        @click="toggleMobileMenu"
        class="block text-gray-700 hover:text-indigo-600 transition-colors"
        active-class="text-indigo-600 font-medium"
      >
        About
      </RouterLink>
    </div>
  </nav>
</template>
