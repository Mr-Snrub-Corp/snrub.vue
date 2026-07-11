<template>
  <main
    id="main-content"
    class="h-screen w-full bg-surface-50 dark:bg-surface-950 px-6 py-20 md:px-12 lg:px-20"
  >
    <div
      class="bg-surface-0 dark:bg-surface-900 p-8 md:p-12 shadow-sm rounded-2xl w-full max-w-xl mx-auto flex flex-col gap-8"
    >
      <div class="flex flex-col items-center gap-4">
        <div class="flex items-center gap-4">
          <DashboardLogo :size="56" />
        </div>
        <div class="flex flex-col items-center gap-2 w-full">
          <h1
            class="text-surface-900 dark:text-surface-0 text-2xl font-semibold leading-tight text-center w-full"
          >
            Reset Your Password
          </h1>
        </div>
      </div>
      <form @submit.prevent="handleReset" class="flex flex-col gap-6 w-full">
        <div class="flex flex-col gap-2 w-full">
          <div class="flex flex-col gap-2 w-full">
            <div class="flex justify-between w-full">
              <label
                for="password"
                class="text-surface-900 dark:text-surface-0 font-medium leading-normal"
                >New password</label
              >
              <!-- <span role="button" class="p-button-text cursor-pointer"
                ></i
              ></span> -->
              <Button
                type="button"
                class="p-0"
                severity="secondary"
                variant="text"
                rounded
                aria-label="Toggle new password visibility"
                @click="togglePasswordVisibility('passwordType')"
                ><i
                  :class="[
                    'pi',
                    {
                      'pi-eye': passwordType === 'password',
                      'pi-eye-slash': passwordType === 'text',
                    },
                  ]"
                  aria-hidden="true"
                ></i
              ></Button>
            </div>
            <InputText
              id="password"
              data-testid="auth.reset-password-form.password-input"
              :type="passwordType"
              v-model="password"
              placeholder="Enter new password"
              class="w-full px-3 py-2 shadow-sm rounded-lg"
              :aria-invalid="v$.password.$invalid ? 'true' : undefined"
              :aria-describedby="v$.password.$invalid ? 'password-error' : undefined"
            />
            <Message
              v-if="v$.password.$invalid"
              id="password-error"
              severity="error"
              size="small"
              variant="simple"
              >{{ v$.password.$errors[0]?.$message }}</Message
            >
          </div>
          <div class="flex flex-col gap-2 w-full">
            <div class="flex justify-between w-full">
              <label
                for="confirmPassword"
                class="text-surface-900 dark:text-surface-0 font-medium leading-normal"
                >Confirm Password</label
              >
              <Button
                type="button"
                class="p-0"
                severity="secondary"
                variant="text"
                rounded
                aria-label="Toggle confirm password visibility"
                @click="togglePasswordVisibility('confirmPasswordType')"
                ><i
                  :class="[
                    'pi',
                    {
                      'pi-eye': confirmPasswordType === 'password',
                      'pi-eye-slash': confirmPasswordType === 'text',
                    },
                  ]"
                  aria-hidden="true"
                ></i
              ></Button>
            </div>
            <InputText
              id="confirmPassword"
              data-testid="auth.reset-password-form.confirm-password-input"
              :type="confirmPasswordType"
              v-model="confirmPassword"
              placeholder="Confirm password"
              class="w-full px-3 py-2 shadow-sm rounded-lg"
              :aria-invalid="v$.confirmPassword.$invalid ? 'true' : undefined"
              :aria-describedby="v$.confirmPassword.$invalid ? 'confirmPassword-error' : undefined"
            />
            <Message
              v-if="v$.confirmPassword.$invalid"
              id="confirmPassword-error"
              severity="error"
              size="small"
              variant="simple"
              >{{ v$.confirmPassword.$errors[0]?.$message }}</Message
            >
          </div>
        </div>
        <Button
          data-testid="auth.reset-password-form.submit-btn"
          type="submit"
          label="Reset Password"
          severity="primary"
          icon="pi pi-user"
          class="w-full py-2 rounded-lg flex justify-center items-center gap-2"
        >
          <template #icon>
            <i class="pi pi-user !text-base !leading-normal" aria-hidden="true" />
          </template>
        </Button>
      </form>
    </div>
  </main>
</template>

<script setup lang="ts">
import { useAuthStore } from "@/stores/auth";
import DashboardLogo from "@/components/dashboard/DashboardLogo.vue";
import Button from "primevue/button";
import InputText from "primevue/inputtext";
import Message from "primevue/message";
import { useToast } from "primevue/usetoast";

import { ref, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useVuelidate } from "@vuelidate/core";
import { required, minLength, sameAs, helpers } from "@vuelidate/validators";

const password = ref("");
const confirmPassword = ref("");
const passwordType = ref("password");
const confirmPasswordType = ref("password");

const route = useRoute();
const router = useRouter();
const toast = useToast();

const token = computed(() => route.query.token as string);

const authStore = useAuthStore();

// Custom validator for password complexity
const containsUppercase = helpers.regex(/[A-Z]/);
const containsLowercase = helpers.regex(/[a-z]/);
const containsNumber = helpers.regex(/[0-9]/);
const containsSymbol = helpers.regex(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/);

const passwordComplexity = helpers.withMessage(
  "Password must contain at least one uppercase letter, one lowercase letter, one number, and one symbol",
  (value: string) =>
    containsUppercase(value) &&
    containsLowercase(value) &&
    containsNumber(value) &&
    containsSymbol(value),
);

// Rules for validation
const rules = {
  password: {
    required: helpers.withMessage("Password is required", required),
    minLength: helpers.withMessage("Password must be at least 8 characters", minLength(8)),
    complexity: passwordComplexity,
  },
  confirmPassword: {
    required: helpers.withMessage("Please confirm your password", required),
    sameAsPassword: helpers.withMessage("Passwords must match", sameAs(password)),
  },
};

const v$ = useVuelidate(rules, { password, confirmPassword });

function togglePasswordVisibility(field: string) {
  if (field === "passwordType") {
    passwordType.value = passwordType.value === "password" ? "text" : "password";
  } else if (field === "confirmPasswordType") {
    confirmPasswordType.value = confirmPasswordType.value === "password" ? "text" : "password";
  }
}

async function handleReset() {
  const isValid = await v$.value.$validate();
  if (!isValid) {
    return;
  }

  try {
    await authStore.resetPassword({
      token: token.value,
      new_password: password.value,
    });
    toast.add({
      severity: "success",
      summary: "Success",
      detail: "Password has been reset",
      life: 3000,
    });
    // Redirect to login page after successful reset
    setTimeout(() => {
      router.push("/auth/login");
    }, 1000);
  } catch (error) {
    console.error("Password reset failed:", error);
  }
}
</script>
