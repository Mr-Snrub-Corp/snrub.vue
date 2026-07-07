<template>
  <span
    class="inline-flex items-center justify-center rounded-full w-7 h-7 text-sm font-bold"
    :class="getSeverityClass(severity)"
    :aria-label="`Severity ${severity} of 7`"
  >
    {{ severity }}
  </span>
</template>

<script setup lang="ts">
import { getSeverityClass } from "@/utils/incident";

defineProps<{
  severity: number;
}>();
</script>
