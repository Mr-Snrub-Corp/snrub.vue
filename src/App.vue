<template>
  <a
    href="#main-content"
    class="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-surface-900 focus:text-surface-0 focus:rounded focus:outline-none focus:shadow-lg"
  >
    Skip to main content
  </a>
  <Toast />
  <RouterView />
</template>
<script setup lang="ts">
import { RouterView } from "vue-router";
import Toast from "primevue/toast";
</script>
