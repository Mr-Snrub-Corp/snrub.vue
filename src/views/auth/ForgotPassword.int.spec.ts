import { renderWithPlugins } from "@/test/renderWithPlugins";
import ForgotPassword from "./ForgotPassword.vue";
import type { RouteRecordRaw } from "vue-router";
import { describe, expect, it, vi } from "vitest";
import { useAuthStore } from "@/stores/auth.ts";
import { flushPromises } from "@vue/test-utils";

const { add } = vi.hoisted(() => ({ add: vi.fn() }));
vi.mock("primevue/usetoast", () => ({ useToast: () => ({ add }) }));

const blank = { template: "<div />" };

const homerEmail = "chunkylover53@aol.com";

const API = import.meta.env.VITE_API_URL;
const EMAIL = "auth.forgot-password-form.email-input";

const routes: RouteRecordRaw[] = [
  { path: "/auth/login", name: "Login", component: blank },
  { path: "/auth/forgot-password", name: "forgotPassword", component: blank },
];

function renderForgotPassword() {
  return renderWithPlugins(ForgotPassword, {
    routes,
    initialRoute: "/auth/forgot-password",
    // stubActions: false,  // Keep stubActions: false only if you add a request mock and want to exercise the real action.
  });
}

describe("ForgotPassword (integration)", () => {
  it("Calls requestReset with the entered email", async () => {
    const { wrapper, pinia } = await renderForgotPassword();
    const auth = useAuthStore(pinia);

    await wrapper.find(`[data-testid="${EMAIL}"]`).setValue(homerEmail);
    await wrapper.find("form").trigger("submit");
    await flushPromises(); // // ← let $validate() + requestReset() settle

    expect(auth.requestReset).toHaveBeenCalledWith({ email: homerEmail });
  });
  it("shows a success toast after submit", async () => {
    const { wrapper } = await renderForgotPassword();

    await wrapper.find(`[data-testid="${EMAIL}"]`).setValue(homerEmail);
    await wrapper.find("form").trigger("submit");

    await vi.waitFor(() =>
      expect(add).toHaveBeenCalledWith(
        expect.objectContaining({
          severity: "success",
          summary: "Email Sent",
          detail: "If your email is registered, you will receive a password reset link",
          life: 5000,
        }),
      ),
    );
  });

  it("Invalid email blocks submit + shows a validation message", () => {});

  it("Submit button disabled until the form is valid", () => {});

  it("a11y: aria-invalid / aria-describedby toggle on error", () => {});

  it("shows a error toast on request failure", async () => {
    const { wrapper, pinia } = await renderForgotPassword();

    const auth = useAuthStore(pinia);
    vi.mocked(auth.requestReset).mockRejectedValue(new Error("Network Error"));

    await wrapper.find(`[data-testid="${EMAIL}"]`).setValue(homerEmail);
    await wrapper.find("form").trigger("submit");
    await flushPromises();

    await vi.waitFor(() =>
      expect(add).toHaveBeenCalledWith(
        expect.objectContaining({
          severity: "error",
          summary: "Error",
          detail: "Something went wrong. Please try again later.",
          life: 5000,
        }),
      ),
    );
  });
});
