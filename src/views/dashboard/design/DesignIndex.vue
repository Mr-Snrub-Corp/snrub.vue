<template>
  <div class="flex flex-col h-full">
    <!-- Horizontal Navigation Menu -->
    <div
      class="border-b border-surface-200 dark:border-surface-700 bg-surface-0 dark:bg-surface-900"
    >
      <nav class="flex gap-1 px-6 py-2 overflow-x-auto">
        <RouterLink
          :to="{ name: 'designForm' }"
          class="px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-150 whitespace-nowrap"
          active-class="bg-primary text-primary-contrast"
          :class="[
            $route.name === 'designForm'
              ? 'bg-primary text-primary-contrast'
              : 'text-surface-700 dark:text-surface-300 hover:bg-surface-100 dark:hover:bg-surface-800',
          ]"
        >
          Form
        </RouterLink>
        <RouterLink
          :to="{ name: 'designButton' }"
          class="px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-150 whitespace-nowrap"
          active-class="bg-primary text-primary-contrast"
          :class="[
            $route.name === 'designButton'
              ? 'bg-primary text-primary-contrast'
              : 'text-surface-700 dark:text-surface-300 hover:bg-surface-100 dark:hover:bg-surface-800',
          ]"
        >
          Button
        </RouterLink>
        <RouterLink
          :to="{ name: 'designData' }"
          class="px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-150 whitespace-nowrap"
          active-class="bg-primary text-primary-contrast"
          :class="[
            $route.name === 'designData'
              ? 'bg-primary text-primary-contrast'
              : 'text-surface-700 dark:text-surface-300 hover:bg-surface-100 dark:hover:bg-surface-800',
          ]"
        >
          Data
        </RouterLink>
        <RouterLink
          :to="{ name: 'designPanel' }"
          class="px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-150 whitespace-nowrap"
          active-class="bg-primary text-primary-contrast"
          :class="[
            $route.name === 'designPanel'
              ? 'bg-primary text-primary-contrast'
              : 'text-surface-700 dark:text-surface-300 hover:bg-surface-100 dark:hover:bg-surface-800',
          ]"
        >
          Panel
        </RouterLink>
        <RouterLink
          :to="{ name: 'designOverlay' }"
          class="px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-150 whitespace-nowrap"
          active-class="bg-primary text-primary-contrast"
          :class="[
            $route.name === 'designOverlay'
              ? 'bg-primary text-primary-contrast'
              : 'text-surface-700 dark:text-surface-300 hover:bg-surface-100 dark:hover:bg-surface-800',
          ]"
        >
          Overlay
        </RouterLink>
        <RouterLink
          :to="{ name: 'designMessages' }"
          class="px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-150 whitespace-nowrap"
          active-class="bg-primary text-primary-contrast"
          :class="[
            $route.name === 'designMessages'
              ? 'bg-primary text-primary-contrast'
              : 'text-surface-700 dark:text-surface-300 hover:bg-surface-100 dark:hover:bg-surface-800',
          ]"
        >
          Messages
        </RouterLink>
        <RouterLink
          :to="{ name: 'designMisc' }"
          class="px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-150 whitespace-nowrap"
          active-class="bg-primary text-primary-contrast"
          :class="[
            $route.name === 'designMisc'
              ? 'bg-primary text-primary-contrast'
              : 'text-surface-700 dark:text-surface-300 hover:bg-surface-100 dark:hover:bg-surface-800',
          ]"
        >
          Misc
        </RouterLink>
      </nav>
    </div>

    <!-- Content Area -->
    <div class="flex-1 overflow-auto p-6">
      <router-view />
    </div>
  </div>
</template>

<script setup lang="ts">
import { RouterLink } from "vue-router";
</script>
