import { describe, it, expect } from "vitest";
import { getTagSeverity, getEscalationSeverity, getSeverityClass } from "./incident";
import { INCIDENT_STATUS, ESCALATION_LEVEL } from "@/constants/enums";

describe("getTagSeverity", () => {
  it.each([
    [INCIDENT_STATUS.REPORTED, "warn"],
    [INCIDENT_STATUS.UNDER_REVIEW, "warn"],
    [INCIDENT_STATUS.MITIGATION_IN_PROGRESS, "warn"],
    [INCIDENT_STATUS.FALSE_ALARM, "info"],
    [INCIDENT_STATUS.CONTAINED, "success"],
    [INCIDENT_STATUS.RESOLVED, "success"],
  ])("maps %s to %s", (status, expected) => {
    expect(getTagSeverity(status)).toBe(expected);
  });

  it("falls back to info for known-but-unmapped statuses", () => {
    expect(getTagSeverity(INCIDENT_STATUS.CONFIRMED)).toBe("info");
    expect(getTagSeverity(INCIDENT_STATUS.CLOSED)).toBe("info");
  });

  it("falls back to info for an unknown status", () => {
    expect(getTagSeverity("nonsense")).toBe("info");
  });
});

describe("getEscalationSeverity", () => {
  it.each([
    [ESCALATION_LEVEL.NONE, "secondary"],
    [ESCALATION_LEVEL.MONITORING, "info"],
    [ESCALATION_LEVEL.ESCALATED, "warn"],
    [ESCALATION_LEVEL.EMERGENCY_STATE_DECLARED, "danger"],
  ])("maps %s to %s", (level, expected) => {
    expect(getEscalationSeverity(level)).toBe(expected);
  });

  it("falls back to info for an unknown level", () => {
    expect(getEscalationSeverity("nonsense")).toBe("info");
  });
});

describe("getSeverityClass", () => {
  it.each([
    [1, "bg-emerald-700 text-white"],
    [2, "bg-lime-600 text-white"],
    [3, "bg-yellow-300 text-black"],
    [4, "bg-amber-400 text-black"],
    [5, "bg-orange-500 text-white"],
    [6, "bg-red-600 text-white"],
    [7, "bg-fuchsia-600 text-white"],
  ])("maps severity %i to its class", (severity, expected) => {
    expect(getSeverityClass(severity)).toBe(expected);
  });

  it.each([0, 8, -1, 1.5, NaN])("falls back to gray for out-of-range severity %s", (severity) => {
    expect(getSeverityClass(severity)).toBe("bg-gray-500 text-white");
  });
});
