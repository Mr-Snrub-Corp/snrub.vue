import { defineStore } from "pinia";
import { computed, ref } from "vue";
import api from "@/services/httpService";
import { USER_ROLES } from "@/constants/enums";
import type { User } from "@/types/user";
import type { AuthResponse, PasswordResetResponse } from "@/types/auth";

// Re-export User type for convenience
export type { User };

export const useAuthStore = defineStore(
  "auth",
  () => {
    // State
    const user = ref<User | null>(null);
    const token = ref<string | null>(null);

    // Getters
    const isLoggedIn = computed(() => !!user.value && !!token.value);
    const getAuthUser = computed(() => {
      if (isLoggedIn.value) {
        return user.value;
      }
    });
    const isAdmin = computed(() => {
      const role = user.value?.role;
      return role === USER_ROLES.ADMIN || role === USER_ROLES.SUPER_ADMIN;
    });
    const isSuperAdmin = computed(() => {
      return user.value?.role === USER_ROLES.SUPER_ADMIN;
    });

    function setUser(newUser: User | null) {
      user.value = newUser;
    }

    function setToken(newToken: string | null) {
      token.value = newToken;
    }

    async function login({ email, password }: { email: string; password: string }) {
      try {
        const response = await api.auth.login({ email, password });
        const data = response as AuthResponse;

        setUser(data.user);
        setToken(data.access_token);

        return data;
      } catch (error) {
        throw error;
      }
    }

    async function loginGoogle() {
      try {
        const response = await api.auth.loginGoogle();
        const data = response as AuthResponse;

        setUser(data.user);
        setToken(data.access_token);

        return data;
      } catch (error) {
        throw error;
      }
    }

    async function requestReset({ email }: { email: string }) {
      try {
        const response = await api.auth.requestPasswordReset({ email });
        const data = response as PasswordResetResponse;

        return data;
      } catch (error) {
        console.error("Reset failed:", error);
        throw error;
      }
    }

    async function resetPassword({ token, new_password }: { token: string; new_password: string }) {
      try {
        const response = await api.auth.resetPassword({ token, new_password });
        return response;
      } catch (error) {
        throw error;
      }
    }

    function $reset() {
      user.value = null;
      token.value = null;
      localStorage.removeItem("auth");
    }

    async function logout() {
      try {
        await api.auth.logout();
      } catch (error) {
        console.error("Logout failed:", error);
      } finally {
        $reset();
      }
    }

    return {
      user,
      token,
      isLoggedIn,
      getAuthUser,
      isAdmin,
      isSuperAdmin,
      setUser,
      setToken,
      login,
      loginGoogle,
      logout,
      $reset,
      requestReset,
      resetPassword,
    };
  },
  {
    persist: true,
  },
);
