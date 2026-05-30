<template>
  <div
    class="px-6 py-4 md:px-12 md:py-6 lg:px-20 lg:py-8 bg-surface-50 dark:bg-surface-950 min-h-full"
  >
    <h1 class="text-3xl font-bold text-surface-900 dark:text-surface-0 mb-6">
      Reactor Monitoring
    </h1>

    <div
      v-if="!hasData"
      data-testid="reactor-monitoring.dashboard.loading-message"
      class="bg-surface-0 dark:bg-surface-900 p-6 shadow-sm rounded-2xl flex items-center gap-3"
    >
      <ProgressSpinner style="width: 1.5rem; height: 1.5rem" />
      <span class="text-surface-500 dark:text-surface-400">Awaiting telemetry…</span>
    </div>

    <div v-else class="grid grid-cols-1 gap-6 md:grid-cols-2">
      <!-- Reactor Power -->
      <div class="bg-surface-0 dark:bg-surface-900 p-6 shadow-sm rounded-2xl flex flex-col gap-4">
        <div class="flex justify-between items-start">
          <div>
            <div class="text-xs font-semibold text-surface-400 dark:text-surface-500 uppercase tracking-widest">
              Reactor Power
            </div>
            <div
              data-testid="reactor-monitoring.reactor-power.kpi-value"
              class="text-3xl font-bold mt-1"
              :style="{ color: statusColor(reactorPowerStatus) }"
            >
              {{ reactorData.reactor_power?.toFixed(1) }}
              <span class="text-base font-normal text-surface-400">%</span>
            </div>
            <div class="text-xs mt-1" :style="{ color: statusColor(reactorPowerStatus) }">
              Normal 85–100 · Warning 100–110 · Danger &gt;110
            </div>
          </div>
          <div class="flex flex-col items-end gap-2">
            <div
              class="w-10 h-10 rounded-lg flex items-center justify-center"
              :style="{ background: statusBg(reactorPowerStatus) }"
            >
              <i class="pi pi-bolt" :style="{ color: statusColor(reactorPowerStatus) }" />
            </div>
            <Tag
              :severity="getReactorStatusSeverity(reactorPowerStatus)"
              :value="formatLabel(reactorPowerStatus)"
              data-testid="reactor-monitoring.reactor-power.status-badge"
            />
          </div>
        </div>
        <div data-testid="reactor-monitoring.reactor-power.chart" class="h-40">
          <Chart type="line" :data="reactorPowerData" :options="reactorPowerOptions" class="h-full" />
        </div>
      </div>

      <!-- Core Temperature -->
      <div class="bg-surface-0 dark:bg-surface-900 p-6 shadow-sm rounded-2xl flex flex-col gap-4">
        <div class="flex justify-between items-start">
          <div>
            <div class="text-xs font-semibold text-surface-400 dark:text-surface-500 uppercase tracking-widest">
              Core Temperature
            </div>
            <div
              data-testid="reactor-monitoring.core-temperature.kpi-value"
              class="text-3xl font-bold mt-1"
              :style="{ color: statusColor(coreTemperatureStatus) }"
            >
              {{ reactorData.core_temperature?.toFixed(1) }}
              <span class="text-base font-normal text-surface-400">°C</span>
            </div>
            <div class="text-xs mt-1" :style="{ color: statusColor(coreTemperatureStatus) }">
              Normal 500–900 · Warning 900–1000 · Danger &gt;1000
            </div>
          </div>
          <div class="flex flex-col items-end gap-2">
            <div
              class="w-10 h-10 rounded-lg flex items-center justify-center"
              :style="{ background: statusBg(coreTemperatureStatus) }"
            >
              <i class="pi pi-sun" :style="{ color: statusColor(coreTemperatureStatus) }" />
            </div>
            <Tag
              :severity="getReactorStatusSeverity(coreTemperatureStatus)"
              :value="formatLabel(coreTemperatureStatus)"
              data-testid="reactor-monitoring.core-temperature.status-badge"
            />
          </div>
        </div>
        <div data-testid="reactor-monitoring.core-temperature.chart" class="h-40">
          <Chart type="line" :data="coreTemperatureData" :options="coreTemperatureOptions" class="h-full" />
        </div>
      </div>

      <!-- Coolant Flow Rate -->
      <div class="bg-surface-0 dark:bg-surface-900 p-6 shadow-sm rounded-2xl flex flex-col gap-4">
        <div class="flex justify-between items-start">
          <div>
            <div class="text-xs font-semibold text-surface-400 dark:text-surface-500 uppercase tracking-widest">
              Coolant Flow Rate
            </div>
            <div
              data-testid="reactor-monitoring.coolant-flow-rate.kpi-value"
              class="text-3xl font-bold mt-1"
              :style="{ color: statusColor(coolantFlowStatus) }"
            >
              {{ reactorData.coolant_flow_rate?.toFixed(1) }}
              <span class="text-base font-normal text-surface-400">%</span>
            </div>
            <div class="text-xs mt-1" :style="{ color: statusColor(coolantFlowStatus) }">
              Normal 70–100 · Warning 50–70 · Danger &lt;50
            </div>
          </div>
          <div class="flex flex-col items-end gap-2">
            <div
              class="w-10 h-10 rounded-lg flex items-center justify-center"
              :style="{ background: statusBg(coolantFlowStatus) }"
            >
              <i class="pi pi-refresh" :style="{ color: statusColor(coolantFlowStatus) }" />
            </div>
            <Tag
              :severity="getReactorStatusSeverity(coolantFlowStatus)"
              :value="formatLabel(coolantFlowStatus)"
              data-testid="reactor-monitoring.coolant-flow-rate.status-badge"
            />
          </div>
        </div>
        <div data-testid="reactor-monitoring.coolant-flow-rate.chart" class="h-40">
          <Chart type="line" :data="coolantFlowData" :options="coolantFlowOptions" class="h-full" />
        </div>
      </div>

      <!-- Coolant Pressure -->
      <div class="bg-surface-0 dark:bg-surface-900 p-6 shadow-sm rounded-2xl flex flex-col gap-4">
        <div class="flex justify-between items-start">
          <div>
            <div class="text-xs font-semibold text-surface-400 dark:text-surface-500 uppercase tracking-widest">
              Coolant Pressure
            </div>
            <div
              data-testid="reactor-monitoring.coolant-pressure.kpi-value"
              class="text-3xl font-bold mt-1"
              :style="{ color: statusColor(coolantPressureStatus) }"
            >
              {{ reactorData.coolant_pressure?.toFixed(1) }}
              <span class="text-base font-normal text-surface-400">bar</span>
            </div>
            <div class="text-xs mt-1" :style="{ color: statusColor(coolantPressureStatus) }">
              Normal 120–160 · Warning 100–120 / 160–180 · Danger &lt;100 / &gt;180
            </div>
          </div>
          <div class="flex flex-col items-end gap-2">
            <div
              class="w-10 h-10 rounded-lg flex items-center justify-center"
              :style="{ background: statusBg(coolantPressureStatus) }"
            >
              <i class="pi pi-sliders-h" :style="{ color: statusColor(coolantPressureStatus) }" />
            </div>
            <Tag
              :severity="getReactorStatusSeverity(coolantPressureStatus)"
              :value="formatLabel(coolantPressureStatus)"
              data-testid="reactor-monitoring.coolant-pressure.status-badge"
            />
          </div>
        </div>
        <div data-testid="reactor-monitoring.coolant-pressure.chart" class="h-40">
          <Chart type="line" :data="coolantPressureData" :options="coolantPressureOptions" class="h-full" />
        </div>
      </div>

      <!-- Radiation Level -->
      <div class="bg-surface-0 dark:bg-surface-900 p-6 shadow-sm rounded-2xl flex flex-col gap-4">
        <div class="flex justify-between items-start">
          <div>
            <div class="text-xs font-semibold text-surface-400 dark:text-surface-500 uppercase tracking-widest">
              Radiation Level
            </div>
            <div
              data-testid="reactor-monitoring.radiation-level.kpi-value"
              class="text-3xl font-bold mt-1"
              :class="{ 'animate-pulse': radiationStatus === 'danger' }"
              :style="{ color: statusColor(radiationStatus) }"
            >
              {{ reactorData.radiation_level?.toFixed(2) }}
              <span class="text-base font-normal text-surface-400">mSv/h</span>
            </div>
            <div class="text-xs mt-1" :style="{ color: statusColor(radiationStatus) }">
              Normal 0–5 · Warning 5–50 · Danger &gt;50
            </div>
          </div>
          <div class="flex flex-col items-end gap-2">
            <div
              class="w-10 h-10 rounded-lg flex items-center justify-center"
              :class="{ 'animate-pulse': radiationStatus === 'danger' }"
              :style="{ background: statusBg(radiationStatus) }"
            >
              <i class="pi pi-exclamation-triangle" :style="{ color: statusColor(radiationStatus) }" />
            </div>
            <Tag
              :severity="getReactorStatusSeverity(radiationStatus)"
              :value="formatLabel(radiationStatus)"
              data-testid="reactor-monitoring.radiation-level.status-badge"
            />
          </div>
        </div>
        <div data-testid="reactor-monitoring.radiation-level.chart" class="h-40">
          <Chart type="line" :data="radiationData" :options="radiationOptions" class="h-full" />
        </div>
      </div>

      <!-- Containment Integrity (Doughnut) -->
      <div class="bg-surface-0 dark:bg-surface-900 p-6 shadow-sm rounded-2xl flex flex-col gap-4">
        <div class="flex justify-between items-start">
          <div>
            <div class="text-xs font-semibold text-surface-400 dark:text-surface-500 uppercase tracking-widest">
              Containment Integrity
            </div>
            <div
              data-testid="reactor-monitoring.containment-integrity.kpi-value"
              class="text-3xl font-bold mt-1"
              :style="{ color: statusColor(containmentStatus) }"
            >
              {{ reactorData.containment_integrity?.toFixed(1)
              }}<span class="text-base font-normal text-surface-400">%</span>
            </div>
            <div class="text-xs mt-1" :style="{ color: statusColor(containmentStatus) }">
              Normal 95–100 · Warning 85–95 · Danger &lt;85
            </div>
          </div>
          <div class="flex flex-col items-end gap-2">
            <div
              class="w-10 h-10 rounded-lg flex items-center justify-center"
              :style="{ background: statusBg(containmentStatus) }"
            >
              <i class="pi pi-shield" :style="{ color: statusColor(containmentStatus) }" />
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
import { computed, onBeforeUnmount, ref } from "vue";
import type { Ref } from "vue";
import Chart from "primevue/chart";
import ProgressSpinner from "primevue/progressspinner";
import Tag from "primevue/tag";
import { useAuthStore } from "@/stores/auth";
import { formatLabel } from "@/utils";
import { getReactorStatusSeverity } from "@/utils/reactor";
import type { ReactorStatus, ReactorTelemetry } from "@/types/reactorTelemetry";

// ─── WebSocket & buffers ──────────────────────────────────────────────────────

const MAX_POINTS = 50;
const authStore = useAuthStore();
const reactorData = ref<Partial<ReactorTelemetry>>({});
const hasData = ref(false);

const labels = ref<string[]>([]);
const reactorPowerBuf = ref<number[]>([]);
const coreTemperatureBuf = ref<number[]>([]);
const radiationBuf = ref<number[]>([]);
const coolantPressureBuf = ref<number[]>([]);
const coolantFlowBuf = ref<number[]>([]);

function pushBuf(buf: Ref<number[]>, value: number): void {
  buf.value.push(value);
  if (buf.value.length > MAX_POINTS) buf.value.shift();
}

const ws = new WebSocket(`ws://localhost:8000/api/ws/telemetry?token=${authStore.token}`);

ws.onmessage = (e: MessageEvent) => {
  const data = JSON.parse(e.data as string) as ReactorTelemetry;
  reactorData.value = data;
  hasData.value = true;

  const label = new Date().toLocaleTimeString("en-AU", { hour12: false });
  labels.value.push(label);
  if (labels.value.length > MAX_POINTS) labels.value.shift();

  pushBuf(reactorPowerBuf, data.reactor_power);
  pushBuf(coreTemperatureBuf, data.core_temperature);
  pushBuf(radiationBuf, data.radiation_level);
  pushBuf(coolantPressureBuf, data.coolant_pressure);
  pushBuf(coolantFlowBuf, data.coolant_flow_rate);
};

onBeforeUnmount(() => ws.close());

// ─── Status helpers ───────────────────────────────────────────────────────────

function cssVar(name: string): string {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

const STATUS_COLOR: Record<ReactorStatus, () => string> = {
  normal:  () => cssVar("--p-success-600"),
  warning: () => cssVar("--p-warn-600"),
  danger:  () => cssVar("--p-danger-600"),
};

const STATUS_BG: Record<ReactorStatus, () => string> = {
  normal:  () => cssVar("--p-success-100"),
  warning: () => cssVar("--p-warn-100"),
  danger:  () => cssVar("--p-danger-100"),
};

function statusColor(s: ReactorStatus): string { return STATUS_COLOR[s](); }
function statusBg(s: ReactorStatus): string    { return STATUS_BG[s](); }

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

const reactorPowerOptions    = makeLineOptions(0, 120);
const coreTemperatureOptions = makeLineOptions(200, 1200);
const radiationOptions       = makeLineOptions(0, 500);
const coolantPressureOptions = makeLineOptions(0, 200);
const coolantFlowOptions     = makeLineOptions(0, 100);

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
  datasets: [makeLineDataset(reactorPowerBuf, reactorPowerStatus.value)],
}));

const coreTemperatureData = computed(() => ({
  labels: [...labels.value],
  datasets: [makeLineDataset(coreTemperatureBuf, coreTemperatureStatus.value)],
}));

const radiationData = computed(() => ({
  labels: [...labels.value],
  datasets: [makeLineDataset(radiationBuf, radiationStatus.value)],
}));

const coolantPressureData = computed(() => ({
  labels: [...labels.value],
  datasets: [makeLineDataset(coolantPressureBuf, coolantPressureStatus.value)],
}));

const coolantFlowData = computed(() => ({
  labels: [...labels.value],
  datasets: [makeLineDataset(coolantFlowBuf, coolantFlowStatus.value)],
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
    legend:  { display: false },
    tooltip: { enabled: false },
  },
  cutout: "70%",
};
</script>
