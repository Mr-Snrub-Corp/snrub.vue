import { onBeforeUnmount, onMounted, ref } from "vue";
import type { Ref } from "vue";
import { useAuthStore } from "@/stores/auth";
import { parseReactorTelemetry } from "@/utils/reactor";
import type { ReactorTelemetry } from "@/types/reactorTelemetry";

const MAX_POINTS = 50;
const BASE_RECONNECT_MS = 1000;
const MAX_RECONNECT_MS = 30000;

/**
 * Manages the reactor telemetry WebSocket connection.
 *
 * Handles connection lifecycle, exponential-backoff reconnection, and
 * appending incoming telemetry values to fixed-length rolling buffers
 * for use in charts.
 *
 * The composable owns its own lifecycle hooks (onMounted / onBeforeUnmount)
 * so the consuming component does not need to manage connection setup or
 * teardown directly.
 */
export function useReactorTelemetry() {
  const authStore = useAuthStore();

  const reactorData = ref<Partial<ReactorTelemetry>>({});
  const hasData = ref(false);
  const connectionError = ref<string | null>(null);

  const labels = ref<string[]>([]);
  const reactorPowerBuffer = ref<number[]>([]);
  const coreTemperatureBuffer = ref<number[]>([]);
  const radiationBuffer = ref<number[]>([]);
  const coolantPressureBuffer = ref<number[]>([]);
  const coolantFlowBuffer = ref<number[]>([]);

  let ws: WebSocket | null = null;
  let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  let reconnectAttempt = 0;
  let intentionalClose = false;

  function pushBuffer(buf: Ref<number[]>, value: number): void {
    buf.value.push(value);
    if (buf.value.length > MAX_POINTS) buf.value.shift();
  }

  function applyTelemetry(data: ReactorTelemetry): void {
    reactorData.value = data;
    hasData.value = true;
    connectionError.value = null;

    const label = new Date().toLocaleTimeString("en-AU", { hour12: false });
    labels.value.push(label);
    if (labels.value.length > MAX_POINTS) labels.value.shift();

    pushBuffer(reactorPowerBuffer, data.reactor_power);
    pushBuffer(coreTemperatureBuffer, data.core_temperature);
    pushBuffer(radiationBuffer, data.radiation_level);
    pushBuffer(coolantPressureBuffer, data.coolant_pressure);
    pushBuffer(coolantFlowBuffer, data.coolant_flow_rate);
  }

  /**
   * Parses and validates the raw WebSocket message before applying it.
   * Silently drops messages that fail JSON parsing or schema validation
   * so a single malformed frame cannot crash the dashboard.
   */
  function handleMessage(e: MessageEvent): void {
    let parsed: unknown;
    try {
      parsed = JSON.parse(e.data as string);
    } catch {
      return;
    }

    const data = parseReactorTelemetry(parsed);
    if (!data) return;

    applyTelemetry(data);
  }

  /**
   * Schedules a reconnection attempt using truncated exponential backoff
   * (1 s → 2 s → 4 s … capped at 30 s). Skipped if the close was intentional
   * (i.e. component unmounting).
   */
  function scheduleReconnect(): void {
    if (intentionalClose) return;

    const delay = Math.min(BASE_RECONNECT_MS * 2 ** reconnectAttempt, MAX_RECONNECT_MS);
    reconnectAttempt += 1;
    connectionError.value = hasData.value
      ? "Telemetry connection lost. Reconnecting…"
      : "Unable to connect to telemetry. Reconnecting…";

    reconnectTimer = setTimeout(connectWebSocket, delay);
  }

  function connectWebSocket(): void {
    if (intentionalClose) return;

    reconnectTimer = null;
    ws?.close();

    // Derive the WebSocket base URL from VITE_API_URL by swapping the protocol.
    const wsBase = import.meta.env.VITE_API_URL.replace(/^http/, "ws");

    // TODO: The telemetry WebSocket endpoint authenticates by accepting a JWT in a query
    // parameter and manually calling decode_jwt(token) instead of enforcing authentication
    // (and role-based authorization) via the standardized JWTBearer dependency injection
    // used elsewhere. This bypass increases the risk of inconsistent/incorrect validation
    // and also raises token leakage risk because query parameters are commonly logged or
    // persisted.
    ws = new WebSocket(`${wsBase}/ws/telemetry?token=${authStore.token}`);

    ws.onopen = () => {
      reconnectAttempt = 0;
      if (hasData.value) connectionError.value = null;
    };

    ws.onmessage = handleMessage;

    ws.onerror = () => {
      connectionError.value = hasData.value
        ? "Telemetry connection error. Reconnecting…"
        : "Unable to connect to telemetry.";
    };

    ws.onclose = () => {
      ws = null;
      if (intentionalClose) return;
      scheduleReconnect();
    };
  }

  onMounted(connectWebSocket);

  onBeforeUnmount(() => {
    intentionalClose = true;
    if (reconnectTimer !== null) clearTimeout(reconnectTimer);
    ws?.close();
  });

  return {
    reactorData,
    hasData,
    connectionError,
    labels,
    reactorPowerBuffer,
    coreTemperatureBuffer,
    radiationBuffer,
    coolantPressureBuffer,
    coolantFlowBuffer,
  };
}
