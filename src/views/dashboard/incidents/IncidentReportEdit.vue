<template>
  <div
    class="px-6 py-4 md:px-12 md:py-6 lg:px-20 lg:py-8 bg-surface-50 dark:bg-surface-950 h-screen overflow-y-auto"
  >
    <div v-if="isLoading" class="flex justify-center py-20">
      <ProgressSpinner />
    </div>

    <template v-else>
      <div class="mb-6">
        <h1 class="text-3xl font-bold text-surface-900 dark:text-surface-0">
          Edit Incident Report
        </h1>
      </div>

      <div class="bg-surface-0 dark:bg-surface-900 p-7 shadow rounded-2xl flex-auto xl:w-3/4">
        <div class="flex flex-col gap-7">
          <div class="text-xl font-medium text-surface-900 dark:text-surface-0">Details</div>

          <div class="flex flex-col gap-6">
            <!-- Description -->
            <div class="flex flex-col gap-2">
              <label for="description" class="text-surface-900 dark:text-surface-0"
                >Description</label
              >
              <Textarea
                id="description"
                v-model="formData.description"
                rows="5"
                auto-resize
                class="w-full"
                :invalid="v$.description.$error"
                :aria-invalid="v$.description.$error ? 'true' : undefined"
                :aria-describedby="v$.description.$error ? 'edit-description-error' : undefined"
                @blur="v$.description.$touch()"
              />
              <small v-if="v$.description.$error" id="edit-description-error" class="text-red-500">
                {{ v$.description.$errors[0]?.$message }}
              </small>
            </div>

            <!-- Severity -->
            <div class="flex flex-col gap-2 md:w-3/4">
              <label for="severity" class="text-surface-900 dark:text-surface-0">Severity</label>
              <InputNumber
                id="severity"
                v-model="formData.severity"
                :min="1"
                :max="7"
                show-buttons
                class="w-full"
                :invalid="v$.severity.$error"
                :aria-invalid="v$.severity.$error ? 'true' : undefined"
                :aria-describedby="v$.severity.$error ? 'edit-severity-error' : undefined"
                @blur="v$.severity.$touch()"
              />
              <small v-if="v$.severity.$error" id="edit-severity-error" class="text-red-500">
                {{ v$.severity.$errors[0]?.$message }}
              </small>
            </div>

            <!-- Status -->
            <div class="flex flex-col gap-2 md:w-3/4">
              <label for="status" class="text-surface-900 dark:text-surface-0">Status</label>
              <Select
                id="status"
                v-model="formData.status"
                :options="statusOptions"
                option-label="label"
                option-value="value"
                class="w-full"
                :invalid="v$.status.$error"
                :aria-invalid="v$.status.$error ? 'true' : undefined"
                :aria-describedby="v$.status.$error ? 'edit-status-error' : undefined"
                @blur="v$.status.$touch()"
              />
              <small v-if="v$.status.$error" id="edit-status-error" class="text-red-500">
                {{ v$.status.$errors[0]?.$message }}
              </small>
            </div>

            <!-- Escalation Level -->
            <div class="flex flex-col gap-2 md:w-3/4">
              <label for="escalationLevel" class="text-surface-900 dark:text-surface-0"
                >Escalation Level</label
              >
              <Select
                id="escalationLevel"
                v-model="formData.escalation_level"
                :options="escalationLevelOptions"
                option-label="label"
                option-value="value"
                class="w-full"
                :invalid="v$.escalation_level.$error"
                :aria-invalid="v$.escalation_level.$error ? 'true' : undefined"
                :aria-describedby="v$.escalation_level.$error ? 'edit-escalation-error' : undefined"
                @blur="v$.escalation_level.$touch()"
              />
              <small
                v-if="v$.escalation_level.$error"
                id="edit-escalation-error"
                class="text-red-500"
              >
                {{ v$.escalation_level.$errors[0]?.$message }}
              </small>
            </div>
          </div>

          <!-- Subjects -->
          <div class="flex flex-col gap-4">
            <div class="flex items-center justify-between">
              <div class="text-xl font-medium text-surface-900 dark:text-surface-0">Subjects</div>
              <Button
                v-if="!showAddSubject"
                label="Add Subject"
                icon="pi pi-plus"
                variant="text"
                severity="secondary"
                @click="showAddSubject = true"
              />
            </div>

            <div
              v-for="(subject, index) in formData.subjects"
              :key="subject.user_id"
              class="flex items-center justify-between rounded-xl border border-zinc-200 dark:border-zinc-700 p-4"
            >
              <div class="text-surface-900 dark:text-surface-0">
                {{ getSubjectName(subject.user_id) }}
              </div>
              <div class="flex items-center gap-2">
                <Tag :value="formatLabel(subject.role)" severity="info" />
                <Button
                  icon="pi pi-times"
                  :aria-label="`Remove ${getSubjectName(subject.user_id)}`"
                  severity="danger"
                  variant="text"
                  rounded
                  @click="removeSubject(index)"
                />
              </div>
            </div>

            <div v-if="!formData.subjects.length" class="text-sm text-zinc-500 dark:text-zinc-400">
              No subjects added
            </div>

            <!-- Add Subject -->
            <div v-if="showAddSubject" class="flex items-end gap-3">
              <div class="flex flex-col gap-2 flex-1">
                <label for="edit-subject-user" class="text-sm text-surface-900 dark:text-surface-0"
                  >User</label
                >
                <Select
                  id="edit-subject-user"
                  v-model="newSubject.user_id"
                  :options="availableUsers"
                  option-label="name"
                  option-value="uid"
                  placeholder="Select user"
                  filter
                  class="w-full"
                />
              </div>
              <div class="flex flex-col gap-2 flex-1">
                <label for="edit-subject-role" class="text-sm text-surface-900 dark:text-surface-0"
                  >Role</label
                >
                <Select
                  id="edit-subject-role"
                  v-model="newSubject.role"
                  :options="subjectRoleOptions"
                  option-label="label"
                  option-value="value"
                  placeholder="Select role"
                  class="w-full"
                />
              </div>
              <Button
                label="Add"
                icon="pi pi-plus"
                severity="secondary"
                :disabled="!newSubject.user_id || !newSubject.role"
                @click="addSubject"
              />
            </div>
          </div>

          <!-- Actions -->
          <div class="flex gap-3">
            <Button
              data-testid="incidents.edit-form.update-btn"
              label="Update Report"
              severity="primary"
              :disabled="v$.$invalid"
              @click="handleSubmit"
            />
            <Button
              data-testid="incidents.edit-form.cancel-btn"
              label="Cancel"
              severity="secondary"
              variant="outlined"
              @click="handleCancel"
            />
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import Button from "primevue/button";
import Select from "primevue/select";
import Textarea from "primevue/textarea";
import InputNumber from "primevue/inputnumber";
import Tag from "primevue/tag";
import ProgressSpinner from "primevue/progressspinner";
import { useVuelidate } from "@vuelidate/core";
import { required, helpers } from "@vuelidate/validators";
import { INCIDENT_STATUS, ESCALATION_LEVEL } from "@/constants/enums";
import { useIncidentReportsStore } from "@/stores/incidentReports";
import { useIncidentReportSubjects } from "@/composables/useIncidentReportSubjects";
import { formatLabel } from "@/utils";
import type {
  IncidentStatus,
  EscalationLevel,
  IncidentReportSubjectCreate,
} from "@/types/incidentReport";
import { useToast } from "primevue/usetoast";

const route = useRoute();
const router = useRouter();
const uid = route.params.uid as string;
const toast = useToast();

const incidentReportsStore = useIncidentReportsStore();

const isLoading = ref(false);

const formData = ref<{
  description: string;
  severity: number;
  status: IncidentStatus;
  escalation_level: EscalationLevel;
  subjects: IncidentReportSubjectCreate[];
}>({
  description: "",
  severity: 1,
  status: INCIDENT_STATUS.REPORTED,
  escalation_level: ESCALATION_LEVEL.NONE,
  subjects: [],
});

const {
  showAddSubject,
  newSubject,
  subjectRoleOptions,
  availableUsers,
  getSubjectName,
  addSubject,
  removeSubject,
  sharedRules,
} = useIncidentReportSubjects(formData);

// Options
const statusOptions = Object.values(INCIDENT_STATUS).map((s) => ({
  label: formatLabel(s),
  value: s,
}));

const escalationLevelOptions = Object.values(ESCALATION_LEVEL).map((e) => ({
  label: formatLabel(e),
  value: e,
}));

// Validation
const rules = {
  ...sharedRules,
  status: {
    required: helpers.withMessage("Status is required", required),
  },
  escalation_level: {
    required: helpers.withMessage("Escalation level is required", required),
  },
};

const v$ = useVuelidate(rules, formData);

// Initialize form from store
function initFormData() {
  const report = incidentReportsStore.getIncidentReportById(uid);
  if (report) {
    formData.value = {
      description: report.description ?? "",
      severity: report.severity,
      status: report.status,
      escalation_level: report.escalation_level,
      subjects: report.subjects.map((s) => ({
        user_id: s.user_id,
        role: s.role,
      })),
    };
  }
}

// Submit
async function handleSubmit() {
  const isValid = await v$.value.$validate();
  if (!isValid) return;

  try {
    await incidentReportsStore.updateIncidentReport(uid, {
      description: formData.value.description || null,
      severity: formData.value.severity,
      status: formData.value.status,
      escalation_level: formData.value.escalation_level,
      subjects: formData.value.subjects,
    });
    toast.add({
      severity: "success",
      summary: "Success",
      detail: "Incident report has been successfully updated",
      life: 3000,
    });
    router.push({ name: "incidentReportDetail", params: { uid } });
  } catch (error) {
    console.error("Error updating incident report:", error);
    toast.add({
      severity: "error",
      summary: "Error",
      detail: "Something went wrong with incident report update",
      life: 3000,
    });
  }
}

function handleCancel() {
  router.push({ name: "incidentReportDetail", params: { uid } });
}

onMounted(async () => {
  isLoading.value = true;
  await incidentReportsStore.fetchIncidentReportById(uid);
  initFormData();
  isLoading.value = false;
});
</script>

<style scoped></style>
