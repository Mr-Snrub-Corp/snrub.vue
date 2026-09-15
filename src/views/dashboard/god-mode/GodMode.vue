<template>
  <PageShell content-class="h-screen overflow-y-auto">
    <div v-if="authStore.isSuperAdmin" data-testid="god-mode.dashboard.root">
      <div class="mb-2 flex items-center gap-3">
        <i class="pi pi-bolt text-3xl text-primary" aria-hidden="true" />
        <h1 class="text-3xl font-bold text-surface-900 dark:text-surface-0">God Mode</h1>
      </div>
      <p class="mb-8 text-surface-600 dark:text-surface-300">
        Command plant actuators over REST. Commands set operating points; faults inject
        malfunctions. Incidents are emitted by the backend on sustained excursion — not by these
        controls.
      </p>

      <section
        v-for="section in sections"
        :key="section.kind"
        class="mb-10 last:mb-0"
        :aria-labelledby="`${section.kind}-heading`"
      >
        <div class="mb-4 flex items-center gap-2">
          <i :class="[section.icon, 'text-xl text-primary']" aria-hidden="true" />
          <h2
            :id="`${section.kind}-heading`"
            class="text-xl font-semibold text-surface-900 dark:text-surface-0"
          >
            {{ section.title }}
          </h2>
        </div>

        <div class="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          <Card v-for="a in section.items" :key="a.name">
            <template #title>
              <div class="flex items-center justify-between gap-2">
                <span class="text-lg font-semibold">{{ a.label }}</span>
                <Tag
                  :value="statusTag(a).value"
                  :severity="statusTag(a).severity"
                  :data-testid="`${a.testId}.state-tag`"
                />
              </div>
            </template>
            <template #subtitle>
              <span class="text-sm text-surface-500 dark:text-surface-400">
                Nominal {{ a.nominal }}%
              </span>
            </template>
            <template #content>
              <div class="flex flex-col gap-4">
                <!-- Fault: arm/disarm toggle only -->
                <div v-if="a.kind === 'fault'" class="flex items-center justify-between">
                  <span class="text-sm text-surface-500 dark:text-surface-400">Arm fault</span>
                  <ToggleSwitch
                    :model-value="localPositions[a.name] > 0"
                    :aria-label="`Arm ${a.label}`"
                    :data-testid="`${a.testId}.arm-btn`"
                    @update:model-value="(on: boolean) => onFaultToggle(a.name, on)"
                  />
                </div>

                <!-- Command: slider + numeric input -->
                <template v-else>
                  <Slider
                    v-model="localPositions[a.name]"
                    class="w-full"
                    :min="a.min"
                    :max="a.max"
                    :aria-label="a.label"
                    :data-testid="`${a.testId}.slider`"
                    @slideend="void persistActuator(a.name)"
                  />
                  <div class="flex items-center gap-2">
                    <div class="w-24">
                      <InputNumber
                        v-model="localPositions[a.name]"
                        input-class="w-full"
                        :min="a.min"
                        :max="a.max"
                        :min-fraction-digits="0"
                        :max-fraction-digits="0"
                        :use-grouping="false"
                        :aria-label="`${a.label} value`"
                        :data-testid="`${a.testId}.value-input`"
                        @update:model-value="onValueInput(a.name)"
                      />
                    </div>
                    <span class="text-sm text-surface-500 dark:text-surface-400">%</span>
                  </div>
                </template>
              </div>
            </template>
          </Card>
        </div>
      </section>
    </div>
  </PageShell>
</template>

<script setup lang="ts">
import { onBeforeUnmount, ref } from "vue";
import Card from "primevue/card";
import InputNumber from "primevue/inputnumber";
import Slider from "primevue/slider";
import Tag from "primevue/tag";
import ToggleSwitch from "primevue/toggleswitch";
import { useToast } from "primevue/usetoast";
import PageShell from "@/components/layout/PageShell.vue";
import { useAuthStore } from "@/stores/auth";
import { useGodModeStore } from "@/stores/godMode";
import { ACTUATORS, type Actuator } from "@/types/godMode";
import { HttpError } from "@/types/errors";
import { TOAST_LIFE } from "@/constants/toast";
import { debounce } from "@/utils";

const FAULT_RESTORE_DEFAULT = 50;
const PERSIST_DEBOUNCE_MS = 250;

const authStore = useAuthStore();
const godModeStore = useGodModeStore();
const toast = useToast();

const commands = ACTUATORS.filter((a) => a.kind === "command");
const faults = ACTUATORS.filter((a) => a.kind === "fault");

const sections = [
  { kind: "command" as const, title: "Commands", icon: "pi pi-sliders-h", items: commands },
  { kind: "fault" as const, title: "Faults", icon: "pi pi-exclamation-triangle", items: faults },
];

const localPositions = ref<Record<string, number>>({ ...godModeStore.positions });

const persistByName: Record<string, ReturnType<typeof debounce<() => void>>> = Object.fromEntries(
  commands.map((a) => [a.name, debounce(() => void persistActuator(a.name), PERSIST_DEBOUNCE_MS)]),
);

function statusTag(a: (typeof ACTUATORS)[number]) {
  if (a.kind === "fault") {
    const active = localPositions.value[a.name] > 0;
    return { value: active ? "Active" : "Off", severity: active ? "danger" : "secondary" };
  }
  const nominal = localPositions.value[a.name] === a.nominal;
  return { value: nominal ? "Nominal" : "Commanded", severity: nominal ? "secondary" : "info" };
}

function onValueInput(name: Actuator) {
  const value = localPositions.value[name];
  if (value === null || value === undefined) {
    return;
  }
  persistByName[name]();
}

function onFaultToggle(name: Actuator, on: boolean) {
  const next = on ? FAULT_RESTORE_DEFAULT : 0;
  localPositions.value[name] = next;
  godModeStore.setPosition(name, next);
  void persistActuator(name);
}

async function persistActuator(name: Actuator) {
  const value = localPositions.value[name];
  try {
    await godModeStore.setActuator(name, value);
  } catch (err) {
    localPositions.value[name] = godModeStore.positions[name];
    toast.add({
      severity: "error",
      summary: "Error",
      detail:
        err instanceof HttpError && err.status === 503
          ? "Plant broker unavailable"
          : "Failed to set actuator",
      life: TOAST_LIFE,
    });
  }
}

onBeforeUnmount(() => {
  for (const a of commands) {
    persistByName[a.name].cancel();
    const value = localPositions.value[a.name];
    godModeStore.setPosition(a.name, value);
    if (value !== godModeStore.lastPersisted[a.name]) {
      void persistActuator(a.name);
    }
  }
});
</script>
