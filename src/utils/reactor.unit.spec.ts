import { describe, it, expect } from "vitest";
import { getReactorStatusSeverity, parseReactorTelemetry } from "./reactor";
import type { ReactorTelemetry } from "@/types/reactorTelemetry";

const validTelemetry: ReactorTelemetry = {
  reactor_power: 82.5,
  core_temperature: 310,
  radiation_level: 0.4,
  coolant_pressure: 15.2,
  coolant_flow_rate: 120,
  containment_integrity: 99.9,
};

describe("getReactorStatusSeverity", () => {
  it.each([
    ["normal", "success"],
    ["warning", "warn"],
    ["danger", "danger"],
  ] as const)("maps %s to %s", (status, expected) => {
    expect(getReactorStatusSeverity(status)).toBe(expected);
  });

  it("falls back to info for an unexpected status", () => {
    // @ts-expect-error — exercising the default branch with an out-of-type value
    expect(getReactorStatusSeverity("meltdown")).toBe("info");
  });
});

describe("parseReactorTelemetry", () => {
  it("returns the parsed telemetry for a valid frame", () => {
    expect(parseReactorTelemetry({ ...validTelemetry })).toEqual(validTelemetry);
  });

  it("keeps only the six metrics, stripping unknown fields", () => {
    expect(parseReactorTelemetry({ ...validTelemetry, extra: "ignored" })).toEqual(validTelemetry);
  });

  it.each([null, undefined, 42, "telemetry", true])(
    "returns null for non-object input: %s",
    (raw) => {
      expect(parseReactorTelemetry(raw)).toBeNull();
    },
  );

  it("returns null for an empty object (all fields missing)", () => {
    expect(parseReactorTelemetry({})).toBeNull();
  });

  it.each([
    "reactor_power",
    "core_temperature",
    "radiation_level",
    "coolant_pressure",
    "coolant_flow_rate",
    "containment_integrity",
  ])("returns null when the %s field is missing", (field) => {
    const frame: Record<string, number> = { ...validTelemetry };
    delete frame[field];
    expect(parseReactorTelemetry(frame)).toBeNull();
  });

  it.each([NaN, Infinity, -Infinity, "80", null])(
    "returns null when a field is non-finite or non-number (%s)",
    (badValue) => {
      expect(parseReactorTelemetry({ ...validTelemetry, reactor_power: badValue })).toBeNull();
    },
  );
});
