<template>
  <div class="px-6 py-4 md:px-12 md:py-6 lg:px-20 lg:py-8 bg-surface-50 dark:bg-surface-950">
    <!-- Header with Add User Button -->
    <div class="mb-4 flex justify-between items-center">
      <h1 class="text-3xl font-bold text-surface-900 dark:text-surface-0">Employees</h1>
      <Button
        v-if="authStore.isAdmin"
        label="Add Employee"
        data-testid="employees.list.add-btn"
        icon="pi pi-plus"
        @click="router.push({ name: 'employeeCreate' })"
        severity="primary"
      />
    </div>

    <DataTable
      data-testid="employees.list.table"
      :value="allUsers"
      class="shadow-sm rounded-2xl overflow-hidden"
    >
      <Column field="photo" header="Photo">
        <template #body="slotProps">
          <Avatar
            v-if="slotProps.data.photo"
            :image="`data:image/png;base64,${slotProps.data.photo}`"
            :aria-label="`${slotProps.data.name} profile picture`"
            class="mr-2 border border-surface-300"
            shape="circle"
          />
        </template>
      </Column>
      <Column field="name" header="Name"></Column>
      <Column field="email" header="Email"></Column>
      <Column field="role" header="Role"></Column>
      <Column header="Actions">
        <template #body="slotProps">
          <!-- Inline action buttons: visible on xl and above -->
          <div class="hidden xl:flex">
            <Button
              v-if="authStore.isSuperAdmin"
              icon="pi pi-trash"
              :aria-label="`Delete ${slotProps.data.name}`"
              data-testid="employees.list.delete-btn"
              @click="handleShowDeleteDialog(slotProps.data.uid)"
              severity="secondary"
              variant="text"
              rounded
            />
            <Button
              icon="pi pi-eye"
              :aria-label="`View ${slotProps.data.name}`"
              data-testid="employees.list.view-btn"
              @click="router.push({ name: 'employeeDetail', params: { uid: slotProps.data.uid } })"
              severity="secondary"
              variant="text"
              rounded
            />
          </div>
          <!-- Popup menu trigger: visible on lg and below -->
          <Button
            class="xl:hidden"
            icon="pi pi-ellipsis-v"
            :aria-label="`Actions for ${slotProps.data.name}`"
            @click="toggleActionMenu($event, slotProps.data)"
            severity="secondary"
            variant="text"
            rounded
            aria-haspopup="true"
            aria-controls="row_action_menu"
          />
        </template>
      </Column>
    </DataTable>

    <Menu ref="actionMenuRef" id="row_action_menu" :model="actionMenuItems" :popup="true" />

    <DeleteConfirmDialog
      :is-visible="showDeleteConfirmDialog"
      header="Delete Employee"
      confirm-button-label="Delete"
      @handle-close="showDeleteConfirmDialog = false"
      @handle-delete="handleDelete"
    >
      <p>Are you sure you want to delete this employee? This action cannot be undone.</p>
    </DeleteConfirmDialog>
  </div>
</template>

<script setup lang="ts">
import Avatar from "primevue/avatar";
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import Button from "primevue/button";
import Menu from "primevue/menu";
import DeleteConfirmDialog from "@/components/dialogs/DeleteConfirmDialog.vue";
import { useUsersStore } from "@/stores/users";
import { useAuthStore } from "@/stores/auth";
import { useRouter } from "vue-router";
import { computed, ref } from "vue";
import type { MenuItem } from "primevue/menuitem";

const router = useRouter();
const usersStore = useUsersStore();
const authStore = useAuthStore();
const allUsers = computed(() => usersStore.getAllUsers);
const showDeleteConfirmDialog = ref(false);
const selectedUserUid = ref<string | null>(null);

// Popup action menu
const actionMenuRef = ref<InstanceType<typeof Menu>>();
const actionMenuItems = ref<MenuItem[]>([]);

function toggleActionMenu(event: Event, rowData: { uid: string }) {
  actionMenuItems.value = [
    ...(authStore.isAdmin
      ? [
          {
            label: "Delete",
            icon: "pi pi-trash",
            command: () => handleShowDeleteDialog(rowData.uid),
          },
        ]
      : []),
    {
      label: "View",
      icon: "pi pi-eye",
      command: () => router.push({ name: "employeeDetail", params: { uid: rowData.uid } }),
    },
  ];
  actionMenuRef.value?.toggle(event);
}

function handleShowDeleteDialog(userUid: string) {
  showDeleteConfirmDialog.value = true;
  selectedUserUid.value = userUid;
}

// Methods
function handleDelete() {
  showDeleteConfirmDialog.value = false;
  if (selectedUserUid.value) {
    usersStore.deleteUser(selectedUserUid.value);
  }
}
</script>

<style lang="scss" scoped></style>
