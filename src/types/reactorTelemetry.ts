export interface ReactorTelemetry {
  reactor_power: number;
  core_temperature: number;
  radiation_level: number;
  coolant_pressure: number;
  coolant_flow_rate: number;
  containment_integrity: number;
}

export type ReactorStatus = "normal" | "warning" | "danger";
