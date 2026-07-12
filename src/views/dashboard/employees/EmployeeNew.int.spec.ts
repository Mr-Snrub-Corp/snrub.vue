import { renderWithPlugins } from "@/test/renderWithPlugins";
import type { RouteRecordRaw } from "vue-router";
import EmployeeNew from "./EmployeeNew.vue";
import { USER_ROLES, USER_STATUS } from "@/constants/enums";
import { makeUser } from "@/test/factories/user.factory.ts";
import { describe, expect, it, vi } from "vitest";
import { flushPromises } from "@vue/test-utils";
import Password from "primevue/password";
import { useUsersStore } from "@/stores/users.ts";

const { add } = vi.hoisted(() => ({ add: vi.fn() }));
vi.mock("primevue/usetoast", () => ({ useToast: () => ({ add }) }));

const blank = { template: "<div />" };

const NEW_EMAIL = "homer@snrub.test";

const SMITHERS = makeUser({
  uid: "u1",
  name: "Weyland Smithers",
  email: "smithers@snrub.test",
  role: USER_ROLES.ADMIN,
  status: USER_STATUS.ACTIVE,
});

const routes: RouteRecordRaw[] = [
  { path: "/dashboard/employees/:uid", name: "employeeDetail", component: blank },
  { path: "/dashboard/employees", name: "employees", component: blank },
  { path: "/dashboard/employees/new", name: "employeeCreate", component: blank },
];

const EMAIL = "employees.new-form.email-input";
const NAME = "employees.new-form.name-input";
const CREATE_BTN = "employees.new-form.create-btn";
const CANCEL_BTN = "employees.new-form.cancel-btn";
const PASSWORD = "employees.new-form.password-input";

function renderNew() {
  return renderWithPlugins(EmployeeNew, {
    routes,
    initialRoute: "/dashboard/employees/new",
    initialState: {
      users: { users: [SMITHERS] },
      auth: { user: makeUser({ uid: "logged-in" }), token: "tok" },
    },
    stubs: { FileUpload: true },
  });
}

describe("EmployeeNew", () => {
  it("Submit button disabled until the form is valid", async () => {
    const { wrapper } = await renderNew();

    expect(wrapper.find(`[data-testid="${CREATE_BTN}"]`).attributes("disabled")).toBeDefined();

    await wrapper.find(`[data-testid="${EMAIL}"]`).setValue(NEW_EMAIL);
    await wrapper.find(`[data-testid="${NAME}"]`).setValue("Homer");

    await wrapper.find(`[data-testid="${PASSWORD}"]`).find("input").setValue("Pass");
    await flushPromises();
    expect(wrapper.find(`[data-testid="${CREATE_BTN}"]`).attributes("disabled")).toBeDefined();

    const passwordComponent = wrapper.findComponent(Password);
    passwordComponent.vm.$emit("update:modelValue", "Pass");
    await flushPromises();
    expect(wrapper.find(`[data-testid="${CREATE_BTN}"]`).attributes("disabled")).toBeDefined();

    passwordComponent.vm.$emit("update:modelValue", "Password1!");
    await flushPromises();
    expect(wrapper.find(`[data-testid="${CREATE_BTN}"]`).attributes("disabled")).toBeUndefined();
  });

  it("calls createUser with current form data on submit", async () => {
    const { wrapper, pinia } = await renderNew();
    await flushPromises();

    const store = useUsersStore(pinia);
    vi.mocked(store.updateUser).mockResolvedValue(SMITHERS);

    await wrapper.find(`[data-testid="${EMAIL}"]`).setValue(NEW_EMAIL);
    await wrapper.find(`[data-testid="${NAME}"]`).setValue("Homer");
    const passwordComponent = wrapper.findComponent(Password);
    passwordComponent.vm.$emit("update:modelValue", "Password1!");
    await flushPromises();
    await wrapper.find(`[data-testid="${CREATE_BTN}"]`).trigger("click");
    await flushPromises();

    expect(store.createUser).toHaveBeenCalledWith(
      expect.objectContaining({
        email: NEW_EMAIL,
        name: "Homer",
        role: USER_ROLES.VIEWER,
        status: USER_STATUS.ACTIVE,
        password: "Password1!",
      }),
    );
  });

  it("shows error toast when createUser rejects", async () => {
    const { wrapper, pinia } = await renderNew();
    await flushPromises();

    const store = useUsersStore(pinia);
    vi.mocked(store.createUser).mockRejectedValue(new Error("Network Error"));

    await wrapper.find(`[data-testid="${CREATE_BTN}"]`).trigger("click");
    await flushPromises();

    expect(add).toHaveBeenCalledWith(
      expect.objectContaining({ severity: "error", summary: "Error" }),
    );
  });

  it("cancel navigates to employeeDetail", async () => {
    const { wrapper, router } = await renderNew();
    await flushPromises();
    const push = vi.spyOn(router, "push");

    await wrapper.find(`[data-testid="${CANCEL_BTN}"]`).trigger("click");

    expect(push).toHaveBeenCalledWith({ name: "employees" });
  });
});
