import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { defineComponent } from "vue";
import { mount } from "@vue/test-utils";
import { createTestingPinia } from "@pinia/testing";
import PrimeVue from "primevue/config";
import { useReactorTelemetry } from "./useReactorTelemetry";

// ---------------------------------------------------------------------------
// FakeWebSocket
// Simulates the browser WebSocket API. close() is a spy that does NOT fire
// onclose automatically (mirrors the async real-world behavior so that tests
// can assert the composable called close() without accidentally triggering
// the reconnect path).  Call triggerClose() to simulate a server-side close.
// ---------------------------------------------------------------------------

class FakeWebSocket {
  static instances: FakeWebSocket[] = [];

  onopen: ((e: Event) => void) | null = null;
  onmessage: ((e: { data: string }) => void) | null = null;
  onerror: ((e: Event) => void) | null = null;
  onclose: (() => void) | null = null;

  readonly url: string;
  close = vi.fn();

  constructor(url: string) {
    this.url = url;
    FakeWebSocket.instances.push(this);
  }

  triggerOpen() {
    this.onopen?.(new Event("open"));
  }
  triggerMessage(data: string) {
    this.onmessage?.({ data });
  }
  triggerError() {
    this.onerror?.(new Event("error"));
  }
  triggerClose() {
    this.onclose?.();
  }

  static latest() {
    return FakeWebSocket.instances[FakeWebSocket.instances.length - 1];
  }
}

// ---------------------------------------------------------------------------
// Host component
// A minimal component that mounts the composable so that onMounted /
// onBeforeUnmount lifecycle hooks fire naturally.
// ---------------------------------------------------------------------------

const HostComponent = defineComponent({
  setup() {
    return useReactorTelemetry();
  },
  template: "<div />",
});

const VALID_TELEMETRY = {
  reactor_power: 75.5,
  core_temperature: 320.1,
  radiation_level: 0.05,
  coolant_pressure: 150.0,
  coolant_flow_rate: 200.0,
  containment_integrity: 98.5,
};

function mountComposable(token = "test-token") {
  const pinia = createTestingPinia({
    initialState: { auth: { token } },
    stubActions: true,
    createSpy: vi.fn,
  });

  const wrapper = mount(HostComponent, {
    global: {
      plugins: [pinia, [PrimeVue, { theme: "none" }]],
    },
  });

  // Convenience accessor — vue proxy auto-unwraps refs from setup().
  const vm = wrapper.vm as unknown as {
    hasData: boolean;
    connectionError: string | null;
    reactorPowerBuffer: number[];
    coreTemperatureBuffer: number[];
    radiationBuffer: number[];
    labels: string[];
  };

  return { wrapper, vm };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

beforeEach(() => {
  FakeWebSocket.instances = [];
  vi.stubGlobal("WebSocket", FakeWebSocket);
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

describe("useReactorTelemetry", () => {
  it("creates a WebSocket connection on mount with the correct URL", () => {
    mountComposable("my-token");

    expect(FakeWebSocket.instances).toHaveLength(1);
    expect(FakeWebSocket.latest().url).toBe("ws://localhost:8000/ws/telemetry?token=my-token");
  });

  it("sets hasData and populates buffers on a valid telemetry message", () => {
    const { vm } = mountComposable();
    const ws = FakeWebSocket.latest();

    ws.triggerOpen();
    ws.triggerMessage(JSON.stringify(VALID_TELEMETRY));

    expect(vm.hasData).toBe(true);
    expect(vm.reactorPowerBuffer).toEqual([VALID_TELEMETRY.reactor_power]);
    expect(vm.coreTemperatureBuffer).toEqual([VALID_TELEMETRY.core_temperature]);
    expect(vm.radiationBuffer).toEqual([VALID_TELEMETRY.radiation_level]);
    expect(vm.labels).toHaveLength(1);
  });

  it("drops malformed JSON without throwing or mutating state", () => {
    const { vm } = mountComposable();
    const ws = FakeWebSocket.latest();

    ws.triggerMessage("not-valid-json{{{");

    expect(vm.hasData).toBe(false);
    expect(vm.reactorPowerBuffer).toHaveLength(0);
  });

  it("drops schema-invalid payloads without mutating state", () => {
    const { vm } = mountComposable();
    const ws = FakeWebSocket.latest();

    ws.triggerMessage(JSON.stringify({ reactor_power: "not-a-number" }));

    expect(vm.hasData).toBe(false);
    expect(vm.reactorPowerBuffer).toHaveLength(0);
  });

  it("caps all buffers and labels at MAX_POINTS (50)", () => {
    const { vm } = mountComposable();
    const ws = FakeWebSocket.latest();

    ws.triggerOpen();
    for (let i = 0; i < 51; i++) {
      ws.triggerMessage(JSON.stringify(VALID_TELEMETRY));
    }

    expect(vm.reactorPowerBuffer).toHaveLength(50);
    expect(vm.labels).toHaveLength(50);
  });

  it("sets connectionError and schedules reconnect on unintentional close", () => {
    vi.useFakeTimers();
    const { vm } = mountComposable();
    const ws = FakeWebSocket.latest();

    ws.triggerClose(); // server-side / unintentional close

    expect(vm.connectionError).toContain("Reconnecting");
    // 1 existing socket; advancing past the 1 s backoff creates a second.
    vi.advanceTimersByTime(1000);
    expect(FakeWebSocket.instances).toHaveLength(2);
  });

  it("closes the WebSocket on unmount", () => {
    const { wrapper } = mountComposable();
    const ws = FakeWebSocket.latest();

    wrapper.unmount();

    expect(ws.close).toHaveBeenCalled();
  });

  it("clears the reconnect timer on unmount so no new socket is created", () => {
    vi.useFakeTimers();
    const { wrapper, vm } = mountComposable();
    const ws = FakeWebSocket.latest();

    ws.triggerClose(); // schedule reconnect
    expect(vm.connectionError).toContain("Reconnecting");

    wrapper.unmount(); // should cancel the timer

    vi.advanceTimersByTime(5000);
    // Still only 1 instance — timer was cleared before it fired.
    expect(FakeWebSocket.instances).toHaveLength(1);
  });
});
