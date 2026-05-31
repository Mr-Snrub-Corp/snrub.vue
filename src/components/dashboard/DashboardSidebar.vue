<template>
  <div
    id="app-sidebar"
    class="bg-surface-900 h-screen hidden lg:flex shrink-0 absolute lg:static left-0 top-0 z-10 lg:w-56 w-72 select-none flex-col"
  >
    <div
      class="flex items-center justify-center shrink-0 bg-primary border-r border-primary h-16 px-4"
    >
      <RouterLink to="/dashboard">
        <DashboardLogo />
      </RouterLink>
    </div>
    <div class="flex-1 p-3 flex flex-col gap-1 border-r border-surface-800 overflow-y-auto">
      <RouterLink
        v-for="item in navItems"
        :key="item.label"
        :to="item.to"
        :data-testid="item.testId"
        :class="[
          'w-full flex flex-row items-center cursor-pointer px-3 py-2 rounded-lg border transition-colors duration-150 group gap-3',
          isActive(item.to)
            ? 'bg-surface-800 border-surface-700 text-surface-0'
            : 'text-surface-400 border-transparent hover:bg-surface-800 hover:border-surface-700 hover:text-surface-0',
        ]"
      >
        <i
          :class="[
            item.icon,
            'text-lg! leading-none! shrink-0',
            isActive(item.to) ? 'text-surface-0' : 'text-surface-400 group-hover:text-surface-0',
          ]"
        />
        <span class="font-medium text-sm leading-tight truncate">{{ item.label }}</span>
      </RouterLink>
    </div>
    <div class="p-3 border-r border-surface-800">
      <hr class="border-t border-surface-800 mb-3" />
      <button
        @click="$emit('logout')"
        class="w-full flex flex-row items-center cursor-pointer px-3 py-2 rounded-lg border border-transparent text-surface-400 hover:bg-surface-800 hover:border-surface-700 hover:text-surface-0 transition-colors duration-150 group gap-3"
        data-testid="nav.sidebar.logout-btn"
      >
        <i class="pi pi-sign-out text-lg! leading-none! shrink-0 text-surface-400 group-hover:text-surface-0" />
        <span class="font-medium text-sm leading-tight truncate">Logout</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { RouterLink, useRoute, useRouter } from "vue-router";
import type { RouteLocationRaw } from "vue-router";
import DashboardLogo from "./DashboardLogo.vue";
import { navItems } from "./navItems";

defineEmits<{
  logout: [];
}>();

const route = useRoute();
const router = useRouter();

function isActive(to: RouteLocationRaw): boolean {
  const resolved = router.resolve(to);
  if (resolved.path === "/dashboard") {
    return route.path === "/dashboard";
  }
  return route.path.startsWith(resolved.path);
}
</script>
