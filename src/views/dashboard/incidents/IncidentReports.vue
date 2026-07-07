<template>
  <div class="px-6 py-4 md:px-12 md:py-6 lg:px-20 lg:py-8 bg-surface-50 dark:bg-surface-950">
    <div class="mb-4 flex justify-between items-center">
      <h1 class="text-3xl font-bold text-surface-900 dark:text-surface-0">Incident Reports</h1>
      <Button
        label="Create Report"
        icon="pi pi-plus"
        severity="primary"
        @click="router.push({ name: 'incidentReportCreate' })"
      />
    </div>

    <!-- Skeleton loader -->
    <DataTable v-if="isLoading" :value="skeletonRows" class="shadow-sm rounded-2xl overflow-hidden">
      <Column header="Incident Type">
        <template #body><Skeleton /></template>
      </Column>
      <Column header="Severity">
        <template #body><Skeleton width="2rem" borderRadius="9999px" /></template>
      </Column>
      <Column header="Status">
        <template #body><Skeleton width="5rem" /></template>
      </Column>
      <Column header="Escalation Level">
        <template #body><Skeleton width="5rem" /></template>
      </Column>
      <Column header="Reported By">
        <template #body><Skeleton /></template>
      </Column>
      <Column header="Occurred">
        <template #body><Skeleton /></template>
      </Column>
      <Column>
        <template #body><Skeleton shape="circle" size="2rem" /></template>
      </Column>
    </DataTable>

    <!-- Data table -->
    <DataTable
      v-else
      v-model:filters="filters"
      :value="tableData"
      paginator
      :rows="10"
      dataKey="uid"
      filterDisplay="row"
      :globalFilterFields="['incidentTypeName', 'reportedByName']"
      class="shadow-sm rounded-2xl overflow-hidden"
    >
      <template #header>
        <div class="flex justify-end">
          <IconField>
            <InputIcon class="pi pi-search" />
            <InputText
              v-model="filters['global'].value"
              placeholder="Keyword Search"
              aria-label="Search incident reports"
            />
          </IconField>
        </div>
      </template>
      <template #empty>No incident reports found.</template>

      <Column field="incidentTypeName" header="Incident Type" :showFilterMenu="false">
        <template #body="{ data }">
          {{ data.incidentTypeName }}
        </template>
        <template #filter="{ filterModel, filterCallback }">
          <InputText
            v-model="filterModel.value"
            type="text"
            placeholder="Search"
            aria-label="Filter by incident type"
            class="w-full"
            @input="filterCallback()"
          />
        </template>
      </Column>

      <Column field="severity" header="Severity" :showFilterMenu="false">
        <template #body="{ data }">
          <SeverityBadge :severity="data.severity" />
        </template>
        <template #filter="{ filterModel, filterCallback }">
          <MultiSelect
            v-model="filterModel.value"
            :options="severityOptions"
            placeholder="Any"
            :maxSelectedLabels="1"
            class="w-full"
            @change="filterCallback()"
          >
            <template #option="slotProps">
              <SeverityBadge :severity="slotProps.option" />
            </template>
          </MultiSelect>
        </template>
      </Column>

      <Column field="status" header="Status" :showFilterMenu="false">
        <template #body="{ data }">
          <Tag :value="formatLabel(data.status)" :severity="getTagSeverity(data.status)" />
        </template>
        <template #filter="{ filterModel, filterCallback }">
          <MultiSelect
            v-model="filterModel.value"
            :options="statusOptions"
            placeholder="Any"
            :maxSelectedLabels="1"
            class="w-full"
            @change="filterCallback()"
          >
            <template #option="slotProps">
              <Tag
                :value="formatLabel(slotProps.option)"
                :severity="getTagSeverity(slotProps.option)"
              />
            </template>
          </MultiSelect>
        </template>
      </Column>

      <Column field="escalation_level" header="Escalation Level" :showFilterMenu="false">
        <template #body="{ data }">
          <Tag
            :value="formatLabel(data.escalation_level)"
            :severity="getEscalationSeverity(data.escalation_level)"
          />
        </template>
        <template #filter="{ filterModel, filterCallback }">
          <MultiSelect
            v-model="filterModel.value"
            :options="escalationOptions"
            placeholder="Any"
            :maxSelectedLabels="1"
            class="w-full"
            @change="filterCallback()"
          >
            <template #option="slotProps">
              <Tag
                :value="formatLabel(slotProps.option)"
                :severity="getEscalationSeverity(slotProps.option)"
              />
            </template>
          </MultiSelect>
        </template>
      </Column>

      <Column field="reportedByName" header="Reported By" :showFilterMenu="false">
        <template #body="{ data }">
          {{ data.reportedByName }}
        </template>
        <template #filter="{ filterModel, filterCallback }">
          <MultiSelect
            v-model="filterModel.value"
            :options="userOptions"
            placeholder="Any"
            :maxSelectedLabels="1"
            class="w-full"
            filter
            @change="filterCallback()"
          />
        </template>
      </Column>

      <Column field="occurredDate" header="Occurred" dataType="date" :showFilterMenu="false">
        <template #body="{ data }">
          {{ formatDate(data.occurred_at) }}
        </template>
        <template #filter="{ filterModel, filterCallback }">
          <DatePicker
            v-model="filterModel.value"
            selectionMode="range"
            hideOnRangeSelection
            showClear
            dateFormat="mm/dd/yy"
            placeholder="Date range"
            class="w-full"
            @date-select="filterCallback()"
          />
        </template>
      </Column>

      <Column>
        <template #body="{ data }">
          <Button
            icon="pi pi-eye"
            aria-label="View incident report"
            severity="secondary"
            variant="text"
            rounded
            @click="router.push({ name: 'incidentReportDetail', params: { uid: data.uid } })"
          />
        </template>
      </Column>
    </DataTable>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeMount, ref } from "vue";
import { useRouter } from "vue-router";
import { FilterMatchMode } from "@primevue/core/api";
import { useIncidentReportsStore } from "@/stores/incidentReports";
import { useIncidentTypesStore } from "@/stores/incidentTypes";
import { useUsersStore } from "@/stores/users";
import { formatDate, formatLabel } from "@/utils";
import { getTagSeverity, getEscalationSeverity } from "@/utils/incident";
import { INCIDENT_STATUS, ESCALATION_LEVEL } from "@/constants/enums";
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import Tag from "primevue/tag";
import Button from "primevue/button";
import Skeleton from "primevue/skeleton";
import InputText from "primevue/inputtext";
import MultiSelect from "primevue/multiselect";
import DatePicker from "primevue/datepicker";
import IconField from "primevue/iconfield";
import InputIcon from "primevue/inputicon";
import SeverityBadge from "@/components/SeverityBadge.vue";

const router = useRouter();
const incidentReportsStore = useIncidentReportsStore();
const incidentTypesStore = useIncidentTypesStore();
const usersStore = useUsersStore();

const isLoading = ref(true);
const skeletonRows = new Array(10).fill({});

const filters = ref({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS },
  incidentTypeName: { value: null, matchMode: FilterMatchMode.CONTAINS },
  severity: { value: null, matchMode: FilterMatchMode.IN },
  status: { value: null, matchMode: FilterMatchMode.IN },
  escalation_level: { value: null, matchMode: FilterMatchMode.IN },
  reportedByName: { value: null, matchMode: FilterMatchMode.IN },
  occurredDate: { value: null, matchMode: FilterMatchMode.BETWEEN },
});

const severityOptions = [1, 2, 3, 4, 5, 6, 7];
const statusOptions = Object.values(INCIDENT_STATUS);
const escalationOptions = Object.values(ESCALATION_LEVEL);
const userOptions = computed(() => usersStore.getAllUsers.map((u) => u.name));

function getIncidentTypeName(incidentTypeId: string): string {
  const type = incidentTypesStore.getIncidentTypeById(incidentTypeId);
  return type?.name ?? "";
}

function getUserName(userId: string): string {
  const user = usersStore.getUserById(userId);
  return user?.name ?? "";
}

const tableData = computed(() =>
  incidentReportsStore.getAllIncidentReports.map((report) => ({
    ...report,
    incidentTypeName: getIncidentTypeName(report.incident_type_id),
    reportedByName: getUserName(report.reported_by_user_id),
    occurredDate: new Date(report.occurred_at),
  })),
);

onBeforeMount(async () => {
  await incidentReportsStore.fetchIncidentReports();
  isLoading.value = false;
});
</script>

<style scoped></style>
