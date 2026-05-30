import type { ReactorStatus } from "@/types/reactorTelemetry";

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
