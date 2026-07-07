import { describe, it, expect, vi } from "vitest";
import { shallowMount } from "@vue/test-utils";
import DashboardNavbar from "./DashboardNavbar.vue";

const mockRoute = { path: "/dashboard" };
let mockUserPhoto: string | undefined = "abc123";

vi.mock("vue-router", () => ({
  useRoute: () => mockRoute,
}));

vi.mock("@/stores/auth", () => ({
  useAuthStore: () => ({ user: { uid: "u1" } }),
}));

vi.mock("@/stores/users", () => ({
  useUsersStore: () => ({
    getUserById: (uid: string) => (uid === "u1" ? { photo: mockUserPhoto } : undefined),
  }),
}));

const AvatarStub = {
  template: `<div class="avatar-stub" />`,
  props: ["image", "icon", "shape"],
};

const BreadcrumbStub = {
  template: `<div class="breadcrumb-stub"><slot name="item" v-for="item in model" :item="item" :props="{ action: {} }" /></div>`,
  props: ["home", "model"],
};

const RouterLinkStub = {
  template: `<a class="router-link-stub"><slot /></a>`,
  props: ["to", "custom"],
};

const mountNavbar = () => {
  return shallowMount(DashboardNavbar, {
    global: {
      stubs: {
        Avatar: AvatarStub,
        Breadcrumb: BreadcrumbStub,
        "router-link": RouterLinkStub,
      },
    },
  });
};

describe("DashboardNavbar", () => {
  it("renders hamburger toggle button", () => {
    const wrapper = mountNavbar();
    expect(wrapper.find(".pi-bars").exists()).toBe(true);
  });

  it("emits toggle-drawer on hamburger click", async () => {
    const wrapper = mountNavbar();
    await wrapper.find('[data-testid="nav.navbar.menu-btn"]').trigger("click");
    expect(wrapper.emitted("toggle-drawer")).toHaveLength(1);
  });

  it("renders Avatar component", () => {
    const wrapper = mountNavbar();
    expect(wrapper.findComponent(AvatarStub).exists()).toBe(true);
  });

  it("shows user photo in Avatar when available", () => {
    const wrapper = mountNavbar();
    const avatar = wrapper.findComponent(AvatarStub);
    expect(avatar.props("image")).toBe("data:image/png;base64,abc123");
    expect(avatar.props("icon")).toBeUndefined();
  });

  it("falls back to pi-user icon when no photo", () => {
    mockUserPhoto = undefined;
    const wrapper = mountNavbar();
    const avatar = wrapper.findComponent(AvatarStub);
    expect(avatar.props("icon")).toBe("pi pi-user");
    expect(avatar.props("image")).toBeUndefined();
    mockUserPhoto = "abc123";
  });

  it("renders Breadcrumb component", () => {
    const wrapper = mountNavbar();
    expect(wrapper.findComponent(BreadcrumbStub).exists()).toBe(true);
  });

  it("breadcrumb home prop links to dashboard root", () => {
    const wrapper = mountNavbar();
    const bc = wrapper.findComponent(BreadcrumbStub);
    expect(bc.props("home")).toEqual({ icon: "pi pi-home", route: "/dashboard" });
  });

  it("builds 2 breadcrumb items for /dashboard/incidents/reports", () => {
    mockRoute.path = "/dashboard/incidents/reports";
    const wrapper = mountNavbar();
    const bc = wrapper.findComponent(BreadcrumbStub);
    const model = bc.props("model");
    expect(model).toEqual([
      { label: "Incidents", route: "/dashboard/incidents" },
      { label: "Reports" },
    ]);
    mockRoute.path = "/dashboard";
  });

  it("builds 1 breadcrumb item for /dashboard/team", () => {
    mockRoute.path = "/dashboard/team";
    const wrapper = mountNavbar();
    const bc = wrapper.findComponent(BreadcrumbStub);
    const model = bc.props("model");
    expect(model).toEqual([{ label: "Team" }]);
    mockRoute.path = "/dashboard";
  });

  it("builds empty breadcrumb model for /dashboard", () => {
    mockRoute.path = "/dashboard";
    const wrapper = mountNavbar();
    const bc = wrapper.findComponent(BreadcrumbStub);
    expect(bc.props("model")).toEqual([]);
  });
});
