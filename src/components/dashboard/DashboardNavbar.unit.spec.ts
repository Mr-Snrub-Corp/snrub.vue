import { describe, it, expect } from "vitest";
import Avatar from "primevue/avatar";
import Breadcrumb from "primevue/breadcrumb";
import DashboardNavbar from "./DashboardNavbar.vue";
import { renderWithPlugins } from "@/test/renderWithPlugins";
import { makeUser } from "@/test/factories/user.factory";

const currentUser = makeUser({ uid: "u1" });

function mountNavbar(options: { photo?: string; route?: string } = {}) {
  const { photo, route = "/dashboard" } = options;
  return renderWithPlugins(DashboardNavbar, {
    initialRoute: route,
    initialState: {
      auth: { user: currentUser },
      users: { users: [makeUser({ uid: "u1", photo })] },
    },
  });
}

describe("DashboardNavbar", () => {
  it("renders the hamburger toggle button", async () => {
    const { wrapper } = await mountNavbar();
    expect(wrapper.find(".pi-bars").exists()).toBe(true);
  });

  it("emits toggle-drawer on hamburger click", async () => {
    const { wrapper } = await mountNavbar();
    await wrapper.find('[data-testid="nav.navbar.menu-btn"]').trigger("click");
    expect(wrapper.emitted("toggle-drawer")).toHaveLength(1);
  });

  it("shows the user photo in the Avatar when available", async () => {
    const { wrapper } = await mountNavbar({ photo: "abc123" });
    const avatar = wrapper.findComponent(Avatar);
    expect(avatar.props("image")).toBe("data:image/png;base64,abc123");
    expect(avatar.props("icon")).toBeFalsy();
  });

  it("falls back to the pi-user icon when there is no photo", async () => {
    const { wrapper } = await mountNavbar({ photo: undefined });
    const avatar = wrapper.findComponent(Avatar);
    expect(avatar.props("icon")).toBe("pi pi-user");
    expect(avatar.props("image")).toBeFalsy();
  });

  it("passes the dashboard-root home item to the Breadcrumb", async () => {
    const { wrapper } = await mountNavbar();
    expect(wrapper.findComponent(Breadcrumb).props("home")).toEqual({
      icon: "pi pi-home",
      route: "/dashboard",
    });
  });

  it("builds 2 breadcrumb items for a nested route", async () => {
    const { wrapper } = await mountNavbar({ route: "/dashboard/incidents/reports" });
    expect(wrapper.findComponent(Breadcrumb).props("model")).toEqual([
      { label: "Incidents", route: "/dashboard/incidents" },
      { label: "Reports" },
    ]);
  });

  it("builds 1 breadcrumb item for a single-segment route", async () => {
    const { wrapper } = await mountNavbar({ route: "/dashboard/team" });
    expect(wrapper.findComponent(Breadcrumb).props("model")).toEqual([{ label: "Team" }]);
  });

  it("builds an empty breadcrumb model at the dashboard root", async () => {
    const { wrapper } = await mountNavbar({ route: "/dashboard" });
    expect(wrapper.findComponent(Breadcrumb).props("model")).toEqual([]);
  });
});
