<template>
  <div class="h-screen flex w-full bg-surface-0 dark:bg-surface-950">
    <main id="main-content" class="bg-surface-0 dark:bg-surface-950 w-full md:w-6/12 p-12 md:p-20">
      <div class="mb-8">
        <svg
          aria-hidden="true"
          class="mb-4 fill-surface-600 dark:fill-surface-200 h-14"
          viewBox="0 0 30 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fill-rule="evenodd"
            clip-rule="evenodd"
            d="M20.7207 6.18211L14.9944 3.11148L3.46855 9.28678L0.579749 7.73444L14.9944 0L23.6242 4.62977L20.7207 6.18211ZM14.9996 12.3574L26.5182 6.1821L29.4216 7.73443L14.9996 15.4621L6.37724 10.8391L9.27337 9.28677L14.9996 12.3574ZM2.89613 16.572L0 15.0196V24.2656L14.4147 32V28.8953L2.89613 22.7132V16.572ZM11.5185 18.09L0 11.9147V8.81001L14.4147 16.5376V25.7904L11.5185 24.2312V18.09ZM24.2086 15.0194V11.9147L15.5788 16.5377V31.9998L18.475 30.4474V18.09L24.2086 15.0194ZM27.0969 22.7129V10.3623L30.0004 8.81V24.2653L21.3706 28.895V25.7904L27.0969 22.7129Z"
          />
        </svg>
        <h1 class="text-surface-900 dark:text-surface-0 text-3xl font-medium mb-4">
          Forgot Password
        </h1>
        <div class="flex items-center">
          <span class="text-surface-600 dark:text-surface-200 font-medium mr-1"
            >No worries, we'll send you restore instructions</span
          >
        </div>
      </div>
      <form @submit.prevent="handleReset">
        <div class="flex flex-col gap-2 mb-4">
          <label for="email2" class="block text-surface-900 dark:text-surface-0 font-medium"
            >Email</label
          >
          <InputText
            id="email2"
            data-testid="auth.forgot-password-form.email-input"
            v-model="formData.email"
            type="text"
            placeholder="Email address"
            class="w-full p-4"
            :invalid="v$.email.$error"
            :aria-invalid="v$.email.$error ? 'true' : undefined"
            :aria-describedby="v$.email.$error ? 'email2-error' : undefined"
            @blur="v$.email.$touch()"
          />
          <small v-if="v$.email.$error" id="email2-error" class="text-red-500">
            {{ v$.email.$errors[0]?.$message }}
          </small>
        </div>

        <div class="flex items-center justify-end mb-4">
          <Button
            class="font-medium no-underline ml-2 text-primary text-right"
            data-testid="auth.forgot-password-form.back-to-login-btn"
            label="Back to Login"
            severity="secondary"
            variant="text"
            as="router-link"
            to="/auth/login"
          >
          </Button>
        </div>

        <Button
          type="submit"
          label="Reset Password"
          data-testid="auth.forgot-password-form.submit-btn"
          severity="primary"
          icon="pi pi-user"
          class="w-full p-4"
          :disabled="v$.$invalid"
        />
      </form>
    </main>
    <div
      aria-hidden="true"
      class="hidden md:block w-6/12 bg-no-repeat bg-cover bg-[url('https://fqjltiegiezfetthbags.supabase.co/storage/v1/render/image/public/block.images/blocks/signin/signin.jpg')]"
    />
  </div>
</template>
<script setup lang="ts">
import Button from "primevue/button";
import InputText from "primevue/inputtext";
import { useVuelidate } from "@vuelidate/core";
import { required, email, maxLength, helpers } from "@vuelidate/validators";
import { useAuthStore } from "@/stores/auth";
import { useToast } from "primevue/usetoast";
import { ref } from "vue";
import { MAX_LENGTH } from "@/constants/validation";

const authStore = useAuthStore();
const toast = useToast();

const formData = ref({ email: "" });

const rules = {
  email: {
    required: helpers.withMessage("Email is required", required),
    email: helpers.withMessage("Please enter a valid email address", email),
    maxLength: helpers.withMessage(
      `Email must not exceed ${MAX_LENGTH.EMAIL} characters`,
      maxLength(MAX_LENGTH.EMAIL),
    ),
  },
};

const v$ = useVuelidate(rules, formData);

async function handleReset() {
  const isValid = await v$.value.$validate();
  if (!isValid) return;

  try {
    await authStore.requestReset({ email: formData.value.email });
    toast.add({
      severity: "success",
      summary: "Email Sent",
      detail: "If your email is registered, you will receive a password reset link",
      life: 5000,
    });
  } catch (error) {
    console.error("Reset failed:", error);
  }
}
</script>
