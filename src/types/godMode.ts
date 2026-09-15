export type ActuatorKind = "command" | "fault";

export const ACTUATORS = [
  {
    name: "rod_position",
    label: "Control rods",
    kind: "command",
    min: 0,
    max: 100,
    nominal: 50,
    testId: "god-mode.rod-position",
  },
  {
    name: "pump_speed",
    label: "Coolant pump",
    kind: "command",
    min: 0,
    max: 100,
    nominal: 80,
    testId: "god-mode.pump-speed",
  },
  {
    name: "steam_valve",
    label: "Steam valve",
    kind: "command",
    min: 0,
    max: 100,
    nominal: 50,
    testId: "god-mode.steam-valve",
  },
  {
    name: "leak_rate",
    label: "Coolant leak",
    kind: "fault",
    min: 0,
    max: 100,
    nominal: 0,
    testId: "god-mode.leak-rate",
  },
  {
    name: "xenon_injection",
    label: "Xenon inject",
    kind: "fault",
    min: 0,
    max: 100,
    nominal: 0,
    testId: "god-mode.xenon-injection",
  },
] as const;

export type Actuator = (typeof ACTUATORS)[number]["name"];

export interface ActuatorState {
  actuator: Actuator;
  value: number;
  kind: ActuatorKind;
}
