<template>
  <div class="h-screen flex w-full bg-surface-0 dark:bg-surface-950">
    <div class="bg-surface-0 dark:bg-surface-950 w-full md:w-6/12 p-12 md:p-20">
      <div class="mb-8">
        <svg
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
        <div class="text-surface-900 dark:text-surface-0 text-3xl font-medium mb-4">Sign up</div>
      </div>
      <div>
        <label for="name" class="block text-surface-900 dark:text-surface-0 font-medium mb-2"
          >Name</label
        >
        <InputText
          id="name"
          v-model="name"
          type="text"
          placeholder="Name"
          class="w-full mb-4 p-4"
        />
        <label for="email2" class="block text-surface-900 dark:text-surface-0 font-medium mb-2"
          >Name</label
        >
        <InputText
          id="email2"
          v-model="email"
          type="text"
          placeholder="Email address"
          class="w-full mb-4 p-4"
        />

        <label for="password2" class="block text-surface-900 dark:text-surface-0 font-medium mb-2"
          >Password</label
        >
        <InputText
          id="password2"
          v-model="password"
          type="password"
          placeholder="Password"
          class="w-full mb-4 p-4"
        />

        <div class="flex items-center justify-between mb-12">
          <div class="flex items-center">
            <Checkbox id="rememberme2" v-model="checked2" :binary="true" class="mr-2" />
            <label for="rememberme2">Remember me</label>
          </div>
          <a class="font-medium no-underline ml-2 text-primary text-right cursor-pointer"
            >Forgot password?</a
          >
        </div>

        <Button
          @click="signup"
          label="Sign Up"
          severity="primary"
          icon="pi pi-user"
          class="w-full p-4"
        />
      </div>
    </div>
    <div
      class="hidden md:block w-6/12 bg-no-repeat bg-cover bg-[url('https://fqjltiegiezfetthbags.supabase.co/storage/v1/render/image/public/block.images/blocks/signin/signin.jpg')]"
    />
  </div>
</template>
<script setup lang="ts">
import Button from "primevue/button";
import Checkbox from "primevue/checkbox";
import InputText from "primevue/inputtext";
import api from "@/services/httpService";

import { ref } from "vue";

const name = ref("");
const email = ref("");
const password = ref("");

function signup() {
  console.log("signup");

  api.auth
    .signup({
      email: email.value,
      password: password.value,
    })
    .then((res: any) => {
      // should use a more specific type for the API response instead of any
      console.log(res.data);
    });
}

const checked2 = ref(true);
</script>
