import { describe, it, expect } from "vitest";
import type { RouteRecordRaw } from "vue-router";
import DashboardSidebar from "./DashboardSidebar.vue";
import { navItems } from "./navItems";
import { renderWithPlugins } from "@/test/renderWithPlugins";

const blank = { template: "<div />" };

// Named routes matching navItems, using the app's real paths, so isActive()'s
// router.resolve(...) returns the correct path.
const routes: RouteRecordRaw[] = [
  { path: "/dashboard", name: "dashboardHome", component: blank },
  { path: "/dashboard/employees", name: "employees", component: blank },
  { path: "/dashboard/incidents", name: "incidents", component: blank },
  { path: "/dashboard/design/form", name: "designForm", component: blank },
  { path: "/dashboard/reporting", name: "reporting", component: blank },
  { path: "/dashboard/reactor-monitoring", name: "reactorMonitoring", component: blank },
];

function mountSidebar(initialRoute = "/dashboard") {
  return renderWithPlugins(DashboardSidebar, { routes, initialRoute });
}

describe("DashboardSidebar", () => {
  it("renders a link for every nav item", async () => {
    const { wrapper } = await mountSidebar();
    for (const item of navItems) {
      const link = wrapper.find(`[data-testid="${item.testId}"]`);
      expect(link.exists()).toBe(true);
      expect(link.text()).toContain(item.label);
    }
  });

  it("marks only the Employees link current when on the employees route", async () => {
    const { wrapper } = await mountSidebar("/dashboard/employees");
    const current = wrapper.findAll('[aria-current="page"]');
    expect(current).toHaveLength(1);
    expect(current[0].attributes("data-testid")).toBe("nav.sidebar.employees-link");
  });

  it("does not mark Home current on a nested route (exact match only)", async () => {
    const { wrapper } = await mountSidebar("/dashboard/employees");
    const home = wrapper.find('[data-testid="nav.sidebar.home-link"]');
    expect(home.attributes("aria-current")).toBeUndefined();
  });

  it("marks Home current at the dashboard root", async () => {
    const { wrapper } = await mountSidebar("/dashboard");
    const home = wrapper.find('[data-testid="nav.sidebar.home-link"]');
    expect(home.attributes("aria-current")).toBe("page");
  });

  it("emits logout when the logout button is clicked", async () => {
    const { wrapper } = await mountSidebar();
    await wrapper.find('[data-testid="nav.sidebar.logout-btn"]').trigger("click");
    expect(wrapper.emitted("logout")).toHaveLength(1);
  });
});
