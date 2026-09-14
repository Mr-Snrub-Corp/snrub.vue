import { describe, it, expect, vi, beforeEach } from "vitest";
import { createPinia, setActivePinia } from "pinia";
import api from "@/services/httpService";
import { useGodModeStore } from "./godMode";

vi.mock("@/services/httpService", () => ({
  default: {
    godMode: {
      getActuators: vi.fn(),
      setActuator: vi.fn(),
    },
  },
}));

describe("useGodModeStore", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  describe("setPosition", () => {
    it("updates positions without calling the API", () => {
      const store = useGodModeStore();

      store.setPosition("rod_position", 12);

      expect(store.positions.rod_position).toBe(12);
      expect(api.godMode.setActuator).not.toHaveBeenCalled();
    });
  });

  describe("fetchActuators", () => {
    it("hydrates positions from the API response", async () => {
      vi.mocked(api.godMode.getActuators).mockResolvedValue([
        { actuator: "rod_position", value: 12, kind: "command" },
        { actuator: "pump_speed", value: 20, kind: "command" },
      ]);
      const store = useGodModeStore();

      const result = await store.fetchActuators();

      expect(result).toHaveLength(2);
      expect(store.positions.rod_position).toBe(12);
      expect(store.positions.pump_speed).toBe(20);
      expect(store.positions.steam_valve).toBe(50);
      expect(store.lastPersisted.rod_position).toBe(12);
    });

    it("logs and rethrows on API failure without wiping nominals", async () => {
      const error = new Error("fetch failed");
      vi.mocked(api.godMode.getActuators).mockRejectedValue(error);
      const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
      const store = useGodModeStore();

      await expect(store.fetchActuators()).rejects.toThrow("fetch failed");
      expect(store.positions.rod_position).toBe(50);
      expect(consoleSpy).toHaveBeenCalledWith("Error fetching god-mode actuators:", error);

      consoleSpy.mockRestore();
    });
  });

  describe("setActuator", () => {
    it("writes positions before the API resolves", async () => {
      let resolveApi: (value: unknown) => void = () => undefined;
      vi.mocked(api.godMode.setActuator).mockImplementation(
        () =>
          new Promise((resolve) => {
            resolveApi = resolve;
          }),
      );
      const store = useGodModeStore();

      const pending = store.setActuator("rod_position", 12);
      expect(store.positions.rod_position).toBe(12);

      resolveApi({});
      await pending;
      expect(api.godMode.setActuator).toHaveBeenCalledWith("rod_position", { value: 12 });
    });

    it("rolls positions back to last persisted value on API failure", async () => {
      vi.mocked(api.godMode.setActuator).mockRejectedValue(new Error("broker down"));
      const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
      const store = useGodModeStore();
      store.setPosition("rod_position", 12);

      await expect(store.setActuator("rod_position", 12)).rejects.toThrow("broker down");

      expect(store.positions.rod_position).toBe(50);
      expect(consoleSpy).toHaveBeenCalledWith(
        "Error setting god-mode actuator:",
        expect.any(Error),
      );

      consoleSpy.mockRestore();
    });
  });
});
