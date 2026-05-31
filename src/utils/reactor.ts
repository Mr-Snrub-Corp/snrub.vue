import type { ReactorStatus, ReactorTelemetry } from "@/types/reactorTelemetry";

const TELEMETRY_FIELDS = [
  "reactor_power",
  "core_temperature",
  "radiation_level",
  "coolant_pressure",
  "coolant_flow_rate",
  "containment_integrity",
] as const;

// Maps a reactor metric status to a PrimeVue Tag severity.
export const getReactorStatusSeverity = (status: ReactorStatus): string => {
  switch (status) {
    case "normal":
      return "success";
    case "warning":
      return "warn";
    case "danger":
      return "danger";
    default:
      return "info";
  }
};

export function parseReactorTelemetry(raw: unknown): ReactorTelemetry | null {
  if (typeof raw !== "object" || raw === null) return null;

  const record = raw as Record<string, unknown>;
  for (const field of TELEMETRY_FIELDS) {
    const value = record[field];
    if (typeof value !== "number" || !Number.isFinite(value)) return null;
  }

  return {
    reactor_power: record.reactor_power as number,
    core_temperature: record.core_temperature as number,
    radiation_level: record.radiation_level as number,
    coolant_pressure: record.coolant_pressure as number,
    coolant_flow_rate: record.coolant_flow_rate as number,
    containment_integrity: record.containment_integrity as number,
  };
}
