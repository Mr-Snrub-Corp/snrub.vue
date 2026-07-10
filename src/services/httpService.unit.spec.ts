import { describe, it, expect, vi, beforeEach } from "vitest";
import { http, HttpResponse } from "msw";
import { createPinia, setActivePinia } from "pinia";
import { useAuthStore } from "@/stores/auth";
import { server } from "@/test/msw/server";
import { HttpError } from "@/types/errors";
import { makeUser } from "@/test/factories/user.factory";
import api from "./httpService";

// httpService imports router at module level; mock it so push() is inspectable.
vi.mock("@/router", () => ({ default: { push: vi.fn() } }));
import router from "@/router";

const API = import.meta.env.VITE_API_URL;

describe("httpService", () => {
  let authStore: ReturnType<typeof useAuthStore>;

  beforeEach(() => {
    setActivePinia(createPinia());
    authStore = useAuthStore();
    vi.clearAllMocks();
  });

  // ─── getHeaders ──────────────────────────────────────────────────────────────

  describe("getHeaders", () => {
    it("includes Bearer token when auth store has a token", async () => {
      let captured: string | null = null;
      server.use(
        http.get(`${API}/users`, ({ request }) => {
          captured = request.headers.get("Authorization");
          return HttpResponse.json([]);
        }),
      );

      authStore.token = "my-token";
      await api.users.get();

      expect(captured).toBe("Bearer my-token");
    });

    it("omits Authorization when no token and still sets Content-Type", async () => {
      let capturedAuth: string | null = "sentinel";
      let capturedContentType: string | null = null;
      server.use(
        http.get(`${API}/users`, ({ request }) => {
          capturedAuth = request.headers.get("Authorization");
          capturedContentType = request.headers.get("Content-Type");
          return HttpResponse.json([]);
        }),
      );

      await api.users.get();

      expect(capturedAuth).toBeNull();
      expect(capturedContentType).toBe("application/json");
    });
  });

  // ─── getAuthHeaders (multipart) ───────────────────────────────────────────

  describe("getAuthHeaders", () => {
    it("sends Authorization only — no Content-Type — when token exists", async () => {
      let capturedAuth: string | null = null;
      let capturedContentType: string | null = "sentinel";
      server.use(
        http.put(`${API}/users/u1/photo`, ({ request }) => {
          capturedAuth = request.headers.get("Authorization");
          capturedContentType = request.headers.get("Content-Type");
          return HttpResponse.json(makeUser({ uid: "u1" }));
        }),
      );

      authStore.token = "photo-token";
      const fd = new FormData();
      fd.append("file", new File([""], "photo.jpg", { type: "image/jpeg" }));
      await api.users.uploadPhoto("u1", fd);

      expect(capturedAuth).toBe("Bearer photo-token");
      // FormData bodies must NOT carry an explicit Content-Type header from
      // our code — the browser/fetch sets the multipart boundary automatically.
      expect(capturedContentType).not.toBe("application/json");
    });

    it("sends no Authorization when there is no token", async () => {
      let capturedAuth: string | null = "sentinel";
      server.use(
        http.put(`${API}/users/u1/photo`, ({ request }) => {
          capturedAuth = request.headers.get("Authorization");
          return HttpResponse.json(makeUser({ uid: "u1" }));
        }),
      );

      const fd = new FormData();
      await api.users.uploadPhoto("u1", fd);

      expect(capturedAuth).toBeNull();
    });
  });

  // ─── Query serialisation ─────────────────────────────────────────────────

  describe("query serialisation", () => {
    it("repeats array values as separate params", async () => {
      let capturedUrl = "";
      server.use(
        http.get(`${API}/users`, ({ request }) => {
          capturedUrl = request.url;
          return HttpResponse.json([]);
        }),
      );

      await api.users.get({ roles: ["admin", "viewer"] } as Parameters<typeof api.users.get>[0]);

      const params = new URL(capturedUrl).searchParams;
      expect(params.getAll("roles")).toEqual(["admin", "viewer"]);
    });

    it("skips null and undefined values", async () => {
      let capturedUrl = "";
      server.use(
        http.get(`${API}/users`, ({ request }) => {
          capturedUrl = request.url;
          return HttpResponse.json([]);
        }),
      );

      await api.users.get(
        { name: undefined, role: null } as unknown as Parameters<typeof api.users.get>[0],
      );

      const params = new URL(capturedUrl).searchParams;
      expect(params.has("name")).toBe(false);
      expect(params.has("role")).toBe(false);
    });
  });

  // ─── handleResponse ───────────────────────────────────────────────────────

  describe("handleResponse", () => {
    it("resolves with parsed JSON on success", async () => {
      const user = makeUser({ uid: "u99" });
      server.use(http.get(`${API}/users`, () => HttpResponse.json([user])));

      const result = await api.users.get();
      expect(result).toEqual([user]);
    });

    it("throws HttpError with detail[0].msg for FastAPI array detail", async () => {
      server.use(
        http.get(`${API}/users`, () =>
          HttpResponse.json({ detail: [{ msg: "Value error: bad field" }] }, { status: 422 }),
        ),
      );

      await expect(api.users.get()).rejects.toThrow("Value error: bad field");
      await expect(api.users.get()).rejects.toBeInstanceOf(HttpError);
    });

    it("throws HttpError with detail string for string detail", async () => {
      server.use(
        http.get(`${API}/users`, () =>
          HttpResponse.json({ detail: "Not found" }, { status: 404 }),
        ),
      );

      await expect(api.users.get()).rejects.toThrow("Not found");
    });

    it("throws HttpError with generic message on 500 (skips detail)", async () => {
      server.use(
        http.get(`${API}/users`, () =>
          HttpResponse.json({ detail: "DB exploded — never shown to callers" }, { status: 500 }),
        ),
      );

      await expect(api.users.get()).rejects.toThrow("Something went wrong");
    });

    it("on 401: resets auth store and pushes Login, then throws", async () => {
      server.use(
        http.get(`${API}/users`, () =>
          HttpResponse.json({ detail: "Unauthorized" }, { status: 401 }),
        ),
      );

      authStore.token = "old-token";
      authStore.user = makeUser();

      await expect(api.users.get()).rejects.toBeInstanceOf(HttpError);

      expect(authStore.token).toBeNull();
      expect(authStore.user).toBeNull();
      expect(router.push).toHaveBeenCalledWith({ name: "Login" });
    });
  });
});
