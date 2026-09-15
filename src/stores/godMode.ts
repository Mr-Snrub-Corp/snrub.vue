import { defineStore } from "pinia";
import { ref } from "vue";
import api from "@/services/httpService";
import { ACTUATORS, type Actuator, type ActuatorState } from "@/types/godMode";

function nominals(): Record<string, number> {
  return Object.fromEntries(ACTUATORS.map((a) => [a.name, a.nominal]));
}

export const useGodModeStore = defineStore("godMode", () => {
  const positions = ref<Record<string, number>>(nominals());
  const lastPersisted = ref<Record<string, number>>(nominals());

  async function fetchActuators() {
    try {
      const response: ActuatorState[] = await api.godMode.getActuators();
      const map: Record<string, number> = { ...positions.value };
      response.forEach((state) => {
        map[state.actuator] = state.value;
      });
      positions.value = map;
      lastPersisted.value = { ...map };
      return response;
    } catch (err) {
      console.error("Error fetching god-mode actuators:", err);
      throw err;
    }
  }

  function setPosition(actuator: Actuator, value: number) {
    positions.value[actuator] = value;
  }

  async function setActuator(actuator: Actuator, value: number) {
    setPosition(actuator, value);
    try {
      await api.godMode.setActuator(actuator, { value });
      lastPersisted.value[actuator] = value;
    } catch (err) {
      setPosition(actuator, lastPersisted.value[actuator]);
      console.error("Error setting god-mode actuator:", err);
      throw err;
    }
  }

  function $reset() {
    const next = nominals();
    positions.value = next;
    lastPersisted.value = { ...next };
  }

  return {
    positions,
    lastPersisted,
    setPosition,
    setActuator,
    fetchActuators,
    $reset,
  };
});
