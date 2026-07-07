<template>
  <div
    class="px-6 py-4 md:px-12 md:py-6 lg:px-20 lg:py-8 bg-surface-50 dark:bg-surface-950 min-h-full overflow-hidden"
  >
    <!-- Header with Add User Button -->
    <div class="mb-4 flex justify-between items-center">
      <h1 class="text-3xl font-bold text-surface-900 dark:text-surface-0">Dashboard</h1>
    </div>

    <!-- Skeleton loading state -->
    <template v-if="isLoading">
      <div class="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4 pt-8 mb-4">
        <div
          v-for="i in 4"
          :key="i"
          class="bg-surface-0 dark:bg-surface-900 shadow-sm p-5 rounded-2xl flex flex-col gap-4"
        >
          <div class="flex justify-between gap-4">
            <Skeleton width="8rem" height="1rem" />
            <Skeleton width="2.5rem" height="2.5rem" borderRadius="8px" />
          </div>
          <div class="flex-1 flex items-end">
            <Skeleton width="100%" height="1rem" />
          </div>
        </div>
      </div>

      <div class="bg-surface-0 dark:bg-surface-900 p-6 shadow-sm rounded-2xl flex flex-col gap-8">
        <Skeleton width="12rem" height="1.25rem" />
        <div class="flex flex-col gap-4">
          <div
            v-for="i in 3"
            :key="i"
            class="flex items-center justify-between gap-4 p-4 rounded-xl border border-surface-200 dark:border-surface-700"
          >
            <div class="flex flex-col gap-1">
              <Skeleton width="8rem" height="1rem" />
              <Skeleton width="6rem" height="0.875rem" />
            </div>
            <div class="flex items-center gap-2">
              <Skeleton width="5rem" height="1.5rem" borderRadius="16px" />
              <Skeleton shape="circle" size="2rem" />
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- Loaded content -->
    <template v-else>
      <div class="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4 pt-8 mb-4">
        <Card v-for="card in statCards" :key="card.title" class="stat-card">
          <template #content>
            <div class="flex justify-between items-center mb-4">
              <span class="text-surface-700 dark:text-surface-300 font-semibold leading-tight">
                {{ card.title }}
              </span>
              <div
                :class="[card.gradient, 'flex items-center justify-center rounded-lg w-10 h-10']"
              >
                <i
                  :class="[
                    card.icon,
                    'text-surface-0 dark:text-surface-900 text-xl! leading-none!',
                  ]"
                />
              </div>
            </div>
            <div class="flex-1 flex gap-1">
              <span
                class="text-surface-600 dark:text-surface-300 leading-tight"
                v-html="card.copy"
              />
            </div>
          </template>
        </Card>
      </div>

      <div class="bg-surface-0 dark:bg-surface-900 p-6 shadow-sm rounded-2xl flex flex-col gap-8">
        <div class="font-medium text-xl text-surface-900 dark:text-surface-0 leading-tight">
          Critical Activity Log
        </div>
        <div v-if="criticalActivityLog.length === 0" class="text-surface-500 dark:text-surface-400">
          No critical activity in the last 7 days
        </div>
        <div v-else class="flex flex-col gap-4">
          <div
            v-for="report in criticalActivityLog"
            :key="report.uid"
            class="flex items-center justify-between gap-4 p-4 rounded-xl border border-surface-200 dark:border-surface-700"
          >
            <div class="flex flex-col gap-1">
              <div class="flex items-center gap-2">
                <span class="text-surface-900 dark:text-surface-0 font-medium leading-tight">
                  {{ getReportedByName(report.reported_by_user_id) }}
                </span>
                <span class="text-surface-500 dark:text-surface-400 leading-tight">·</span>
                <span class="text-surface-500 dark:text-surface-400 text-sm leading-tight">
                  {{ timeAgo(report.occurred_at) }}
                </span>
              </div>
              <span class="text-surface-700 dark:text-surface-200 text-sm">
                {{ getIncidentTypeName(report.incident_type_id) }}
              </span>
            </div>
            <div class="flex items-center gap-2">
              Escalation Level:
              <Tag
                :value="formatLabel(report.escalation_level)"
                :severity="getEscalationSeverity(report.escalation_level)"
              />
              <Button
                icon="pi pi-eye"
                variant="text"
                severity="secondary"
                rounded
                @click="router.push({ name: 'incidentReportDetail', params: { uid: report.uid } })"
              />
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { INCIDENT_STATUS, ESCALATION_LEVEL } from "@/constants/enums";
import { useIncidentReportsStore } from "@/stores/incidentReports";
import { useIncidentTypesStore } from "@/stores/incidentTypes";
import { useUsersStore } from "@/stores/users";
import type { IncidentReport } from "@/types/incidentReport";
import { formatLabel, timeAgo } from "@/utils";
import { GRADIENTS } from "@/utils/gradients";
import { getEscalationSeverity } from "@/utils/incident";
import Button from "primevue/button";
import Card from "primevue/card";
import Skeleton from "primevue/skeleton";
import Tag from "primevue/tag";
import { computed, onBeforeMount, ref } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();
const incidentReportsStore = useIncidentReportsStore();
const incidentTypesStore = useIncidentTypesStore();
const usersStore = useUsersStore();

const recentReports = ref<IncidentReport[]>([]);
const isLoading = ref(true);

const majorAccidents = computed(() => recentReports.value.filter((r) => r.severity >= 7));

const accidents = computed(() =>
  recentReports.value.filter((r) => r.severity >= 4 && r.severity <= 6),
);

const incidents = computed(() =>
  recentReports.value.filter((r) => r.severity >= 1 && r.severity <= 3),
);

const reportsNotActioned = computed(() =>
  recentReports.value.filter((r) => r.status === INCIDENT_STATUS.REPORTED),
);

interface DashboardStatCard {
  title: string;
  icon: string;
  gradient: string;
  copy: string;
}

const statCards = computed<DashboardStatCard[]>(() => {
  const hasNoAccidents = accidents.value.length === 0;
  const hasNoIncidents = incidents.value.length === 0;

  return [
    {
      title: "Major Accidents",
      icon: "pi pi-exclamation-triangle",
      gradient: GRADIENTS.fuchsia,
      copy: `<b>${majorAccidents.value.length}</b> Major accident${majorAccidents.value.length > 1 ? "s" : ""} reported in the last 7 days`,
    },
    {
      title: "Accidents",
      icon: hasNoAccidents ? "pi pi-check-circle" : "pi pi-exclamation-circle",
      gradient: hasNoAccidents ? GRADIENTS.success : GRADIENTS.danger,
      copy: hasNoAccidents
        ? "No Accidents reported in the last 7 days"
        : `<b>${accidents.value.length}</b> Accident${accidents.value.length > 1 ? "s" : ""} reported in the last 7 days`,
    },
    {
      title: "Incidents",
      icon: hasNoIncidents ? "pi pi-check-circle" : "pi pi-exclamation-circle",
      gradient: hasNoIncidents ? GRADIENTS.success : GRADIENTS.warn,
      copy: hasNoIncidents
        ? "No Incidents reported in the last 7 days"
        : `<b>${incidents.value.length}</b> Incident${incidents.value.length > 1 ? "s" : ""} reported in the last 7 days`,
    },
    {
      title: "Awaiting review",
      icon: "pi pi-info-circle",
      gradient: GRADIENTS.info,
      copy: `<b>${reportsNotActioned.value.length}</b> incidents reported in the last 7 days`,
    },
  ];
});

const criticalActivityLog = computed(() => {
  const seen = new Set<string>();
  const result: IncidentReport[] = [];

  // 1. Emergency state declared
  for (const r of recentReports.value) {
    if (r.escalation_level === ESCALATION_LEVEL.EMERGENCY_STATE_DECLARED && !seen.has(r.uid)) {
      result.push(r);
      seen.add(r.uid);
    }
  }

  // 2. Escalated
  for (const r of recentReports.value) {
    if (r.escalation_level === ESCALATION_LEVEL.ESCALATED && !seen.has(r.uid)) {
      result.push(r);
      seen.add(r.uid);
    }
  }

  // 3. Severity >= 4
  for (const r of recentReports.value) {
    if (r.severity >= 4 && !seen.has(r.uid)) {
      result.push(r);
      seen.add(r.uid);
    }
  }

  return result;
});

function getReportedByName(userId: string): string {
  return usersStore.getUserById(userId)?.name ?? userId;
}

function getIncidentTypeName(typeId: string): string {
  return incidentTypesStore.getIncidentTypeById(typeId)?.name ?? "";
}

onBeforeMount(async () => {
  const endDate = new Date();
  const startDate = new Date(endDate);
  startDate.setDate(startDate.getDate() - 7);

  const response = await incidentReportsStore.fetchIncidentReports({
    date_from: startDate.toISOString(),
    date_to: endDate.toISOString(),
  });
  recentReports.value = response;
  isLoading.value = false;
});
</script>

<style scoped></style>
