import { describe, it, expect, vi, beforeEach } from "vitest";
import { createPinia, setActivePinia } from "pinia";
import type { IncidentTypeCreate } from "@/types/incidentType";
import api from "@/services/httpService";
import { useIncidentTypesStore } from "./incidentTypes";
import { makeIncidentType } from "@/test/factories/incidentType.factory";

vi.mock("@/services/httpService", () => ({
  default: {
    incidentTypes: {
      create: vi.fn(),
      get: vi.fn(),
      getOne: vi.fn(),
      updateOne: vi.fn(),
    },
  },
}));

const mockType = makeIncidentType({ uid: "t1", code: "FIRE", name: "Fire" });
const mockType2 = makeIncidentType({ uid: "t2", code: "FLOOD", name: "Flood" });

const mockCreatePayload: IncidentTypeCreate = {
  code: "FIRE",
  name: "Fire",
  category_id: "cat-1",
  default_severity: 4,
};

describe("useIncidentTypesStore", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  describe("getAllIncidentTypes", () => {
    it("returns all types from the map", () => {
      const store = useIncidentTypesStore();
      store.incidentTypes = { t1: mockType, t2: mockType2 };

      expect(store.getAllIncidentTypes).toEqual([mockType, mockType2]);
    });

    it("returns empty array when there are no types", () => {
      const store = useIncidentTypesStore();

      expect(store.getAllIncidentTypes).toEqual([]);
    });
  });

  describe("getIncidentTypeById", () => {
    it("returns the type when uid matches", () => {
      const store = useIncidentTypesStore();
      store.incidentTypes = { t1: mockType };

      expect(store.getIncidentTypeById("t1")).toEqual(mockType);
    });

    it("returns undefined when uid is not found", () => {
      const store = useIncidentTypesStore();
      store.incidentTypes = { t1: mockType };

      expect(store.getIncidentTypeById("missing")).toBeUndefined();
    });
  });

  describe("$reset", () => {
    it("clears the map", () => {
      const store = useIncidentTypesStore();
      store.incidentTypes = { t1: mockType };

      store.$reset();

      expect(store.incidentTypes).toEqual({});
    });
  });

  describe("createIncidentType", () => {
    it("inserts the response into the map and returns it", async () => {
      vi.mocked(api.incidentTypes.create).mockResolvedValue(mockType);
      const store = useIncidentTypesStore();

      const result = await store.createIncidentType(mockCreatePayload);

      expect(result).toEqual(mockType);
      expect(store.incidentTypes["t1"]).toEqual(mockType);
      expect(api.incidentTypes.create).toHaveBeenCalledWith(mockCreatePayload);
    });

    it("logs and rethrows on API failure", async () => {
      const error = new Error("create failed");
      vi.mocked(api.incidentTypes.create).mockRejectedValue(error);
      const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
      const store = useIncidentTypesStore();

      await expect(store.createIncidentType(mockCreatePayload)).rejects.toThrow("create failed");
      expect(consoleSpy).toHaveBeenCalledWith("Error creating incident type:", error);

      consoleSpy.mockRestore();
    });
  });

  describe("fetchIncidentTypes", () => {
    it("builds the map from the API response array", async () => {
      vi.mocked(api.incidentTypes.get).mockResolvedValue([mockType, mockType2]);
      const store = useIncidentTypesStore();

      const result = await store.fetchIncidentTypes();

      expect(result).toEqual([mockType, mockType2]);
      expect(store.incidentTypes).toEqual({ t1: mockType, t2: mockType2 });
    });

    it("logs and rethrows on API failure", async () => {
      const error = new Error("fetch failed");
      vi.mocked(api.incidentTypes.get).mockRejectedValue(error);
      const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
      const store = useIncidentTypesStore();

      await expect(store.fetchIncidentTypes()).rejects.toThrow("fetch failed");
      expect(consoleSpy).toHaveBeenCalledWith("Error fetching incident types:", error);

      consoleSpy.mockRestore();
    });
  });

  describe("fetchIncidentTypeById", () => {
    it("adds the fetched type to the map", async () => {
      vi.mocked(api.incidentTypes.getOne).mockResolvedValue(mockType);
      const store = useIncidentTypesStore();

      const result = await store.fetchIncidentTypeById("t1");

      expect(result).toEqual(mockType);
      expect(store.incidentTypes["t1"]).toEqual(mockType);
      expect(api.incidentTypes.getOne).toHaveBeenCalledWith("t1");
    });

    it("logs and rethrows on API failure", async () => {
      const error = new Error("not found");
      vi.mocked(api.incidentTypes.getOne).mockRejectedValue(error);
      const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
      const store = useIncidentTypesStore();

      await expect(store.fetchIncidentTypeById("t1")).rejects.toThrow("not found");
      expect(consoleSpy).toHaveBeenCalledWith("Error fetching incident type t1:", error);

      consoleSpy.mockRestore();
    });
  });

  describe("updateIncidentType", () => {
    it("merges the response into the existing entry", async () => {
      const updated = { ...mockType, name: "Wildfire" };
      vi.mocked(api.incidentTypes.updateOne).mockResolvedValue(updated);
      const store = useIncidentTypesStore();
      store.incidentTypes = { t1: { ...mockType } };

      const result = await store.updateIncidentType("t1", { name: "Wildfire" });

      expect(result).toEqual(updated);
      expect(store.incidentTypes["t1"]).toEqual(updated);
      expect(api.incidentTypes.updateOne).toHaveBeenCalledWith("t1", { name: "Wildfire" });
    });

    it("logs and rethrows on API failure", async () => {
      const error = new Error("update failed");
      vi.mocked(api.incidentTypes.updateOne).mockRejectedValue(error);
      const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
      const store = useIncidentTypesStore();

      await expect(store.updateIncidentType("t1", { name: "x" })).rejects.toThrow("update failed");
      expect(consoleSpy).toHaveBeenCalledWith("Error updating incident type t1:", error);

      consoleSpy.mockRestore();
    });
  });
});
