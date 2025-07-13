<script setup lang="ts">
import { ref, computed } from "vue";
import { RouterLink, useRouter } from "vue-router";
import { Bars3Icon, XMarkIcon, ArrowLeftIcon } from "@heroicons/vue/24/outline";

const isMobileMenuOpen = ref(false);
const router = useRouter();

function toggleMobileMenu() {
  isMobileMenuOpen.value = !isMobileMenuOpen.value;
}

function goBack() {
  if (window.history.length > 1) {
    router.back();
  } else {
    router.push("/"); // fallback if no real history
  }
}

const canGoBack = computed(() => window.history.length > 1); // basic back logic
</script>

<template>
  <nav class="bg-white shadow-sm">
    <div class="container mx-auto px-4 py-4 flex justify-between items-center">
      <div class="flex items-center space-x-4">
        <!-- Back Button -->
        <button
          v-if="canGoBack"
          @click="goBack"
          class="text-gray-600 hover:text-indigo-600 transition-colors"
        >
          <ArrowLeftIcon class="h-6 w-6" />
        </button>

        <!-- Logo / Title -->
        <RouterLink to="/" class="text-xl font-bold text-indigo-600">
          Game Loader
        </RouterLink>
      </div>

      <!-- Desktop Nav -->
      <div class="hidden md:flex space-x-8">
        <RouterLink
          to="/"
          class="text-gray-700 hover:text-indigo-600 transition-colors"
          active-class="text-indigo-600 font-medium"
        >
          Games
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

      <!-- Additional Settings -->
      <hr class="my-2 border-gray-200" />
      <button
        class="block w-full text-left text-gray-700 hover:text-indigo-600 transition-colors"
      >
        🎵 Sound Settings
      </button>
      <button
        class="block w-full text-left text-gray-700 hover:text-indigo-600 transition-colors"
      >
        🌐 Language
      </button>
      <button
        class="block w-full text-left text-gray-700 hover:text-indigo-600 transition-colors"
      >
        ⚙️ General Settings
      </button>
    </div>
  </nav>
</template>
