import { describe, it, expect, beforeEach } from "vitest";
import { nextTick } from "vue";
import { createRouter, createMemoryHistory } from "vue-router";
import { createPinia, setActivePinia } from "pinia";
import { useAuthStore } from "@/stores/auth";
import { makeUser } from "@/test/factories/user.factory";
import { USER_ROLES } from "@/constants/enums";

// Mirrors the guard logic from src/router/index.ts without importing
// the singleton (which uses createWebHistory and lazy-loaded chunks).
const blank = { template: "<div />" };

function buildTestRouter() {
  const r = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: "/", name: "home", component: blank },
      { path: "/auth/login", name: "Login", component: blank, meta: { title: "Sign In | Snrub Corp" } },
      { path: "/auth/forgot-password", name: "forgotPassword", component: blank },
      { path: "/auth/reset-password", name: "resetPassword", component: blank },
      { path: "/auth/callback", name: "Callback", component: blank },
      { path: "/dashboard", name: "dashboardHome", component: blank, meta: { title: "Dashboard | Snrub Corp" } },
      { path: "/dashboard/employees", name: "employees", component: blank, meta: { title: "Employees | Snrub Corp" } },
      {
        path: "/dashboard/employees/new",
        name: "employeeCreate",
        component: blank,
        meta: { requiresSuperAdmin: true, title: "Add Employee | Snrub Corp" },
      },
    ],
  });

  r.beforeEach(async (to) => {
    const authStore = useAuthStore();
    if (
      !authStore.isLoggedIn &&
      to.name !== "Login" &&
      to.name !== "forgotPassword" &&
      to.name !== "resetPassword" &&
      to.name !== "Callback"
    ) {
      return { name: "Login" };
    }
    if (to.meta.requiresSuperAdmin && !authStore.isSuperAdmin) {
      return { name: "employees" };
    }
  });

  r.afterEach((to) => {
    document.title = to.meta.title ?? "Snrub Corp";
  });

  return r;
}

describe("router beforeEach guard", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it("redirects unauthenticated user to Login on a protected route", async () => {
    const r = buildTestRouter();
    await r.push({ name: "dashboardHome" });
    expect(r.currentRoute.value.name).toBe("Login");
  });

  it.each(["Login", "forgotPassword", "resetPassword", "Callback"] as const)(
    "allows unauthenticated user to reach the whitelist route: %s",
    async (name) => {
      const r = buildTestRouter();
      await r.push({ name });
      expect(r.currentRoute.value.name).toBe(name);
    },
  );

  it("allows an authenticated user to reach a protected route", async () => {
    const r = buildTestRouter();
    const auth = useAuthStore();
    auth.user = makeUser();
    auth.token = "tok";

    await r.push({ name: "dashboardHome" });
    expect(r.currentRoute.value.name).toBe("dashboardHome");
  });

  it("redirects non-super-admin to employees when requiresSuperAdmin", async () => {
    const r = buildTestRouter();
    const auth = useAuthStore();
    auth.user = makeUser({ role: USER_ROLES.ADMIN });
    auth.token = "tok";

    await r.push({ name: "employeeCreate" });
    expect(r.currentRoute.value.name).toBe("employees");
  });

  it("allows super_admin through a requiresSuperAdmin route", async () => {
    const r = buildTestRouter();
    const auth = useAuthStore();
    auth.user = makeUser({ role: USER_ROLES.SUPER_ADMIN });
    auth.token = "tok";

    await r.push({ name: "employeeCreate" });
    expect(r.currentRoute.value.name).toBe("employeeCreate");
  });
});

describe("router afterEach — document.title", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    const auth = useAuthStore();
    auth.user = makeUser();
    auth.token = "tok";
  });

  it("sets document.title from route meta.title", async () => {
    const r = buildTestRouter();
    await r.push({ name: "dashboardHome" });
    await nextTick();
    expect(document.title).toBe("Dashboard | Snrub Corp");
  });

  it("falls back to 'Snrub Corp' when meta.title is absent", async () => {
    const r = buildTestRouter();
    // Callback has no title meta
    await r.push({ name: "Callback" });
    await nextTick();
    expect(document.title).toBe("Snrub Corp");
  });
});
