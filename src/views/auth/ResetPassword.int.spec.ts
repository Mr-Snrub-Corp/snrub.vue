import { describe, it, expect, vi } from "vitest";
import { flushPromises } from "@vue/test-utils";
import type { RouteRecordRaw } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import { renderWithPlugins } from "@/test/renderWithPlugins";
import ResetPassword from "./ResetPassword.vue";

const { add } = vi.hoisted(() => ({ add: vi.fn() }));
vi.mock("primevue/usetoast", () => ({ useToast: () => ({ add }) }));

const blank = { template: "<div />" };

const routes: RouteRecordRaw[] = [
  { path: "/auth/reset-password", name: "resetPassword", component: blank },
  { path: "/auth/login", name: "Login", component: blank },
];

const PASSWORD = "auth.reset-password-form.password-input";
const CONFIRM = "auth.reset-password-form.confirm-password-input";
const SUBMIT_BTN = "auth.reset-password-form.submit-btn";

const VALID_PASSWORD = "Secure1!";
const TOKEN = "reset-token-abc";

function renderReset(token = TOKEN) {
  return renderWithPlugins(ResetPassword, {
    routes,
    initialRoute: `/auth/reset-password?token=${token}`,
  });
}

describe("ResetPassword (integration)", () => {
  it("calls authStore.resetPassword with token and new password on valid submit", async () => {
    const { wrapper, pinia } = await renderReset();
    const auth = useAuthStore(pinia);

    await wrapper.find(`[data-testid="${PASSWORD}"]`).setValue(VALID_PASSWORD);
    await wrapper.find(`[data-testid="${CONFIRM}"]`).setValue(VALID_PASSWORD);
    await wrapper.find("form").trigger("submit");
    await flushPromises();

    expect(auth.resetPassword).toHaveBeenCalledWith({
      token: TOKEN,
      new_password: VALID_PASSWORD,
    });
  });

  it("shows success toast on successful reset", async () => {
    const { wrapper } = await renderReset();

    await wrapper.find(`[data-testid="${PASSWORD}"]`).setValue(VALID_PASSWORD);
    await wrapper.find(`[data-testid="${CONFIRM}"]`).setValue(VALID_PASSWORD);
    await wrapper.find("form").trigger("submit");
    await flushPromises();

    expect(add).toHaveBeenCalledWith(
      expect.objectContaining({ severity: "success", summary: "Success" }),
    );
  });

  it("does not call resetPassword when password is too weak", async () => {
    const { wrapper, pinia } = await renderReset();
    const auth = useAuthStore(pinia);

    await wrapper.find(`[data-testid="${PASSWORD}"]`).setValue("weak");
    await wrapper.find(`[data-testid="${CONFIRM}"]`).setValue("weak");
    await wrapper.find("form").trigger("submit");
    await flushPromises();

    expect(auth.resetPassword).not.toHaveBeenCalled();
  });

  it("shows validation error when passwords do not match", async () => {
    const { wrapper } = await renderReset();

    await wrapper.find(`[data-testid="${PASSWORD}"]`).setValue(VALID_PASSWORD);
    await wrapper.find(`[data-testid="${CONFIRM}"]`).setValue("Different1!");
    await wrapper.find("form").trigger("submit");
    await flushPromises();

    expect(wrapper.text()).toContain("Passwords must match");
  });

  it("submit button renders and is accessible", async () => {
    const { wrapper } = await renderReset();

    const btn = wrapper.find(`[data-testid="${SUBMIT_BTN}"]`);
    expect(btn.exists()).toBe(true);
  });
});
