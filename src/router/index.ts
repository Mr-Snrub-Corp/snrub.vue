import { createRouter, createWebHistory } from "vue-router";
import { nextTick } from "vue";
import HomeView from "../views/HomeView.vue";
import { useAuthStore } from "@/stores/auth";

declare module "vue-router" {
  interface RouteMeta {
    requiresSuperAdmin?: boolean;
    title?: string;
  }
}

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    // TODO refactor /auth/callback (move login and / forgot into auth )
    // 1. Reads the query parameters
    // 2. Stores the authentication state
    // 3. Redirects to the appropriate page (dashboard, profile, etc.)
    {
      path: "/auth",
      name: "auth",
      component: () => import("@/views/auth/AuthIndex.vue"),
      children: [
        { path: "login", name: "Login", component: () => import("@/views/Login.vue"), meta: { title: "Sign In | Snrub Corp" } },
        {
          path: "forgot-password",
          name: "forgotPassword",
          component: () => import("@/views/ForgotPassword.vue"),
          meta: { title: "Forgot Password | Snrub Corp" },
        },
        {
          path: "callback",
          name: "Callback",
          component: () => import("@/views/auth/AuthCallback.vue"),
          meta: { title: "Signing In | Snrub Corp" },
        },
        {
          path: "reset-password",
          name: "resetPassword",
          component: () => import("@/views/auth/ResetPassword.vue"),
          meta: { title: "Reset Password | Snrub Corp" },
        },
      ],
    },
    {
      path: "/",
      name: "home",
      component: HomeView,
      meta: { title: "Snrub Corp | Welcome" },
    },
    {
      path: "/dashboard",
      name: "dashboardIndex",
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import("@/views/dashboard/DashboardIndex.vue"),
      children: [
        {
          path: "",
          name: "dashboardHome",
          component: () => import("@/views/dashboard/DashboardHome.vue"),
          meta: { title: "Dashboard | Snrub Corp" },
        },
        {
          path: "employees",
          name: "employees",
          component: () => import("@/views/dashboard/employees/Employees.vue"),
          meta: { title: "Employees | Snrub Corp" },
        },
        {
          path: "employees/new",
          name: "employeeCreate",
          component: () => import("@/views/dashboard/employees/EmployeeNew.vue"),
          meta: { requiresSuperAdmin: true, title: "Add Employee | Snrub Corp" },
        },
        {
          path: "employees/:uid",
          name: "employeeDetail",
          component: () => import("@/views/dashboard/employees/EmployeeDetail.vue"),
          meta: { title: "Employee Details | Snrub Corp" },
        },
        {
          path: "employees/:uid/edit",
          name: "employeeEdit",
          component: () => import("@/views/dashboard/employees/EmployeeEdit.vue"),
          meta: { title: "Edit Employee | Snrub Corp" },
        },
        {
          path: "incidents",
          name: "incidents",
          component: () => import("@/views/dashboard/incidents/IncidentsDashboard.vue"),
          meta: { title: "Incidents | Snrub Corp" },
        },
        {
          path: "incidents/reports",
          name: "incidentReports",
          component: () => import("@/views/dashboard/incidents/IncidentReports.vue"),
          meta: { title: "Incident Reports | Snrub Corp" },
        },
        {
          path: "incidents/reports/new",
          name: "incidentReportCreate",
          component: () => import("@/views/dashboard/incidents/IncidentReportCreate.vue"),
          meta: { title: "Create Report | Snrub Corp" },
        },
        {
          path: "incidents/reports/:uid",
          name: "incidentReportDetail",
          component: () => import("@/views/dashboard/incidents/IncidentReportDetail.vue"),
          meta: { title: "Incident Report | Snrub Corp" },
        },
        {
          path: "incidents/reports/:uid/edit",
          name: "incidentReportEdit",
          component: () => import("@/views/dashboard/incidents/IncidentReportEdit.vue"),
          meta: { title: "Edit Report | Snrub Corp" },
        },
        {
          path: "incidents/types",
          name: "incidentTypes",
          component: () => import("@/views/dashboard/incidents/IncidentTypes.vue"),
          meta: { title: "Incident Types | Snrub Corp" },
        },
        {
          path: "reporting",
          name: "reporting",
          component: () => import("@/views/dashboard/reporting/Reporting.vue"),
          meta: { title: "Reporting | Snrub Corp" },
        },
        {
          path: "reactor-monitoring",
          name: "reactorMonitoring",
          component: () => import("@/views/dashboard/reactor-monitoring/ReactorMonitoring.vue"),
          meta: { title: "Reactor Monitoring | Snrub Corp" },
        },
        {
          path: "design",
          name: "design",
          component: () => import("@/views/dashboard/design/DesignIndex.vue"),
          meta: { title: "Design | Snrub Corp" },
          children: [
            {
              path: "form",
              name: "designForm",
              component: () => import("@/views/dashboard/design/Form.vue"),
              meta: { title: "Design: Forms | Snrub Corp" },
            },
            {
              path: "button",
              name: "designButton",
              component: () => import("@/views/dashboard/design/Button.vue"),
              meta: { title: "Design: Buttons | Snrub Corp" },
            },
            {
              path: "data",
              name: "designData",
              component: () => import("@/views/dashboard/design/Data.vue"),
              meta: { title: "Design: Data | Snrub Corp" },
            },
            {
              path: "panel",
              name: "designPanel",
              component: () => import("@/views/dashboard/design/Panel.vue"),
              meta: { title: "Design: Panels | Snrub Corp" },
            },
            {
              path: "overlay",
              name: "designOverlay",
              component: () => import("@/views/dashboard/design/Overlay.vue"),
              meta: { title: "Design: Overlays | Snrub Corp" },
            },
            {
              path: "messages",
              name: "designMessages",
              component: () => import("@/views/dashboard/design/Messages.vue"),
              meta: { title: "Design: Messages | Snrub Corp" },
            },
            {
              path: "misc",
              name: "designMisc",
              component: () => import("@/views/dashboard/design/Misc.vue"),
              meta: { title: "Design: Misc | Snrub Corp" },
            },
          ],
        },
      ],
    },
  ],
});

router.afterEach((to) => {
  document.title = to.meta.title ?? "Snrub Corp";
  nextTick(() => {
    const main = document.querySelector<HTMLElement>("#main-content");
    const target = main?.querySelector<HTMLElement>("h1") ?? main;
    if (target) {
      target.setAttribute("tabindex", "-1");
      target.focus({ preventScroll: false });
    }
  });
});

router.beforeEach(async (to) => {
  const authStore = useAuthStore();
  const isAuthenticated = authStore.isLoggedIn;
  if (
    // make sure the user is authenticated
    !isAuthenticated &&
    // ❗️ Avoid an infinite redirect
    to.name !== "Login" &&
    to.name !== "forgotPassword" &&
    to.name !== "resetPassword" &&
    to.name !== "Callback"
  ) {
    // redirect the user to the login page
    return { name: "Login" };
  }

  // Role-based access control
  if (to.meta.requiresSuperAdmin && !authStore.isSuperAdmin) {
    return { name: "employees" };
  }
});

export default router;
