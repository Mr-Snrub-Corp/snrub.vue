<template>
  <div class="min-h-screen flex relative lg:static bg-surface-50 dark:bg-surface-950">
    <DashboardSidebar @logout="handleLogout" />
    <DashboardDrawer v-model="drawerVisible" @logout="handleLogout" />
    <div class="h-screen flex flex-col relative flex-auto">
      <DashboardNavbar :drawer-open="drawerVisible" @toggle-drawer="drawerVisible = true" />
      <div
        v-if="isLoading"
        class="flex justify-center items-center h-full"
        role="status"
        aria-label="Loading dashboard"
      >
        <ProgressSpinner />
      </div>
      <main
        v-else
        id="main-content"
        class="flex flex-col flex-auto min-h-0 overflow-y-auto bg-surface-0 dark:bg-surface-950"
      >
        <router-view />
      </main>
    </div>
  </div>
</template>
<script setup lang="ts">
import ProgressSpinner from "primevue/progressspinner";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar.vue";
import DashboardDrawer from "@/components/dashboard/DashboardDrawer.vue";
import DashboardNavbar from "@/components/dashboard/DashboardNavbar.vue";
import { useUsersStore } from "@/stores/users";
import { useAuthStore } from "@/stores/auth";
import { onBeforeMount, ref } from "vue";
import { useRouter } from "vue-router";
import { useIncidentTypesStore } from "@/stores/incidentTypes";
import { useIncidentReportsStore } from "@/stores/incidentReports";
import { useGodModeStore } from "@/stores/godMode";

const router = useRouter();
const usersStore = useUsersStore();
const incidentTypesStore = useIncidentTypesStore();
const authStore = useAuthStore();
const incidentReportsStore = useIncidentReportsStore();
const godModeStore = useGodModeStore();
const isLoading = ref(false);
const drawerVisible = ref(false);

async function handleLogout() {
  await authStore.logout();
  usersStore.$reset();
  incidentTypesStore.$reset();
  incidentReportsStore.$reset();
  godModeStore.$reset();
  router.push({ name: "Login" });
}

onBeforeMount(async () => {
  isLoading.value = true;
  const requests: Promise<unknown>[] = [
    usersStore.fetchUsers(),
    incidentTypesStore.fetchIncidentTypes(),
  ];
  if (authStore.isSuperAdmin) {
    requests.push(godModeStore.fetchActuators().catch(() => undefined));
  }

  await Promise.all(requests);
  isLoading.value = false;
});
</script>
