import type { IncidentType } from "@/types/incidentType";

let seq = 0;

/** Build an IncidentType with sensible defaults; override any field per test. */
export function makeIncidentType(overrides: Partial<IncidentType> = {}): IncidentType {
  seq += 1;
  return {
    uid: `type-${seq}`,
    code: `INC-${seq}`,
    name: `Incident Type ${seq}`,
    category_id: "cat-1",
    default_severity: 3,
    description: null,
    created: "2026-07-06T10:00:00Z",
    updated: "2026-07-06T10:00:00Z",
    ...overrides,
  };
}
