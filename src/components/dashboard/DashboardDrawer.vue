<template>
  <Drawer
    v-model:visible="visible"
    position="left"
    class="lg:hidden"
    pt:root:class="border-surface-800!"
    @hide="visible = false"
  >
    <template #container="{ closeCallback }">
      <div class="flex flex-col h-full bg-surface-900 !border-red-300">
        <div class="flex items-center justify-center shrink-0 bg-primary p-4 min-h-[4.71rem]">
          <RouterLink to="/dashboard">
            <DashboardLogo />
          </RouterLink>
        </div>
        <div class="flex-1 p-4 flex flex-col gap-2">
          <RouterLink
            v-for="item in navItems"
            :key="item.label"
            :to="item.to"
            @click="closeCallback"
            class="w-full flex flex-row items-center cursor-pointer p-2 rounded-lg text-surface-400 border border-transparent hover:bg-surface-800 hover:border-surface-700 hover:text-surface-0 transition-colors duration-150 group"
          >
            <i
              aria-hidden="true"
              :class="item.icon"
              class="text-xl! leading-tight! text-surface-400 group-hover:text-surface-0"
            />
            <span class="ml-2 font-medium text-base leading-tight">{{ item.label }}</span>
          </RouterLink>
        </div>
        <div class="mt-auto flex flex-col pt-4 pb-6 px-4 gap-4">
          <hr class="w-full border-t border-surface-800" />
          <button
            type="button"
            @click="$emit('logout')"
            class="cursor-pointer inline-flex items-center gap-2 text-surface-400 hover:text-surface-0 transition-colors duration-150 bg-transparent border-0 p-0"
          >
            <i aria-hidden="true" class="pi pi-sign-out text-xl" />
            <span class="font-medium text-base">Logout</span>
          </button>
        </div>
      </div>
    </template>
  </Drawer>
</template>

<script setup lang="ts">
import Drawer from "primevue/drawer";
import { RouterLink } from "vue-router";
import DashboardLogo from "./DashboardLogo.vue";
import { navItems } from "./navItems";

const visible = defineModel<boolean>({ required: true });

defineEmits<{
  logout: [];
}>();
</script>
