import { describe, it, expect, vi } from "vitest";
import { flushPromises } from "@vue/test-utils";
import type { RouteRecordRaw } from "vue-router";
import { useUsersStore } from "@/stores/users";
import { USER_ROLES, USER_STATUS } from "@/constants/enums";
import { makeUser } from "@/test/factories/user.factory";
import { renderWithPlugins } from "@/test/renderWithPlugins";
import EmployeeEdit from "./EmployeeEdit.vue";

const { add } = vi.hoisted(() => ({ add: vi.fn() }));
vi.mock("primevue/usetoast", () => ({ useToast: () => ({ add }) }));

const blank = { template: "<div />" };

const HOMER = makeUser({
  uid: "u1",
  name: "Homer Simpson",
  email: "homer@snrub.test",
  role: USER_ROLES.ADMIN,
  status: USER_STATUS.ACTIVE,
});

const routes: RouteRecordRaw[] = [
  { path: "/dashboard/employees/:uid/edit", name: "employeeEdit", component: blank },
  { path: "/dashboard/employees/:uid", name: "employeeDetail", component: blank },
  { path: "/dashboard/employees", name: "employees", component: blank },
];

const EMAIL = "employees.edit-form.email-input";
const NAME = "employees.edit-form.name-input";
const UPDATE_BTN = "employees.edit-form.update-btn";
const CANCEL_BTN = "employees.edit-form.cancel-btn";

function renderEdit(uid = "u1") {
  return renderWithPlugins(EmployeeEdit, {
    routes,
    initialRoute: `/dashboard/employees/${uid}/edit`,
    // Pre-populate users store; fetchUserById is stubbed so initFormData
    // reads directly from this state.
    initialState: {
      users: { users: [HOMER] },
      auth: { user: makeUser({ uid: "logged-in" }), token: "tok" },
    },
    // Stub FileUpload to avoid heavy DOM interactions in these tests.
    stubs: { FileUpload: true },
  });
}

describe("EmployeeEdit (integration)", () => {
  it("populates form fields from the store after mount", async () => {
    const { wrapper } = await renderEdit();
    await flushPromises();

    expect((wrapper.find(`[data-testid="${EMAIL}"]`).element as HTMLInputElement).value).toBe(
      HOMER.email,
    );
    expect((wrapper.find(`[data-testid="${NAME}"]`).element as HTMLInputElement).value).toBe(
      HOMER.name,
    );
  });

  it("calls fetchUserById with the route uid on mount", async () => {
    const { pinia } = await renderEdit();
    await flushPromises();

    const store = useUsersStore(pinia);
    expect(store.fetchUserById).toHaveBeenCalledWith("u1");
  });

  it("update button is disabled when a required field is cleared", async () => {
    const { wrapper } = await renderEdit();
    await flushPromises();

    // Clear name → required validation fails → button disabled
    await wrapper.find(`[data-testid="${NAME}"]`).setValue("");
    await flushPromises();

    expect(wrapper.find(`[data-testid="${UPDATE_BTN}"]`).attributes("disabled")).toBeDefined();
  });

  it("calls updateUser with current form data on submit", async () => {
    const { wrapper, pinia } = await renderEdit();
    await flushPromises();

    const store = useUsersStore(pinia);
    vi.mocked(store.updateUser).mockResolvedValue(HOMER);

    await wrapper.find(`[data-testid="${NAME}"]`).setValue("Bart Simpson");
    await wrapper.find(`[data-testid="${UPDATE_BTN}"]`).trigger("click");
    await flushPromises();

    expect(store.updateUser).toHaveBeenCalledWith(
      "u1",
      expect.objectContaining({ name: "Bart Simpson" }),
    );
  });

  it("shows success toast and navigates to employeeDetail on update", async () => {
    const { wrapper, pinia, router } = await renderEdit();
    await flushPromises();

    const store = useUsersStore(pinia);
    vi.mocked(store.updateUser).mockResolvedValue(HOMER);
    const push = vi.spyOn(router, "push");

    await wrapper.find(`[data-testid="${UPDATE_BTN}"]`).trigger("click");
    await flushPromises();

    expect(add).toHaveBeenCalledWith(
      expect.objectContaining({ severity: "success", summary: "Success" }),
    );
    expect(push).toHaveBeenCalledWith({ name: "employeeDetail", params: { uid: "u1" } });
  });

  it("shows error toast when updateUser rejects", async () => {
    const { wrapper, pinia } = await renderEdit();
    await flushPromises();

    const store = useUsersStore(pinia);
    vi.mocked(store.updateUser).mockRejectedValue(new Error("Network Error"));

    await wrapper.find(`[data-testid="${UPDATE_BTN}"]`).trigger("click");
    await flushPromises();

    expect(add).toHaveBeenCalledWith(
      expect.objectContaining({ severity: "error", summary: "Error" }),
    );
  });

  it("cancel navigates to employeeDetail", async () => {
    const { wrapper, router } = await renderEdit();
    await flushPromises();
    const push = vi.spyOn(router, "push");

    await wrapper.find(`[data-testid="${CANCEL_BTN}"]`).trigger("click");

    expect(push).toHaveBeenCalledWith({ name: "employeeDetail", params: { uid: "u1" } });
  });
});
