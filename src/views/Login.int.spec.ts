import { describe, it, expect, vi } from "vitest";
import { http, HttpResponse } from "msw";
import type { RouteRecordRaw } from "vue-router";
import Login from "@/views/Login.vue";
import { renderWithPlugins } from "@/test/renderWithPlugins";
import { server } from "@/test/msw/server";
import { useAuthStore } from "@/stores/auth";

const API = import.meta.env.VITE_API_URL;
const blank = { template: "<div />" };

const routes: RouteRecordRaw[] = [
  { path: "/", name: "home", component: blank },
  { path: "/auth/login", name: "Login", component: blank },
  { path: "/auth/forgot-password", name: "forgotPassword", component: blank },
  { path: "/dashboard", name: "dashboardHome", component: blank },
];

// stubActions:false → the real auth store login() runs, exercising httpService
// (header injection + handleResponse) against MSW at the fetch boundary.
function renderLogin() {
  return renderWithPlugins(Login, { routes, initialRoute: "/auth/login", stubActions: false });
}

const EMAIL = "auth.login-form.email-input";
const PASSWORD = "auth.login-form.password-input";
const ERROR = "auth.login-form.error-message";

describe("Login (integration)", () => {
  it("logs in and navigates to the dashboard on success", async () => {
    const { wrapper, router } = await renderLogin();
    const push = vi.spyOn(router, "push");

    await wrapper.find(`[data-testid="${EMAIL}"]`).setValue("user@snrub.test");
    await wrapper.find(`[data-testid="${PASSWORD}"]`).setValue("secret123");
    await wrapper.find("form").trigger("submit");

    await vi.waitFor(() => expect(push).toHaveBeenCalledWith({ name: "dashboardHome" }));
    expect(useAuthStore().token).toBe("test-token");
  });

  it("renders the API error message when login fails", async () => {
    server.use(
      http.post(`${API}/auth/login`, () =>
        HttpResponse.json({ detail: [{ msg: "Invalid credentials" }] }, { status: 422 }),
      ),
    );
    const { wrapper } = await renderLogin();

    await wrapper.find(`[data-testid="${EMAIL}"]`).setValue("user@snrub.test");
    await wrapper.find(`[data-testid="${PASSWORD}"]`).setValue("wrongpass");
    await wrapper.find("form").trigger("submit");

    await vi.waitFor(() => expect(wrapper.find(`[data-testid="${ERROR}"]`).exists()).toBe(true));
    expect(wrapper.find(`[data-testid="${ERROR}"]`).text()).toContain("Invalid credentials");
  });
});
