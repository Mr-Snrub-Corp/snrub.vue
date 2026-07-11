import { describe, it, expect, vi } from "vitest";
import { flushPromises } from "@vue/test-utils";
import type { RouteRecordRaw } from "vue-router";
import { useIncidentReportsStore } from "@/stores/incidentReports";
import { makeIncidentReport } from "@/test/factories/incidentReport.factory";
import { renderWithPlugins } from "@/test/renderWithPlugins";
import { INCIDENT_STATUS, ESCALATION_LEVEL } from "@/constants/enums";
import IncidentReportEdit from "./IncidentReportEdit.vue";

const { add } = vi.hoisted(() => ({ add: vi.fn() }));
vi.mock("primevue/usetoast", () => ({ useToast: () => ({ add }) }));

const blank = { template: "<div />" };

const REPORT = makeIncidentReport({
  uid: "r1",
  description: "Reactor coolant leak detected",
  severity: 4,
  status: INCIDENT_STATUS.CONFIRMED,
  escalation_level: ESCALATION_LEVEL.ESCALATED,
});

const routes: RouteRecordRaw[] = [
  {
    path: "/dashboard/incidents/reports/:uid/edit",
    name: "incidentReportEdit",
    component: blank,
  },
  {
    path: "/dashboard/incidents/reports/:uid",
    name: "incidentReportDetail",
    component: blank,
  },
  { path: "/dashboard/incidents/reports", name: "incidentReports", component: blank },
];

const UPDATE_BTN = "incidents.edit-form.update-btn";
const CANCEL_BTN = "incidents.edit-form.cancel-btn";

function renderEdit(uid = "r1") {
  return renderWithPlugins(IncidentReportEdit, {
    routes,
    initialRoute: `/dashboard/incidents/reports/${uid}/edit`,
    initialState: {
      incidentReports: { incidentReports: { r1: REPORT } },
      users: { users: [] },
    },
  });
}

describe("IncidentReportEdit (integration)", () => {
  it("calls fetchIncidentReportById with route uid on mount", async () => {
    const { pinia } = await renderEdit();
    await flushPromises();

    const store = useIncidentReportsStore(pinia);
    expect(store.fetchIncidentReportById).toHaveBeenCalledWith("r1");
  });

  it("update button is enabled when form is valid", async () => {
    const { wrapper } = await renderEdit();
    await flushPromises();

    expect(wrapper.find(`[data-testid="${UPDATE_BTN}"]`).attributes("disabled")).toBeUndefined();
  });

  it("calls updateIncidentReport with correct payload on submit", async () => {
    const { wrapper, pinia } = await renderEdit();
    await flushPromises();

    const store = useIncidentReportsStore(pinia);
    vi.mocked(store.updateIncidentReport).mockResolvedValue(REPORT);

    await wrapper.find(`[data-testid="${UPDATE_BTN}"]`).trigger("click");
    await flushPromises();

    expect(store.updateIncidentReport).toHaveBeenCalledWith(
      "r1",
      expect.objectContaining({
        severity: REPORT.severity,
        status: REPORT.status,
        escalation_level: REPORT.escalation_level,
      }),
    );
  });

  it("navigates to incidentReportDetail on success", async () => {
    const { wrapper, pinia, router } = await renderEdit();
    await flushPromises();

    const store = useIncidentReportsStore(pinia);
    vi.mocked(store.updateIncidentReport).mockResolvedValue(REPORT);
    const push = vi.spyOn(router, "push");

    await wrapper.find(`[data-testid="${UPDATE_BTN}"]`).trigger("click");
    await flushPromises();

    expect(push).toHaveBeenCalledWith({ name: "incidentReportDetail", params: { uid: "r1" } });
  });

  it("shows success toast on update", async () => {
    const { wrapper, pinia } = await renderEdit();
    await flushPromises();

    const store = useIncidentReportsStore(pinia);
    vi.mocked(store.updateIncidentReport).mockResolvedValue(REPORT);

    await wrapper.find(`[data-testid="${UPDATE_BTN}"]`).trigger("click");
    await flushPromises();

    expect(add).toHaveBeenCalledWith(
      expect.objectContaining({ severity: "success", summary: "Success" }),
    );
  });

  it("shows error toast when updateIncidentReport rejects", async () => {
    const { wrapper, pinia } = await renderEdit();
    await flushPromises();

    const store = useIncidentReportsStore(pinia);
    vi.mocked(store.updateIncidentReport).mockRejectedValue(new Error("Network Error"));

    await wrapper.find(`[data-testid="${UPDATE_BTN}"]`).trigger("click");
    await flushPromises();

    expect(add).toHaveBeenCalledWith(
      expect.objectContaining({ severity: "error", summary: "Error" }),
    );
  });

  it("cancel navigates to incidentReportDetail", async () => {
    const { wrapper, router } = await renderEdit();
    await flushPromises();
    const push = vi.spyOn(router, "push");

    await wrapper.find(`[data-testid="${CANCEL_BTN}"]`).trigger("click");

    expect(push).toHaveBeenCalledWith({ name: "incidentReportDetail", params: { uid: "r1" } });
  });
});
