<template>
  <div class="h-screen flex w-full bg-surface-0 dark:bg-surface-950">
    <div class="bg-surface-0 dark:bg-surface-950 w-full md:w-6/12 p-12 md:p-20">
      <div class="mb-8">
        <RouterLink to="/" class="inline-block mb-4">
          <DashboardLogo :size="56" />
        </RouterLink>
        <div class="text-surface-900 dark:text-surface-0 text-3xl font-medium mb-4">
          Welcome Back
        </div>
      </div>
      <div>
        <form>
          <div class="flex flex-col gap-2 mb-4">
            <label for="email2" class="block text-surface-900 dark:text-surface-0 font-medium"
              >Email</label
            >
            <InputText
              id="email2"
              v-model="formData.email"
              type="text"
              placeholder="Email address"
              class="w-full p-4"
              data-testid="auth.login-form.email-input"
              :invalid="v$.email.$error"
              @blur="v$.email.$touch()"
            />
            <small v-if="v$.email.$error" class="text-red-500">
              {{ v$.email.$errors[0]?.$message }}
            </small>
          </div>

          <div class="flex flex-col gap-2 mb-4">
            <label for="password2" class="block text-surface-900 dark:text-surface-0 font-medium"
              >Password</label
            >
            <InputText
              id="password2"
              v-model="formData.password"
              type="password"
              placeholder="Password"
              class="w-full p-4"
              autocomplete="off"
              data-testid="auth.login-form.password-input"
              :invalid="v$.password.$error"
              @blur="v$.password.$touch()"
            />
            <small v-if="v$.password.$error" class="text-red-500">
              {{ v$.password.$errors[0]?.$message }}
            </small>
          </div>

          <div class="flex items-center justify-between mb-12">
            <div class="flex items-center"></div>
            <Button
              class="font-medium no-underline ml-2 text-primary text-right"
              label="Forgot password?"
              severity="secondary"
              variant="text"
              as="router-link"
              to="/auth/forgot-password"
              data-testid="auth.login-form.forgot-password-btn"
            >
            </Button>
          </div>
        </form>

        <Button
          @click="handleLogin"
          label="Sign in"
          severity="primary"
          icon="pi pi-user"
          class="w-full p-4"
          data-testid="auth.login-form.sign-in-btn"
          :disabled="v$.$invalid"
        />
        <div class="flex justify-between gap-2 mt-4">
          <Button
            @click="handleGoogleLogin"
            label="Sign in with Google"
            icon="pi pi-google"
            class="p-button-google w-100 grow p-4 mt-2"
          />
        </div>
      </div>
      <Message v-if="errorMessage" class="mt-4" severity="error" size="small" data-testid="auth.login-form.error-message">{{
        errorMessage
      }}</Message>
    </div>
    <div
      class="hidden md:block w-6/12 bg-no-repeat bg-cover bg-[url('https://fqjltiegiezfetthbags.supabase.co/storage/v1/render/image/public/block.images/blocks/signin/signin.jpg')]"
    />
  </div>
</template>
<script setup lang="ts">
import DashboardLogo from "@/components/dashboard/DashboardLogo.vue";
import { HttpError } from "@/types/errors";
import Button from "primevue/button";
import InputText from "primevue/inputtext";
import Message from "primevue/message";
import { useVuelidate } from "@vuelidate/core";
import { required, email, maxLength, helpers } from "@vuelidate/validators";
import { useAuthStore } from "@/stores/auth";
import { useRouter } from "vue-router";
import { ref } from "vue";
import { MAX_LENGTH } from "@/constants/validation";

const router = useRouter();
const authStore = useAuthStore();

const formData = ref({ email: "", password: "" });
const errorMessage = ref("");

const rules = {
  email: {
    required: helpers.withMessage("Email is required", required),
    email: helpers.withMessage("Please enter a valid email address", email),
    maxLength: helpers.withMessage(
      `Email must not exceed ${MAX_LENGTH.EMAIL} characters`,
      maxLength(MAX_LENGTH.EMAIL),
    ),
  },
  password: {
    required: helpers.withMessage("Password is required", required),
  },
};

const v$ = useVuelidate(rules, formData);

async function handleLogin() {
  const isValid = await v$.value.$validate();
  if (!isValid) return;

  errorMessage.value = "";

  authStore
    .login({
      email: formData.value.email,
      password: formData.value.password,
    })
    .then(() => {
      router.push({ name: "dashboardHome" });
    })
    .catch((error) => {
      if (error instanceof HttpError) {
        errorMessage.value = error.message;
      } else {
        errorMessage.value = "Login failed";
      }
    });
}

function handleGoogleLogin() {
  // Direct browser navigation - this will follow the 302 redirect automatically
  window.location.href = import.meta.env.VITE_GOOGLE_LOGIN_URL; //  'http://localhost:8000/api/auth/google/login';
}
</script>
