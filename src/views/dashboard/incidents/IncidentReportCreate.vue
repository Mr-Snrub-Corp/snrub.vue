<template>
  <div class="px-6 py-4 md:px-12 md:py-6 lg:px-20 lg:py-8 bg-surface-50 dark:bg-surface-950 h-screen overflow-y-auto">
    <div class="mb-6">
      <h1 class="text-3xl font-bold text-surface-900 dark:text-surface-0">
        Create Incident Report
      </h1>
    </div>

    <div class="bg-surface-0 dark:bg-surface-900 p-7 shadow rounded-2xl flex-auto xl:w-3/4">
      <div class="flex flex-col gap-7">
        <div class="text-xl font-medium text-surface-900 dark:text-surface-0">Details</div>

        <div class="flex flex-col gap-6 ">
          <!-- Incident Type -->
          <div class="flex flex-col gap-2 md:w-3/4"">
            <label for="incidentType" class="text-surface-900 dark:text-surface-0"
              >Incident Type *</label
            >
            <Select
              id="incidentType"
              v-model="formData.incident_type_id"
              :options="incidentTypesStore.getAllIncidentTypes"
              option-label="name"
              option-value="uid"
              placeholder="Select incident type"
              class="w-full"
              :invalid="v$.incident_type_id.$error"
              :aria-invalid="v$.incident_type_id.$error ? 'true' : undefined"
              :aria-describedby="v$.incident_type_id.$error ? 'incidentType-error' : undefined"
              @blur="v$.incident_type_id.$touch()"
            />
            <small v-if="v$.incident_type_id.$error" id="incidentType-error" class="text-red-500">
              {{ v$.incident_type_id.$errors[0]?.$message }}
            </small>
          </div>

          <!-- Occurred At -->
          <div class="flex flex-col gap-2 md:w-3/4">
            <label for="occurredAt" class="text-surface-900 dark:text-surface-0"
              >Occurred At *</label
            >
            <DatePicker
              id="occurredAt"
              v-model="formData.occurred_at"
              showTime
              class="w-full"
              :invalid="v$.occurred_at.$error"
              :aria-invalid="v$.occurred_at.$error ? 'true' : undefined"
              :aria-describedby="v$.occurred_at.$error ? 'occurredAt-error' : undefined"
              @blur="v$.occurred_at.$touch()"
            />
            <small v-if="v$.occurred_at.$error" id="occurredAt-error" class="text-red-500">
              {{ v$.occurred_at.$errors[0]?.$message }}
            </small>
          </div>

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
              :aria-describedby="v$.description.$error ? 'description-error' : undefined"
              @blur="v$.description.$touch()"
            />
            <small v-if="v$.description.$error" id="description-error" class="text-red-500">
              {{ v$.description.$errors[0]?.$message }}
            </small>
          </div>

          <!-- Severity -->
          <div class="flex flex-col gap-2 md:w-3/4">
            <label for="severity" class="text-surface-900 dark:text-surface-0">Severity *</label>
            <InputNumber
              id="severity"
              v-model="formData.severity"
              :min="1"
              :max="7"
              show-buttons
              class="w-full"
              :invalid="v$.severity.$error"
              :aria-invalid="v$.severity.$error ? 'true' : undefined"
              :aria-describedby="v$.severity.$error ? 'severity-error' : undefined"
              @blur="v$.severity.$touch()"
            />
            <small v-if="v$.severity.$error" id="severity-error" class="text-red-500">
              {{ v$.severity.$errors[0]?.$message }}
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
              <label for="subject-user" class="text-sm text-surface-900 dark:text-surface-0">User</label>
              <Select
                id="subject-user"
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
              <label for="subject-role" class="text-sm text-surface-900 dark:text-surface-0">Role</label>
              <Select
                id="subject-role"
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
            label="Create Report"
            severity="primary"
            :disabled="v$.$invalid"
            @click="handleSubmit"
          />
          <Button label="Cancel" severity="secondary" variant="outlined" @click="handleCancel" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import Button from "primevue/button";
import Select from "primevue/select";
import Textarea from "primevue/textarea";
import InputNumber from "primevue/inputnumber";
import DatePicker from "primevue/datepicker";
import Tag from "primevue/tag";
import { useVuelidate } from "@vuelidate/core";
import { required, helpers } from "@vuelidate/validators";
import { useIncidentReportsStore } from "@/stores/incidentReports";
import { useIncidentTypesStore } from "@/stores/incidentTypes";
import { useIncidentReportSubjects } from "@/composables/useIncidentReportSubjects";
import { formatLabel } from "@/utils";
import type { IncidentReportSubjectCreate } from "@/types/incidentReport";
import { useToast } from "primevue/usetoast";

const router = useRouter();
const toast = useToast();

const incidentReportsStore = useIncidentReportsStore();
const incidentTypesStore = useIncidentTypesStore();

const formData = ref<{
  incident_type_id: string;
  occurred_at: Date | null;
  description: string;
  severity: number;
  subjects: IncidentReportSubjectCreate[];
}>({
  incident_type_id: "",
  occurred_at: null,
  description: "",
  severity: 1,
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

const rules = {
  ...sharedRules,
  incident_type_id: {
    required: helpers.withMessage("Incident type is required", required),
  },
  occurred_at: {
    required: helpers.withMessage("Occurred at is required", required),
  },
};

const v$ = useVuelidate(rules, formData);

async function handleSubmit() {
  const isValid = await v$.value.$validate();
  if (!isValid) return;

  try {
    const response = await incidentReportsStore.createIncidentReport({
      incident_type_id: formData.value.incident_type_id,
      occurred_at: formData.value.occurred_at!.toISOString(),
      description: formData.value.description || null,
      severity: formData.value.severity,
      subjects: formData.value.subjects,
    });
    toast.add({
      severity: "success",
      summary: "Success",
      detail: "Incident report created",
      life: 3000,
    });
    router.push({ name: "incidentReportDetail", params: { uid: response.uid } });
  } catch (error) {
    console.error("Error creating incident report:", error);
    toast.add({
      severity: "error",
      summary: "Error",
      detail: "Something went wrong creating incident report",
      life: 3000,
    });
  }
}

function handleCancel() {
  router.push({ name: "incidentReports" });
}
</script>

<style scoped></style>
