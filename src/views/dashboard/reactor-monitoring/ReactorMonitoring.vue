<template>
  <div
    class="px-6 py-4 md:px-12 md:py-6 lg:px-20 lg:py-8 bg-surface-50 dark:bg-surface-950 min-h-full"
  >
    <h1 class="text-3xl font-bold text-surface-900 dark:text-surface-0 mb-2">Reactor Monitoring</h1>

    <div
      class="bg-surface-0 dark:bg-surface-900 p-6 shadow-sm rounded-2xl flex flex-col gap-6 mb-6 xl:w-3/4"
    >
      <div class="text-xl font-medium text-surface-900 dark:text-surface-0">Reactor</div>
      <div>
        <span class="text-surface-800 dark:text-surface-100 font-semibold mr-2"
          >Reactor Power:
        </span>
        <span>
          {{ reactorData.reactor_power.toFixed(2) }}
        </span>
      </div>
      <div>
        <span class="text-surface-800 dark:text-surface-100 font-semibold mr-2"
          >Core Temperature:
        </span>
        <span>
          {{ reactorData.core_temperature.toFixed(2) }}
        </span>
      </div>
      <div>
        <span class="text-surface-800 dark:text-surface-100 font-semibold mr-2"
          >Radiation Level:
        </span>
        <span>
          {{ reactorData.radiation_level.toFixed(2) }}
        </span>
      </div>
      <div>
        <span class="text-surface-800 dark:text-surface-100 font-semibold mr-2"
          >Coolant Pressure:
        </span>
        <span>
          {{ reactorData.coolant_pressure.toFixed(2) }}
        </span>
      </div>
      <div>
        <span class="text-surface-800 dark:text-surface-100 font-semibold mr-2"
          >Coolant Flow Rate:
        </span>
        <span>
          {{ reactorData.coolant_flow_rate.toFixed(2) }}
        </span>
      </div>
      <div>
        <span class="text-surface-800 dark:text-surface-100 font-semibold mr-2"
          >Containment Integrity:
        </span>
        <span>
          {{ reactorData.containment_integrity.toFixed(2) }}
        </span>
      </div>
    </div>
  </div>
</template>
<script setup>
import { useAuthStore } from "@/stores/auth";
import { onBeforeUnmount, ref } from "vue";

const authStore = useAuthStore();
const token = authStore.token;
const reactorData = ref({});
// Option B — First message after onopen Send the token as the first message once the connection is established.
const ws = new WebSocket(`ws://localhost:8000/api/ws/telemetry?token=${token}`);
ws.onmessage = (e) => {
  console.log(e);
  reactorData.value = JSON.parse(e.data);
};

onBeforeUnmount(() => {
  ws.close();
});
</script>
