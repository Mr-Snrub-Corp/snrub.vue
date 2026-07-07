<template>
  <div>
    <p role="status" class="sr-only">Completing sign in, please wait…</p>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from "@/stores/auth";
import api from "@/services/httpService";
import type { AuthResponse } from "@/types/auth";
import { onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useToast } from "primevue/usetoast";

const authStore = useAuthStore();
const route = useRoute();
const router = useRouter();
const toast = useToast();

onMounted(async () => {
  if (route.query.error) {
    toast.add({
      severity: "error",
      summary: "Login Failed",
      detail: "Google authentication failed. Please try again.",
      life: 5000,
    });
    router.push({ name: "Login" });
    return;
  }

  try {
    const data = (await api.auth.getGoogleToken()) as AuthResponse;
    authStore.setToken(data.access_token);
    authStore.setUser(data.user);
    await router.push({ name: "dashboardHome" });
    toast.add({
      severity: "success",
      summary: "Welcome",
      detail: "Welcome to Snrub Corp dashboard. You are logged in as a guest.",
      life: 5000,
    });
  } catch {
    toast.add({
      severity: "error",
      summary: "Login Failed",
      detail: "Could not retrieve authentication token. Please try again.",
      life: 5000,
    });
    router.push({ name: "Login" });
  }
});
</script>
