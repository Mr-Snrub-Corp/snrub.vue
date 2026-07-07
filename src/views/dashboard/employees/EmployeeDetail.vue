<template>
  <div
    class="px-6 py-4 md:px-12 md:py-6 lg:px-20 lg:py-8 bg-surface-50 dark:bg-surface-950 h-screen overflow-y-auto"
  >
    <div v-if="isLoading" class="flex justify-center py-20">
      <ProgressSpinner />
    </div>

    <template v-else-if="user">
      <!-- Header -->
      <div class="mb-4 flex justify-between items-center xl:w-3/4">
        <h1 class="text-3xl font-bold text-surface-900 dark:text-surface-0">Employee Details</h1>
        <Button
          v-if="authStore.isAdmin"
          label="Edit"
          icon="pi pi-pencil"
          severity="primary"
          data-testid="employees.detail.edit-btn"
          @click="router.push({ name: 'employeeEdit', params: { uid } })"
        />
      </div>

      <!-- Profile -->
      <div
        class="bg-surface-0 dark:bg-surface-900 p-6 shadow-sm rounded-2xl flex flex-col gap-6 mb-6 xl:w-3/4"
      >
        <div class="text-xl font-medium text-surface-900 dark:text-surface-0">Profile</div>
        <div class="flex gap-8 flex-col md:flex-row">
          <div class="flex-shrink-0">
            <img
              :src="getUserAvatar"
              :alt="user.name ? `${user.name} profile picture` : 'Employee profile picture'"
              class="h-32 w-32 rounded-lg object-cover border border-surface-300"
            />
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1">
            <div>
              <div class="text-sm text-zinc-500 dark:text-zinc-400 mb-1">Name</div>
              <div class="text-surface-900 dark:text-surface-0" data-testid="employees.detail.name">
                {{ user.name }}
              </div>
            </div>
            <div>
              <div class="text-sm text-zinc-500 dark:text-zinc-400 mb-1">Email</div>
              <div
                class="text-surface-900 dark:text-surface-0"
                data-testid="employees.detail.email"
              >
                {{ user.email }}
              </div>
            </div>
            <div>
              <div class="text-sm text-zinc-500 dark:text-zinc-400 mb-1">Role</div>
              <Tag
                :value="formatLabel(user.role)"
                severity="info"
                data-testid="employees.detail.role"
              />
            </div>
            <div>
              <div class="text-sm text-zinc-500 dark:text-zinc-400 mb-1">Status</div>
              <Tag
                :value="formatLabel(user.status)"
                :severity="getStatusSeverity(user.status)"
                data-testid="employees.detail.status"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Back -->
      <Button
        label="Back"
        icon="pi pi-arrow-left"
        variant="outlined"
        severity="secondary"
        data-testid="employees.detail.back-btn"
        @click="handleGoBack"
      />
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import { useUsersStore } from "@/stores/users";
import { formatLabel } from "@/utils";
import { USER_STATUS } from "@/constants/enums";
import Button from "primevue/button";
import Tag from "primevue/tag";
import ProgressSpinner from "primevue/progressspinner";

const route = useRoute();
const router = useRouter();
const uid = route.params.uid as string;

const authStore = useAuthStore();
const usersStore = useUsersStore();

const isLoading = ref(false);

const user = computed(() => usersStore.getUserById(uid));

const getUserAvatar = computed(() => {
  if (!user.value?.photo) {
    return "/img/avatar-placeholder.png";
  }
  return `data:image/png;base64,${user.value.photo}`;
});

function getStatusSeverity(status: string): string {
  switch (status) {
    case USER_STATUS.ACTIVE:
      return "success";
    case USER_STATUS.INACTIVE:
      return "warn";
    case USER_STATUS.SUSPENDED:
    case USER_STATUS.DECEASED:
      return "danger";
    default:
      return "info";
  }
}

function handleGoBack() {
  if (window.history.state.back) {
    router.back();
  } else {
    router.push({ name: "employeeEdit", params: { uid: user.value?.uid } });
  }
}

onMounted(async () => {
  isLoading.value = true;
  await usersStore.fetchUserById(uid);
  isLoading.value = false;
});
</script>

<style scoped></style>
