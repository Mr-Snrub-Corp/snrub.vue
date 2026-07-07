<template>
  <div
    class="px-6 py-4 md:px-12 md:py-6 lg:px-20 lg:py-8 bg-surface-50 dark:bg-surface-950 flex-1"
  >
    <h1 class="text-3xl font-bold text-surface-900 dark:text-surface-0 mb-6">Reactor Monitoring</h1>

    <Message
      v-if="connectionError"
      class="mb-6"
      severity="warn"
      data-testid="reactor-monitoring.dashboard.error-message"
    >
      {{ connectionError }}
    </Message>

    <div
      v-if="!hasData && !connectionError"
      data-testid="reactor-monitoring.dashboard.loading-message"
      class="bg-surface-0 dark:bg-surface-900 p-6 shadow-sm rounded-2xl flex items-center gap-3"
    >
      <ProgressSpinner style="width: 1.5rem; height: 1.5rem" />
      <span class="text-surface-500 dark:text-surface-400">Awaiting telemetry…</span>
    </div>

    <div v-else-if="hasData" class="grid grid-cols-1 gap-6 md:grid-cols-2">
      <!-- Reactor Power -->
      <div class="bg-surface-0 dark:bg-surface-900 p-6 shadow-sm rounded-2xl flex flex-col gap-4">
        <div class="flex justify-between items-start gap-3">
          <div>
            <div
              class="text-xs font-semibold text-surface-600 dark:text-surface-400 uppercase tracking-widest"
            >
              Reactor Power
            </div>
            <div
              data-testid="reactor-monitoring.reactor-power.kpi-value"
              class="text-3xl font-bold mt-1"
              aria-live="polite"
              aria-atomic="true"
              :style="{ color: statusColor(reactorPowerStatus) }"
            >
              {{ reactorData.reactor_power?.toFixed(1) }}
              <span class="text-base font-normal text-surface-600 dark:text-surface-400">%</span>
            </div>
          </div>
          <div class="flex grow justify-between items-center gap-2">
            <div
              class="h-7 w-7 rounded-md flex items-center justify-center"
              :style="{ background: statusBg(reactorPowerStatus) }"
            >
              <i aria-hidden="true" class="pi pi-bolt text-xs" :style="{ color: statusColor(reactorPowerStatus) }" />
            </div>
            <Tag
              :severity="getReactorStatusSeverity(reactorPowerStatus)"
              :value="formatLabel(reactorPowerStatus)"
              data-testid="reactor-monitoring.reactor-power.status-badge"
            />
          </div>
        </div>
        <div data-testid="reactor-monitoring.reactor-power.chart" class="h-40">
          <Chart
            type="line"
            :data="reactorPowerData"
            :options="reactorPowerOptions"
            class="h-full"
            role="img"
            aria-label="Reactor power trend line chart"
          />
        </div>
      </div>

      <!-- Core Temperature -->
      <div class="bg-surface-0 dark:bg-surface-900 p-6 shadow-sm rounded-2xl flex flex-col gap-4">
        <div class="flex justify-between items-start gap-3">
          <div>
            <div
              class="text-xs font-semibold text-surface-600 dark:text-surface-400 uppercase tracking-widest"
            >
              Core Temperature
            </div>
            <div
              data-testid="reactor-monitoring.core-temperature.kpi-value"
              class="text-3xl font-bold mt-1"
              aria-live="polite"
              aria-atomic="true"
              :style="{ color: statusColor(coreTemperatureStatus) }"
            >
              {{ reactorData.core_temperature?.toFixed(1) }}
              <span class="text-base font-normal text-surface-600 dark:text-surface-400">°C</span>
            </div>
          </div>
          <div class="flex grow justify-between items-center gap-2">
            <div
              class="h-7 w-7 rounded-md flex items-center justify-center"
              :style="{ background: statusBg(coreTemperatureStatus) }"
            >
              <i aria-hidden="true" class="pi pi-sun text-xs" :style="{ color: statusColor(coreTemperatureStatus) }" />
            </div>
            <Tag
              :severity="getReactorStatusSeverity(coreTemperatureStatus)"
              :value="formatLabel(coreTemperatureStatus)"
              data-testid="reactor-monitoring.core-temperature.status-badge"
            />
          </div>
        </div>
        <div data-testid="reactor-monitoring.core-temperature.chart" class="h-40">
          <Chart
            type="line"
            :data="coreTemperatureData"
            :options="coreTemperatureOptions"
            class="h-full"
            role="img"
            aria-label="Core temperature trend line chart"
          />
        </div>
      </div>

      <!-- Coolant Flow Rate -->
      <div class="bg-surface-0 dark:bg-surface-900 p-6 shadow-sm rounded-2xl flex flex-col gap-4">
        <div class="flex justify-between items-start gap-3">
          <div>
            <div
              class="text-xs font-semibold text-surface-600 dark:text-surface-400 uppercase tracking-widest"
            >
              Coolant Flow Rate
            </div>
            <div
              data-testid="reactor-monitoring.coolant-flow-rate.kpi-value"
              class="text-3xl font-bold mt-1"
              aria-live="polite"
              aria-atomic="true"
              :style="{ color: statusColor(coolantFlowStatus) }"
            >
              {{ reactorData.coolant_flow_rate?.toFixed(1) }}
              <span class="text-base font-normal text-surface-600 dark:text-surface-400">%</span>
            </div>
          </div>
          <div class="flex grow justify-between items-center gap-2">
            <div
              class="h-7 w-7 rounded-md flex items-center justify-center"
              :style="{ background: statusBg(coolantFlowStatus) }"
            >
              <i aria-hidden="true" class="pi pi-refresh text-xs" :style="{ color: statusColor(coolantFlowStatus) }" />
            </div>
            <Tag
              :severity="getReactorStatusSeverity(coolantFlowStatus)"
              :value="formatLabel(coolantFlowStatus)"
              data-testid="reactor-monitoring.coolant-flow-rate.status-badge"
            />
          </div>
        </div>
        <div data-testid="reactor-monitoring.coolant-flow-rate.chart" class="h-40">
          <Chart
            type="line"
            :data="coolantFlowData"
            :options="coolantFlowOptions"
            class="h-full"
            role="img"
            aria-label="Coolant flow rate trend line chart"
          />
        </div>
      </div>

      <!-- Coolant Pressure -->
      <div class="bg-surface-0 dark:bg-surface-900 p-6 shadow-sm rounded-2xl flex flex-col gap-4">
        <div class="flex justify-between items-start gap-3">
          <div>
            <div
              class="text-xs font-semibold text-surface-600 dark:text-surface-400 uppercase tracking-widest"
            >
              Coolant Pressure
            </div>
            <div
              data-testid="reactor-monitoring.coolant-pressure.kpi-value"
              class="text-3xl font-bold mt-1"
              aria-live="polite"
              aria-atomic="true"
              :style="{ color: statusColor(coolantPressureStatus) }"
            >
              {{ reactorData.coolant_pressure?.toFixed(1) }}
              <span class="text-base font-normal text-surface-600 dark:text-surface-400">bar</span>
            </div>
          </div>
          <div class="flex grow justify-between items-center gap-2">
            <div
              class="h-7 w-7 rounded-md flex items-center justify-center"
              :style="{ background: statusBg(coolantPressureStatus) }"
            >
              <i
                aria-hidden="true"
                class="pi pi-sliders-h text-xs"
                :style="{ color: statusColor(coolantPressureStatus) }"
              />
            </div>
            <Tag
              :severity="getReactorStatusSeverity(coolantPressureStatus)"
              :value="formatLabel(coolantPressureStatus)"
              data-testid="reactor-monitoring.coolant-pressure.status-badge"
            />
          </div>
        </div>
        <div data-testid="reactor-monitoring.coolant-pressure.chart" class="h-40">
          <Chart
            type="line"
            :data="coolantPressureData"
            :options="coolantPressureOptions"
            class="h-full"
            role="img"
            aria-label="Coolant pressure trend line chart"
          />
        </div>
      </div>

      <!-- Radiation Level -->
      <div class="bg-surface-0 dark:bg-surface-900 p-6 shadow-sm rounded-2xl flex flex-col gap-4">
        <div class="flex justify-between items-start gap-3">
          <div>
            <div
              class="text-xs font-semibold text-surface-600 dark:text-surface-400 uppercase tracking-widest"
            >
              Radiation Level
            </div>
            <div
              data-testid="reactor-monitoring.radiation-level.kpi-value"
              class="text-3xl font-bold mt-1"
              :class="{ 'motion-safe:animate-pulse': radiationStatus === 'danger' }"
              aria-live="polite"
              aria-atomic="true"
              :style="{ color: statusColor(radiationStatus) }"
            >
              {{ reactorData.radiation_level?.toFixed(2) }}
              <span class="text-base font-normal text-surface-600 dark:text-surface-400">mSv/h</span>
            </div>
          </div>
          <div class="flex grow justify-between items-center gap-2">
            <div
              class="h-7 w-7 rounded-md flex items-center justify-center"
              :class="{ 'motion-safe:animate-pulse': radiationStatus === 'danger' }"
              :style="{ background: statusBg(radiationStatus) }"
            >
              <i
                aria-hidden="true"
                class="pi pi-exclamation-triangle text-xs"
                :style="{ color: statusColor(radiationStatus) }"
              />
            </div>
            <Tag
              :severity="getReactorStatusSeverity(radiationStatus)"
              :value="formatLabel(radiationStatus)"
              data-testid="reactor-monitoring.radiation-level.status-badge"
            />
          </div>
        </div>
        <div data-testid="reactor-monitoring.radiation-level.chart" class="h-40">
          <Chart
            type="line"
            :data="radiationData"
            :options="radiationOptions"
            class="h-full"
            role="img"
            aria-label="Radiation level trend line chart"
          />
        </div>
      </div>

      <!-- Containment Integrity (Doughnut) -->
      <div class="bg-surface-0 dark:bg-surface-900 p-6 shadow-sm rounded-2xl flex flex-col gap-4">
        <div class="flex justify-between items-start gap-3">
          <div>
            <div
              class="text-xs font-semibold text-surface-600 dark:text-surface-400 uppercase tracking-widest"
            >
              Containment Integrity
            </div>
            <div
              data-testid="reactor-monitoring.containment-integrity.kpi-value"
              class="text-3xl font-bold mt-1"
              aria-live="polite"
              aria-atomic="true"
              :style="{ color: statusColor(containmentStatus) }"
            >
              {{ reactorData.containment_integrity?.toFixed(1)
              }}<span class="text-base font-normal text-surface-600 dark:text-surface-400">%</span>
            </div>
          </div>
          <div class="flex grow justify-between items-center gap-2">
            <div
              class="h-7 w-7 rounded-md flex items-center justify-center"
              :style="{ background: statusBg(containmentStatus) }"
            >
              <i aria-hidden="true" class="pi pi-shield text-xs" :style="{ color: statusColor(containmentStatus) }" />
            </div>
            <Tag
              :severity="getReactorStatusSeverity(containmentStatus)"
              :value="formatLabel(containmentStatus)"
              data-testid="reactor-monitoring.containment-integrity.status-badge"
            />
          </div>
        </div>
        <div
          data-testid="reactor-monitoring.containment-integrity.chart"
          class="relative h-40 flex items-center justify-center"
        >
          <Chart
            type="doughnut"
            :data="containmentData"
            :options="doughnutOptions"
            class="absolute inset-0"
            role="img"
            :aria-label="`Containment integrity doughnut chart: ${reactorData.containment_integrity?.toFixed(0)}%`"
          />
          <span
            class="relative z-10 text-xl font-bold pointer-events-none"
            :style="{ color: statusColor(containmentStatus) }"
          >
            {{ reactorData.containment_integrity?.toFixed(0) }}%
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import type { Ref } from "vue";
import Chart from "primevue/chart";
import Message from "primevue/message";
import ProgressSpinner from "primevue/progressspinner";
import Tag from "primevue/tag";
import { formatLabel } from "@/utils";
import { getReactorStatusSeverity } from "@/utils/reactor";
import type { ReactorStatus } from "@/types/reactorTelemetry";
import { useReactorTelemetry } from "@/composables/useReactorTelemetry";

const {
  reactorData,
  hasData,
  connectionError,
  labels,
  reactorPowerBuffer,
  coreTemperatureBuffer,
  radiationBuffer,
  coolantPressureBuffer,
  coolantFlowBuffer,
} = useReactorTelemetry();

// ─── Status helpers ───────────────────────────────────────────────────────────

// Chart.js does not resolve CSS custom properties — it needs concrete color strings.
// cssVar reads the computed value from the document root at call time so design
// tokens reach Chart.js datasets and scale options.
function cssVar(name: string): string {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

const STATUS_COLOR: Record<ReactorStatus, () => string> = {
  normal: () => cssVar("--p-success-600"),
  warning: () => cssVar("--p-warn-600"),
  danger: () => cssVar("--p-danger-600"),
};

const STATUS_BG: Record<ReactorStatus, () => string> = {
  normal: () => cssVar("--p-success-100"),
  warning: () => cssVar("--p-warn-100"),
  danger: () => cssVar("--p-danger-100"),
};

function statusColor(s: ReactorStatus): string {
  return STATUS_COLOR[s]();
}
function statusBg(s: ReactorStatus): string {
  return STATUS_BG[s]();
}

// ─── Per-metric status computeds ─────────────────────────────────────────────

const reactorPowerStatus = computed<ReactorStatus>(() => {
  const v = reactorData.value.reactor_power ?? 0;
  return v > 110 ? "danger" : v > 100 ? "warning" : "normal";
});

const coreTemperatureStatus = computed<ReactorStatus>(() => {
  const v = reactorData.value.core_temperature ?? 0;
  return v > 1000 ? "danger" : v > 900 ? "warning" : "normal";
});

const radiationStatus = computed<ReactorStatus>(() => {
  const v = reactorData.value.radiation_level ?? 0;
  return v > 50 ? "danger" : v > 5 ? "warning" : "normal";
});

const coolantPressureStatus = computed<ReactorStatus>(() => {
  const v = reactorData.value.coolant_pressure ?? 0;
  return v < 100 || v > 180 ? "danger" : v < 120 || v > 160 ? "warning" : "normal";
});

const coolantFlowStatus = computed<ReactorStatus>(() => {
  const v = reactorData.value.coolant_flow_rate ?? 0;
  return v < 50 ? "danger" : v < 70 ? "warning" : "normal";
});

const containmentStatus = computed<ReactorStatus>(() => {
  const v = reactorData.value.containment_integrity ?? 100;
  return v < 85 ? "danger" : v < 95 ? "warning" : "normal";
});

// ─── Chart helpers ────────────────────────────────────────────────────────────

function makeLineOptions(min: number, max: number) {
  return {
    animation: false,
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: { display: false },
      y: {
        min,
        max,
        grid: { color: cssVar("--p-surface-200") },
        ticks: { color: cssVar("--p-surface-400"), maxTicksLimit: 4 },
        border: { display: false },
      },
    },
  };
}

const reactorPowerOptions = makeLineOptions(0, 120);
const coreTemperatureOptions = makeLineOptions(200, 1200);
const radiationOptions = makeLineOptions(0, 500);
const coolantPressureOptions = makeLineOptions(0, 200);
const coolantFlowOptions = makeLineOptions(0, 100);

function makeLineDataset(buf: Ref<number[]>, status: ReactorStatus) {
  const color = statusColor(status);
  return {
    data: [...buf.value],
    borderColor: color,
    backgroundColor: color + "33",
    fill: true,
    tension: 0.4,
    pointRadius: 0,
    borderWidth: 2,
  };
}

// ─── Chart data computeds ────────────────────────────────────────────────────

const reactorPowerData = computed(() => ({
  labels: [...labels.value],
  datasets: [makeLineDataset(reactorPowerBuffer, reactorPowerStatus.value)],
}));

const coreTemperatureData = computed(() => ({
  labels: [...labels.value],
  datasets: [makeLineDataset(coreTemperatureBuffer, coreTemperatureStatus.value)],
}));

const radiationData = computed(() => ({
  labels: [...labels.value],
  datasets: [makeLineDataset(radiationBuffer, radiationStatus.value)],
}));

const coolantPressureData = computed(() => ({
  labels: [...labels.value],
  datasets: [makeLineDataset(coolantPressureBuffer, coolantPressureStatus.value)],
}));

const coolantFlowData = computed(() => ({
  labels: [...labels.value],
  datasets: [makeLineDataset(coolantFlowBuffer, coolantFlowStatus.value)],
}));

// ─── Containment integrity doughnut ──────────────────────────────────────────

const containmentData = computed(() => {
  const v = reactorData.value.containment_integrity ?? 100;
  return {
    datasets: [
      {
        data: [v, 100 - v],
        backgroundColor: [statusColor(containmentStatus.value), cssVar("--p-surface-100")],
        borderWidth: 0,
        circumference: 270,
        rotation: 225,
      },
    ],
  };
});

const doughnutOptions = {
  animation: false,
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: { enabled: false },
  },
  cutout: "70%",
};
</script>
