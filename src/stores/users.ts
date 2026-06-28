import { defineStore } from "pinia";
import { computed, ref } from "vue";
import api from "@/services/httpService";
import type { User, UserStatus } from "@/types/user";

// Re-export for convenience
export type { User, UserStatus };

export const useUsersStore = defineStore("users", () => {
  // State
  const users = ref<User[]>([]);

  // Getters
  const getAllUsers = computed(() => users.value);
  const getUserById = computed(() => (uid: string) => {
    return users.value.find((user) => user.uid === uid);
  });

  // Actions
  async function createUser(userData: Partial<User>) {
    try {
      const response = await api.users.create(userData);
      users.value.push(response);
      return response;
    } catch (err: any) {
      console.error(`Error creating user:`, err);
      throw err;
    }
  }

  async function fetchUsers() {
    try {
      const response = await api.users.get();
      users.value = response;
      return response;
    } catch (err: any) {
      console.error("Error fetching users:", err);
      throw err;
    }
  }

  async function fetchUserById(uid: string) {
    try {
      const response = await api.users.getOne(uid);
      const index = users.value.findIndex((user) => user.uid === uid);
      if (index !== -1) {
        users.value[index] = { ...users.value[index], ...response };
      }
      return response;
    } catch (err: any) {
      console.error(`Error fetching user ${uid}:`, err);
      throw err;
    }
  }

  async function updateUser(uid: string, userData: Partial<User>) {
    try {
      const response = await api.users.updateOne(uid, userData);
      const index = users.value.findIndex((user) => user.uid === uid);
      if (index !== -1) {
        users.value[index] = { ...users.value[index], ...response };
      }
      return response;
    } catch (err: any) {
      console.error(`Error updating user ${uid}:`, err);
      throw err;
    }
  }

  async function uploadPhoto(uid: string, file: File) {
    try {
      const formData = new FormData();
      formData.append("file", file);
      const response = await api.users.uploadPhoto(uid, formData);
      await fetchUserById(uid);
      return response;
    } catch (err) {
      console.error(`Error uploading photo for user ${uid}:`, err);
      throw err;
    }
  }

  async function deleteUser(uid: string) {
    try {
      await api.users.deleteOne(uid);
      users.value = users.value.filter((user) => user.uid !== uid);
    } catch (err: any) {
      console.error(`Error deleting user ${uid}:`, err);
      throw err;
    }
  }

  function $reset() {
    users.value = [];
  }

  return {
    users,
    $reset,
    getAllUsers,
    getUserById,
    createUser,
    fetchUsers,
    fetchUserById,
    updateUser,
    deleteUser,
    uploadPhoto,
  };
});
