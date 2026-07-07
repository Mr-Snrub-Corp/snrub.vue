<template>
  <div>
    <h1 class="text-3xl font-bold text-surface-900 dark:text-surface-0 mb-6">Form Components</h1>
    <p class="text-surface-600 dark:text-surface-400 mb-8">
      This section will showcase PrimeVue form components like InputText, Textarea, Dropdown,
      Calendar, etc.
    </p>

    <!-- InputText Row -->
    <div class="mb-8">
      <h2 class="text-xl font-semibold text-surface-900 dark:text-surface-0 mb-4">InputText</h2>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <!-- Normal State -->
        <div class="flex flex-col gap-2">
          <label for="input-normal" class="block text-surface-900 dark:text-surface-0 font-medium"
            >Normal</label
          >
          <InputText
            id="input-normal"
            v-model="inputNormal"
            type="text"
            placeholder="Enter text"
            fluid
          />
        </div>

        <!-- Disabled State -->
        <div class="flex flex-col gap-2">
          <label for="input-disabled" class="block text-surface-900 dark:text-surface-0 font-medium"
            >Disabled</label
          >
          <InputText
            id="input-disabled"
            v-model="inputDisabled"
            type="text"
            placeholder="Disabled input"
            disabled
            fluid
          />
        </div>

        <!-- Error State -->
        <div class="flex flex-col gap-2">
          <label for="input-error" class="block text-surface-900 dark:text-surface-0 font-medium"
            >Error State</label
          >
          <InputText
            id="input-error"
            v-model="inputError"
            type="text"
            placeholder="Invalid input"
            invalid
            aria-invalid="true"
            aria-describedby="input-error-msg"
            fluid
          />
          <small id="input-error-msg" class="text-red-400 dark:text-red-300"
            >This field is required</small
          >
        </div>
      </div>
    </div>

    <!-- InputNumber, InputMask Row -->
    <div class="mb-8">
      <h2 class="text-xl font-semibold text-surface-900 dark:text-surface-0 mb-4">
        InputNumber & InputMask
      </h2>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- InputNumber -->
        <div class="flex flex-col gap-2">
          <label for="input-number" class="block text-surface-900 dark:text-surface-0 font-medium"
            >InputNumber</label
          >
          <InputNumber id="input-number" v-model="numberValue" placeholder="Enter number" fluid />
        </div>

        <!-- InputNumber (Currency) -->
        <div class="flex flex-col gap-2">
          <label for="input-currency" class="block text-surface-900 dark:text-surface-0 font-medium"
            >InputNumber (Currency)</label
          >
          <InputNumber
            id="input-currency"
            v-model="currencyValue"
            mode="currency"
            currency="USD"
            locale="en-US"
            placeholder="$0.00"
            fluid
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import InputText from "primevue/inputtext";
import InputNumber from "primevue/inputnumber";

const inputNormal = ref("");
const inputDisabled = ref("Disabled value");
const inputError = ref("");
const numberValue = ref<number | null>(null);
const currencyValue = ref<number | null>(null);
</script>
