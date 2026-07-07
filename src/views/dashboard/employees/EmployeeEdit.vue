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
          Edit Employee Details
        </h1>
      </div>

      <div class="bg-surface-0 dark:bg-surface-900 p-7 shadow rounded-2xl flex-auto xl:w-3/4">
        <div class="flex flex-col gap-7">
          <div class="text-xl font-medium text-surface-900 dark:text-surface-0">Profile</div>

          <div class="flex gap-10 flex-col-reverse md:flex-row">
            <div class="flex-auto flex flex-col gap-6">
              <div class="flex flex-col gap-2">
                <label for="email" class="text-surface-900 dark:text-surface-0">Email *</label>
                <InputText
                  id="email"
                  v-model="formData.email"
                  :disabled="isUserEditMode"
                  type="email"
                  class="w-full"
                  data-testid="employees.edit-form.email-input"
                  :invalid="v$.email.$error"
                  :aria-invalid="v$.email.$error ? 'true' : undefined"
                  :aria-describedby="v$.email.$error ? 'edit-email-error' : undefined"
                  @blur="v$.email.$touch()"
                />
                <small v-if="v$.email.$error" id="edit-email-error" class="text-red-500">
                  {{ v$.email.$errors[0]?.$message }}
                </small>
              </div>

              <div class="flex flex-col gap-2">
                <label for="name" class="text-surface-900 dark:text-surface-0">Name *</label>
                <InputText
                  id="name"
                  v-model="formData.name"
                  type="text"
                  class="w-full"
                  data-testid="employees.edit-form.name-input"
                  :invalid="v$.name.$error"
                  :aria-invalid="v$.name.$error ? 'true' : undefined"
                  :aria-describedby="v$.name.$error ? 'edit-name-error' : undefined"
                  @blur="v$.name.$touch()"
                />
                <small v-if="v$.name.$error" id="edit-name-error" class="text-red-500">
                  {{ v$.name.$errors[0]?.$message }}
                </small>
              </div>

              <div class="flex flex-col gap-2">
                <label for="role" class="text-surface-900 dark:text-surface-0">Role *</label>
                <Select
                  id="role"
                  v-model="formData.role"
                  :disabled="isUserEditMode"
                  :options="roleOptions"
                  option-label="label"
                  option-value="value"
                  placeholder="Select a role"
                  class="w-full"
                  data-testid="employees.edit-form.role-select"
                  :invalid="v$.role.$error"
                  :aria-invalid="v$.role.$error ? 'true' : undefined"
                  :aria-describedby="v$.role.$error ? 'edit-role-error' : undefined"
                  @blur="v$.role.$touch()"
                />
                <small v-if="v$.role.$error" id="edit-role-error" class="text-red-500">
                  {{ v$.role.$errors[0]?.$message }}
                </small>
              </div>

              <div class="flex flex-col gap-2">
                <label for="userStatus" class="text-surface-900 dark:text-surface-0"
                  >Employee Status *</label
                >
                <Select
                  id="userStatus"
                  v-model="formData.status"
                  :disabled="isUserEditMode"
                  :options="userStatusOptions"
                  option-label="label"
                  option-value="value"
                  placeholder="Select employee status"
                  class="w-full"
                  data-testid="employees.edit-form.status-select"
                  :invalid="v$.status.$error"
                  :aria-invalid="v$.status.$error ? 'true' : undefined"
                  :aria-describedby="v$.status.$error ? 'edit-status-error' : undefined"
                  @blur="v$.status.$touch()"
                />
                <small v-if="v$.status.$error" id="edit-status-error" class="text-red-500">
                  {{ v$.status.$errors[0]?.$message }}
                </small>
              </div>
            </div>

            <div class="flex flex-col gap-2">
              <label class="text-surface-900 dark:text-surface-0">Avatar</label>
              <div class="flex flex-col items-center gap-3">
                <div
                  v-if="isUploadingImage"
                  class="flex items-center justify-center h-32 w-32 rounded-lg border border-surface-300"
                >
                  <i class="pi pi-spin pi-spinner text-4xl text-surface-400" />
                </div>
                <img
                  v-else
                  :src="getUserAvatar"
                  :alt="
                    formData.name ? `${formData.name} profile picture` : 'Employee profile picture'
                  "
                  class="h-32 w-32 rounded-lg object-cover border border-surface-300"
                />
                <FileUpload
                  mode="basic"
                  name="avatar"
                  accept="image/*"
                  custom-upload
                  auto
                  :max-file-size="1000000"
                  choose-label="Upload"
                  :choose-icon="isUploadingImage ? 'pi pi-spin pi-spinner' : 'pi pi-upload'"
                  severity="secondary"
                  class="w-32 p-button-outlined"
                  @select="onPhotoSelect"
                />
              </div>
            </div>
          </div>

          <div class="flex gap-3">
            <Button
              label="Update Profile"
              severity="primary"
              data-testid="employees.edit-form.update-btn"
              :disabled="v$.$invalid"
              @click="handleSubmit"
            />
            <Button
              label="Cancel"
              severity="secondary"
              variant="outlined"
              data-testid="employees.edit-form.cancel-btn"
              @click="handleCancel"
            />
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useRouter, useRoute } from "vue-router";
import Button from "primevue/button";
import InputText from "primevue/inputtext";
import Select from "primevue/select";
import FileUpload from "primevue/fileupload";
import ProgressSpinner from "primevue/progressspinner";
import type { FileUploadSelectEvent } from "primevue/fileupload";
import { useVuelidate } from "@vuelidate/core";
import { required, email, maxLength, helpers } from "@vuelidate/validators";
import { USER_ROLES, USER_STATUS } from "@/constants/enums";
import { MAX_LENGTH } from "@/constants/validation";
import { useUsersStore } from "@/stores/users";
import { useAuthStore } from "@/stores/auth";
import { formatLabel } from "@/utils";
import type { UserRole, UserStatus } from "@/types/user";
import { useToast } from "primevue/usetoast";

const router = useRouter();
const route = useRoute();
const usersStore = useUsersStore();
const authStore = useAuthStore();
const toast = useToast();

const uid = route.params.uid as string;
const isLoading = ref(false);
const isUploadingImage = ref(false);

const formData = ref<{
  email: string;
  name: string;
  role: UserRole | "";
  status: UserStatus;
  photo: string;
}>({
  email: "",
  name: "",
  role: "",
  status: USER_STATUS.ACTIVE,
  photo: "",
});

const roleOptions = Object.values(USER_ROLES).map((role) => ({
  label: formatLabel(role),
  value: role,
}));

const userStatusOptions = Object.values(USER_STATUS).map((status) => ({
  label: formatLabel(status),
  value: status,
}));

const isUserEditMode = computed(() => {
  const user = usersStore.getUserById(uid);
  if (user) {
    return user.role === USER_ROLES.CREATOR && user.uid === authStore.user?.uid;
  }
  return false;
});

const rules = {
  email: {
    required: helpers.withMessage("Email is required", required),
    email: helpers.withMessage("Please enter a valid email address", email),
    maxLength: helpers.withMessage(
      `Email must not exceed ${MAX_LENGTH.EMAIL} characters`,
      maxLength(MAX_LENGTH.EMAIL),
    ),
  },
  name: {
    required: helpers.withMessage("Name is required", required),
    maxLength: helpers.withMessage(
      `Name must not exceed ${MAX_LENGTH.NAME} characters`,
      maxLength(MAX_LENGTH.NAME),
    ),
  },
  role: {
    required: helpers.withMessage("Role is required", required),
  },
  status: {
    required: helpers.withMessage("Employee status is required", required),
  },
};

const v$ = useVuelidate(rules, formData);

function initFormData() {
  const user = usersStore.getUserById(uid);
  if (user) {
    formData.value = {
      email: user.email,
      name: user.name,
      role: user.role,
      status: user.status,
      photo: user.photo || "",
    };
  }
}

async function onPhotoSelect(event: FileUploadSelectEvent) {
  const file = event.files[0];
  if (!file) return;

  try {
    isUploadingImage.value = true;
    await usersStore.uploadPhoto(uid, file);
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      formData.value.photo = result.split(",")[1];
    };
    reader.readAsDataURL(file);
    toast.add({
      severity: "success",
      summary: "Success",
      detail: "Photo has been successfully uploaded",
      life: 3000,
    });
  } catch (err) {
    console.error(err);
    toast.add({
      severity: "error",
      summary: "Error",
      detail: "Something went wrong with photo upload",
      life: 3000,
    });
  } finally {
    isUploadingImage.value = false;
  }
}

async function handleSubmit() {
  const isValid = await v$.value.$validate();
  if (!isValid) return;

  try {
    const updateData = {
      email: formData.value.email,
      name: formData.value.name,
      role: formData.value.role as UserRole,
      status: formData.value.status,
    };
    await usersStore.updateUser(uid, updateData);
    toast.add({
      severity: "success",
      summary: "Success",
      detail: "Employee has been successfully updated",
      life: 3000,
    });
    router.push({ name: "employeeDetail", params: { uid } });
  } catch (error) {
    console.error("Error updating user:", error);
    toast.add({
      severity: "error",
      summary: "Error",
      detail: "Something went wrong with user update",
      life: 3000,
    });
  }
}

function handleCancel() {
  router.push({ name: "employeeDetail", params: { uid } });
}

const getUserAvatar = computed(() => {
  if (!formData.value.photo) {
    return "/img/avatar-placeholder.png";
  }
  return `data:image/png;base64,${formData.value.photo}`;
});

onMounted(async () => {
  isLoading.value = true;
  await usersStore.fetchUserById(uid);
  initFormData();
  isLoading.value = false;
});
</script>

<style scoped></style>
