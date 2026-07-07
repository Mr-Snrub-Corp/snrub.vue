import { afterAll, afterEach, beforeAll } from "vitest";
import { server } from "./msw/server";

// Intercept HTTP at the fetch boundary for integration tests. Unmocked requests
// error so accidental real network calls surface loudly.
beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
