import { describe, it, expect, vi, beforeEach } from "vitest";
import { createPinia, setActivePinia } from "pinia";
import { INCIDENT_STATUS, ESCALATION_LEVEL, SUBJECT_ROLE } from "@/constants/enums";
import type { IncidentReport, IncidentReportCreate, IncidentReportUpdate } from "@/types/incidentReport";
import api from "@/services/httpService";
import { useIncidentReportsStore } from "./incidentReports";

vi.mock("@/services/httpService", () => ({
  default: {
    incidentReports: {
      create: vi.fn(),
      get: vi.fn(),
      getOne: vi.fn(),
      updateOne: vi.fn(),
    },
  },
}));

const mockReport: IncidentReport = {
  uid: "r1",
  incident_type_id: "t1",
  description: "Reactor coolant pressure anomaly",
  severity: 3,
  status: INCIDENT_STATUS.REPORTED,
  escalation_level: ESCALATION_LEVEL.NONE,
  reported_by_user_id: "u1",
  occurred_at: "2026-07-06T10:00:00Z",
  subjects: [{ uid: "s1", user_id: "u2", role: SUBJECT_ROLE.INVOLVED }],
  created: "2026-07-06T10:00:00Z",
  updated: "2026-07-06T10:00:00Z",
};

const mockReport2: IncidentReport = {
  uid: "r2",
  incident_type_id: "t2",
  description: null,
  severity: 1,
  status: INCIDENT_STATUS.UNDER_REVIEW,
  escalation_level: ESCALATION_LEVEL.MONITORING,
  reported_by_user_id: "u3",
  occurred_at: "2026-07-06T11:00:00Z",
  subjects: [],
  created: "2026-07-06T11:00:00Z",
  updated: "2026-07-06T11:00:00Z",
};

const mockCreatePayload: IncidentReportCreate = {
  incident_type_id: "t1",
  description: "Reactor coolant pressure anomaly",
  severity: 3,
  occurred_at: "2026-07-06T10:00:00Z",
};

const mockUpdatePayload: IncidentReportUpdate = {
  severity: 5,
  status: INCIDENT_STATUS.CONFIRMED,
};

describe("useIncidentReportsStore", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  describe("getAllIncidentReports", () => {
    it("returns all reports from the map", () => {
      const store = useIncidentReportsStore();
      store.incidentReports = { r1: mockReport, r2: mockReport2 };

      expect(store.getAllIncidentReports).toEqual([mockReport, mockReport2]);
    });

    it("returns empty array when no reports", () => {
      const store = useIncidentReportsStore();

      expect(store.getAllIncidentReports).toEqual([]);
    });
  });

  describe("getIncidentReportById", () => {
    it("returns report when uid matches", () => {
      const store = useIncidentReportsStore();
      store.incidentReports = { r1: mockReport };

      expect(store.getIncidentReportById("r1")).toEqual(mockReport);
    });

    it("returns undefined when uid not found", () => {
      const store = useIncidentReportsStore();
      store.incidentReports = { r1: mockReport };

      expect(store.getIncidentReportById("missing")).toBeUndefined();
    });
  });

  describe("$reset", () => {
    it("clears incident reports map", () => {
      const store = useIncidentReportsStore();
      store.incidentReports = { r1: mockReport };

      store.$reset();

      expect(store.incidentReports).toEqual({});
    });
  });

  describe("createIncidentReport", () => {
    it("inserts response into map and returns it", async () => {
      vi.mocked(api.incidentReports.create).mockResolvedValue(mockReport);
      const store = useIncidentReportsStore();

      const result = await store.createIncidentReport(mockCreatePayload);

      expect(result).toEqual(mockReport);
      expect(store.incidentReports["r1"]).toEqual(mockReport);
      expect(api.incidentReports.create).toHaveBeenCalledWith(mockCreatePayload);
    });

    it("logs and rethrows on API failure", async () => {
      const error = new Error("create failed");
      vi.mocked(api.incidentReports.create).mockRejectedValue(error);
      const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
      const store = useIncidentReportsStore();

      await expect(store.createIncidentReport(mockCreatePayload)).rejects.toThrow("create failed");
      expect(consoleSpy).toHaveBeenCalledWith("Error creating incident report:", error);

      consoleSpy.mockRestore();
    });
  });

  describe("fetchIncidentReports", () => {
    it("replaces entire map with API response", async () => {
      vi.mocked(api.incidentReports.get).mockResolvedValue([mockReport, mockReport2]);
      const store = useIncidentReportsStore();

      const result = await store.fetchIncidentReports();

      expect(result).toEqual([mockReport, mockReport2]);
      expect(store.incidentReports).toEqual({ r1: mockReport, r2: mockReport2 });
    });

    it("passes params through to the API", async () => {
      vi.mocked(api.incidentReports.get).mockResolvedValue([mockReport]);
      const store = useIncidentReportsStore();
      const params = { status: INCIDENT_STATUS.REPORTED };

      await store.fetchIncidentReports(params);

      expect(api.incidentReports.get).toHaveBeenCalledWith(params);
    });

    it("logs and rethrows on API failure", async () => {
      const error = new Error("fetch failed");
      vi.mocked(api.incidentReports.get).mockRejectedValue(error);
      const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
      const store = useIncidentReportsStore();

      await expect(store.fetchIncidentReports()).rejects.toThrow("fetch failed");
      expect(consoleSpy).toHaveBeenCalledWith("Error fetching incident reports:", error);

      consoleSpy.mockRestore();
    });
  });

  describe("fetchIncidentReportById", () => {
    it("adds fetched report to the map", async () => {
      vi.mocked(api.incidentReports.getOne).mockResolvedValue(mockReport);
      const store = useIncidentReportsStore();

      const result = await store.fetchIncidentReportById("r1");

      expect(result).toEqual(mockReport);
      expect(store.incidentReports["r1"]).toEqual(mockReport);
      expect(api.incidentReports.getOne).toHaveBeenCalledWith("r1");
    });

    it("overwrites existing map entry with refreshed data", async () => {
      const updated = { ...mockReport, severity: 5 };
      vi.mocked(api.incidentReports.getOne).mockResolvedValue(updated);
      const store = useIncidentReportsStore();
      store.incidentReports = { r1: { ...mockReport } };

      const result = await store.fetchIncidentReportById("r1");

      expect(result).toEqual(updated);
      expect(store.incidentReports["r1"]).toEqual(updated);
    });

    it("logs and rethrows on API failure", async () => {
      const error = new Error("not found");
      vi.mocked(api.incidentReports.getOne).mockRejectedValue(error);
      const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
      const store = useIncidentReportsStore();

      await expect(store.fetchIncidentReportById("r1")).rejects.toThrow("not found");
      expect(consoleSpy).toHaveBeenCalledWith("Error fetching incident report r1:", error);

      consoleSpy.mockRestore();
    });
  });

  describe("updateIncidentReport", () => {
    it("updates existing map entry and returns response", async () => {
      const updated = { ...mockReport, ...mockUpdatePayload };
      vi.mocked(api.incidentReports.updateOne).mockResolvedValue(updated);
      const store = useIncidentReportsStore();
      store.incidentReports = { r1: { ...mockReport } };

      const result = await store.updateIncidentReport("r1", mockUpdatePayload);

      expect(result).toEqual(updated);
      expect(store.incidentReports["r1"]).toEqual(updated);
      expect(api.incidentReports.updateOne).toHaveBeenCalledWith("r1", mockUpdatePayload);
    });

    it("logs and rethrows on API failure", async () => {
      const error = new Error("update failed");
      vi.mocked(api.incidentReports.updateOne).mockRejectedValue(error);
      const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
      const store = useIncidentReportsStore();

      await expect(store.updateIncidentReport("r1", mockUpdatePayload)).rejects.toThrow(
        "update failed",
      );
      expect(consoleSpy).toHaveBeenCalledWith("Error updating incident report r1:", error);

      consoleSpy.mockRestore();
    });
  });
});
