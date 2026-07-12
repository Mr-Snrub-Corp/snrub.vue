import { afterAll, afterEach, beforeAll, vi } from "vitest";
import { server } from "./msw/server";

// ─── Browser API polyfills (jsdom stubs) ──────────────────────────────────────

Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

globalThis.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

// ─── MSW ──────────────────────────────────────────────────────────────────────

// Intercept HTTP at the fetch boundary for integration tests. Unmocked requests
// error so accidental real network calls surface loudly.
beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
