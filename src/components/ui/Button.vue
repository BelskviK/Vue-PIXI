<script setup lang="ts">
withDefaults(
  defineProps<{
    variant?: "primary" | "secondary" | "outline";
    size?: "sm" | "md" | "lg";
  }>(),
  {
    variant: "primary",
    size: "md",
  }
);
</script>

<template>
  <button
    :class="[
      'rounded-md font-medium transition-colors',
      {
        'px-3 py-1.5 text-sm': size === 'sm',
        'px-4 py-2 text-base': size === 'md',
        'px-6 py-3 text-lg': size === 'lg',
        'bg-indigo-600 text-white hover:bg-indigo-700': variant === 'primary',
        'bg-gray-600 text-white hover:bg-gray-700': variant === 'secondary',
        'border border-gray-300 text-gray-700 hover:bg-gray-50':
          variant === 'outline',
      },
    ]"
  >
    <slot />
  </button>
</template>
