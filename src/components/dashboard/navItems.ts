import type { RouteLocationRaw } from "vue-router";

interface NavItem {
  label: string;
  icon: string;
  testId: string;
  to: RouteLocationRaw;
}

export const navItems: NavItem[] = [
  { label: "Home", icon: "pi pi-home", testId: "nav.sidebar.home-link", to: { name: "dashboardHome" } },
  {
    label: "Employees",
    icon: "pi pi-users",
    testId: "nav.sidebar.employees-link",
    to: { name: "employees" },
  },
  {
    label: "Incidents",
    icon: "pi pi-exclamation-triangle",
    testId: "nav.sidebar.incidents-link",
    to: { name: "incidents" },
  },
  {
    label: "Design",
    icon: "pi pi-palette",
    testId: "nav.sidebar.design-link",
    to: { name: "designForm" },
  },
  {
    label: "Reporting",
    icon: "pi pi-chart-line",
    testId: "nav.sidebar.reporting-link",
    to: { name: "reporting" },
  },
  {
    label: "Reactor Monitoring",
    icon: "pi pi-bolt",
    testId: "nav.sidebar.reactor-monitoring-link",
    to: { name: "reactorMonitoring" },
  },
];
