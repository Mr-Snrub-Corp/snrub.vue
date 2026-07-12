import { INCIDENT_STATUS, ESCALATION_LEVEL } from "@/constants/enums";
import type { IncidentReport } from "@/types/incidentReport";

let seq = 0;

/** Build an IncidentReport with sensible defaults; override any field per test. */
export function makeIncidentReport(overrides: Partial<IncidentReport> = {}): IncidentReport {
  seq += 1;
  return {
    uid: `report-${seq}`,
    incident_type_id: "type-1",
    description: null,
    severity: 3,
    status: INCIDENT_STATUS.REPORTED,
    escalation_level: ESCALATION_LEVEL.NONE,
    reported_by_user_id: "user-1",
    occurred_at: "2026-07-10T10:00:00Z",
    subjects: [],
    created: "2026-07-10T10:00:00Z",
    updated: "2026-07-10T10:00:00Z",
    ...overrides,
  };
}
