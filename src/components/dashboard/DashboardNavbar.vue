<template>
  <header
    class="flex justify-between items-center h-16 px-8 bg-surface-0 dark:bg-surface-900 relative lg:static border-b border-surface-200 dark:border-surface-700 shrink-0"
  >
    <div class="flex items-center gap-4">
      <button
        type="button"
        aria-label="Open navigation menu"
        :aria-expanded="drawerOpen"
        data-testid="nav.navbar.menu-btn"
        @click="$emit('toggle-drawer')"
        class="cursor-pointer flex items-center justify-center lg:hidden text-surface-700 dark:text-surface-100 bg-transparent border-0 p-0"
      >
        <i aria-hidden="true" class="pi pi-bars text-xl!" />
      </button>
      <Breadcrumb :home="home" :model="breadcrumbItems">
        <template #item="{ item, props }">
          <router-link v-if="item.route" v-slot="{ href, navigate }" :to="item.route" custom>
            <a
              :href="href"
              v-bind="props.action"
              :aria-label="!item.label && item.icon ? 'Dashboard home' : undefined"
              @click="navigate"
            >
              <span v-if="item.icon" :class="item.icon" aria-hidden="true" />
              <span>{{ item.label }}</span>
            </a>
          </router-link>
          <span v-else>{{ item.label }}</span>
        </template>
      </Breadcrumb>
    </div>
    <div class="flex items-center gap-8">
      <Avatar
        :image="userPhoto ? `data:image/png;base64,${userPhoto}` : undefined"
        :icon="userPhoto ? undefined : 'pi pi-user'"
        shape="circle"
        class="border border-surface-300"
        :aria-label="authStore.user?.name ? `${authStore.user.name}'s profile picture` : 'User profile picture'"
      />
    </div>
  </header>
</template>
<script setup lang="ts">
import Avatar from "primevue/avatar";
import Breadcrumb from "primevue/breadcrumb";
import { useAuthStore } from "@/stores/auth";
import { useUsersStore } from "@/stores/users";
import { formatBreadcrumbSegment } from "@/utils";
import { computed } from "vue";
import { useRoute } from "vue-router";

defineProps<{ drawerOpen?: boolean }>();
defineEmits<{ "toggle-drawer": [] }>();

const route = useRoute();
const authStore = useAuthStore();
const usersStore = useUsersStore();

const userPhoto = computed(() => {
  const uid = authStore.user?.uid;
  if (!uid) return undefined;
  return usersStore.getUserById(uid)?.photo;
});

const home = { icon: "pi pi-home", route: "/dashboard" };

const breadcrumbItems = computed(() => {
  const path = route.path.replace(/^\/dashboard\/?/, "");
  if (!path) return [];
  const segments = path.split("/").filter(Boolean);
  return segments.map((seg, i) => {
    const label = formatBreadcrumbSegment(seg, segments[i - 1]);
    const isLast = i === segments.length - 1;
    if (isLast) return { label };
    const route = "/dashboard/" + segments.slice(0, i + 1).join("/");
    return { label, route };
  });
});
</script>
