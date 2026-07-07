<template>
  <div
    class="px-6 py-4 md:px-12 md:py-6 lg:px-20 lg:py-8 bg-surface-50 dark:bg-surface-950 h-screen overflow-y-auto"
  >
    <div v-if="isLoading" class="flex justify-center py-20">
      <ProgressSpinner />
    </div>

    <template v-else-if="report">
      <!-- Header -->
      <div class="mb-4 flex justify-between items-center xl:w-3/4">
        <h1 class="text-3xl font-bold text-surface-900 dark:text-surface-0">Incident Report</h1>
        <Button
          v-if="authStore.isAdmin"
          label="Edit"
          icon="pi pi-pencil"
          severity="primary"
          @click="router.push({ name: 'incidentReportEdit', params: { uid } })"
        />
      </div>

      <!-- Details -->
      <div
        class="bg-surface-0 dark:bg-surface-900 p-6 shadow-sm rounded-2xl flex flex-col gap-6 mb-6 xl:w-3/4"
      >
        <div class="text-xl font-medium text-surface-900 dark:text-surface-0">Details</div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div class="text-sm text-zinc-500 dark:text-zinc-400 mb-1">Incident Type</div>
            <div class="text-surface-900 dark:text-surface-0">
              {{ incidentTypeName }}
            </div>
          </div>
          <div>
            <div class="text-sm text-zinc-500 dark:text-zinc-400 mb-1">Status</div>
            <Tag :severity="getTagSeverity(report.status)" :value="formatLabel(report.status)" />
          </div>
          <div>
            <div class="text-sm text-zinc-500 dark:text-zinc-400 mb-1">Severity</div>
            <div class="text-surface-900 dark:text-surface-0">{{ report.severity }}</div>
          </div>
          <div>
            <div class="text-sm text-zinc-500 dark:text-zinc-400 mb-1">Escalation Level</div>
            <Tag
              :value="formatLabel(report.escalation_level)"
              :severity="getEscalationSeverity(report.escalation_level)"
            />
          </div>
        </div>
        <div v-if="report.description">
          <div class="text-sm text-zinc-500 dark:text-zinc-400 mb-1">Description</div>
          <div class="text-surface-900 dark:text-surface-0">{{ report.description }}</div>
        </div>
      </div>

      <!-- Timeline -->
      <div
        class="bg-surface-0 dark:bg-surface-900 p-6 shadow-sm rounded-2xl flex flex-col gap-6 mb-6 xl:w-3/4"
      >
        <div class="text-xl font-medium text-surface-900 dark:text-surface-0">Timeline</div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div class="text-sm text-zinc-500 dark:text-zinc-400 mb-1">Occurred At</div>
            <div class="text-surface-900 dark:text-surface-0">
              {{ formatDate(report.occurred_at) }} : {{ formatTime(report.occurred_at) }}
            </div>
          </div>
          <div>
            <div class="text-sm text-zinc-500 dark:text-zinc-400 mb-1">Reported By</div>
            <div class="text-surface-900 dark:text-surface-0">{{ reportedByName }}</div>
          </div>
        </div>
      </div>

      <!-- Subjects -->
      <div
        v-if="report.subjects && report.subjects.length"
        class="bg-surface-0 dark:bg-surface-900 p-6 shadow-sm rounded-2xl flex flex-col gap-6 mb-6 xl:w-3/4"
      >
        <div class="text-xl font-medium text-surface-900 dark:text-surface-0">Subjects</div>
        <div class="flex flex-col gap-4">
          <div
            v-for="subject in report.subjects"
            :key="subject.uid"
            class="flex items-center justify-between rounded-xl border border-zinc-200 dark:border-zinc-700 p-4"
          >
            <div class="text-surface-900 dark:text-surface-0">
              {{ getSubjectName(subject.user_id) }}
            </div>
            <Tag :value="formatLabel(subject.role)" severity="info" />
          </div>
        </div>
      </div>

      <!-- Back -->
      <Button
        label="Back"
        icon="pi pi-arrow-left"
        variant="outlined"
        severity="secondary"
        @click="handleGoBack"
      />
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import { useIncidentReportsStore } from "@/stores/incidentReports";
import { useIncidentTypesStore } from "@/stores/incidentTypes";
import { useUsersStore } from "@/stores/users";
import { formatDate, formatTime, formatLabel } from "@/utils";
import { getTagSeverity, getEscalationSeverity } from "@/utils/incident";
import Button from "primevue/button";
import Tag from "primevue/tag";
import ProgressSpinner from "primevue/progressspinner";

const route = useRoute();
const router = useRouter();
const uid = route.params.uid as string;

const authStore = useAuthStore();
const incidentReportsStore = useIncidentReportsStore();
const incidentTypesStore = useIncidentTypesStore();
const usersStore = useUsersStore();

const isLoading = ref(false);

const report = computed(() => incidentReportsStore.getIncidentReportById(uid));

const incidentTypeName = computed(() => {
  if (!report.value) return "";
  const type = incidentTypesStore.getIncidentTypeById(report.value.incident_type_id);
  return type?.name ?? "";
});

const reportedByName = computed(() => {
  if (!report.value) return "";
  const user = usersStore.getUserById(report.value.reported_by_user_id);
  return user?.name ?? "";
});

function getSubjectName(userId: string) {
  const user = usersStore.getUserById(userId);
  return user?.name ?? userId;
}

function handleGoBack() {
  // Check if a previous history entry exists within the current session
  if (window.history.state.back) {
    router.back(); // Equivalent to router.go(-1)
  } else {
    // Fallback: if no history exists, redirect to a specific page (e.g., home)
    router.push({ name: "incidentReports" });
  }
}

onMounted(async () => {
  isLoading.value = true;
  await incidentReportsStore.fetchIncidentReportById(uid);
  isLoading.value = false;
});
</script>

<style scoped></style>
