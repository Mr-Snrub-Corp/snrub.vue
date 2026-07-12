import { describe, it, expect, vi } from "vitest";
import { flushPromises } from "@vue/test-utils";
import type { RouteRecordRaw } from "vue-router";
import Select from "primevue/select";
import DatePicker from "primevue/datepicker";
import { useIncidentReportsStore } from "@/stores/incidentReports";
import { makeIncidentType } from "@/test/factories/incidentType.factory";
import { makeIncidentReport } from "@/test/factories/incidentReport.factory";
import { renderWithPlugins } from "@/test/renderWithPlugins";
import IncidentReportCreate from "./IncidentReportCreate.vue";

const { add } = vi.hoisted(() => ({ add: vi.fn() }));
vi.mock("primevue/usetoast", () => ({ useToast: () => ({ add }) }));

const blank = { template: "<div />" };

const TYPE = makeIncidentType({ uid: "type-1", name: "Safety Breach" });

const routes: RouteRecordRaw[] = [
  { path: "/dashboard/incidents/reports/new", name: "incidentReportCreate", component: blank },
  { path: "/dashboard/incidents/reports/:uid", name: "incidentReportDetail", component: blank },
  { path: "/dashboard/incidents/reports", name: "incidentReports", component: blank },
];

const SUBMIT = "incidents.create-form.submit-btn";
const CANCEL = "incidents.create-form.cancel-btn";

function renderCreate() {
  return renderWithPlugins(IncidentReportCreate, {
    routes,
    initialRoute: "/dashboard/incidents/reports/new",
    // Pre-populate incidentTypes store so the Select has an option to choose.
    initialState: {
      incidentTypes: { incidentTypes: { "type-1": TYPE } },
      users: { users: [] },
    },
  });
}

describe("IncidentReportCreate (integration)", () => {
  it("submit button is disabled when the form is invalid", async () => {
    const { wrapper } = await renderCreate();

    const btn = wrapper.find(`[data-testid="${SUBMIT}"]`);
    expect(btn.attributes("disabled")).toBeDefined();
  });

  it("cancel navigates to incidentReports", async () => {
    const { wrapper, router } = await renderCreate();
    const push = vi.spyOn(router, "push");

    await wrapper.find(`[data-testid="${CANCEL}"]`).trigger("click");

    expect(push).toHaveBeenCalledWith({ name: "incidentReports" });
  });

  it("calls createIncidentReport with correct payload on valid submit", async () => {
    const { wrapper, pinia } = await renderCreate();
    const store = useIncidentReportsStore(pinia);
    vi.mocked(store.createIncidentReport).mockResolvedValue(makeIncidentReport({ uid: "r1" }));

    // Set required fields via v-model emit so Vuelidate sees the values.
    const [typeSelect] = wrapper.findAllComponents(Select);
    await typeSelect.vm.$emit("update:modelValue", "type-1");

    const datePicker = wrapper.findComponent(DatePicker);
    const occurred = new Date("2026-07-10T10:00:00Z");
    await datePicker.vm.$emit("update:modelValue", occurred);

    await flushPromises();

    await wrapper.find(`[data-testid="${SUBMIT}"]`).trigger("click");
    await flushPromises();

    expect(store.createIncidentReport).toHaveBeenCalledWith(
      expect.objectContaining({
        incident_type_id: "type-1",
        occurred_at: occurred.toISOString(),
        severity: 1,
      }),
    );
  });

  it("navigates to incidentReportDetail on success", async () => {
    const { wrapper, pinia, router } = await renderCreate();
    const store = useIncidentReportsStore(pinia);
    vi.mocked(store.createIncidentReport).mockResolvedValue(makeIncidentReport({ uid: "r1" }));
    const push = vi.spyOn(router, "push");

    const [typeSelect] = wrapper.findAllComponents(Select);
    await typeSelect.vm.$emit("update:modelValue", "type-1");

    const datePicker = wrapper.findComponent(DatePicker);
    await datePicker.vm.$emit("update:modelValue", new Date("2026-07-10T10:00:00Z"));

    await flushPromises();

    await wrapper.find(`[data-testid="${SUBMIT}"]`).trigger("click");
    await flushPromises();

    expect(push).toHaveBeenCalledWith({ name: "incidentReportDetail", params: { uid: "r1" } });
  });

  it("shows success toast on create", async () => {
    const { wrapper, pinia } = await renderCreate();
    const store = useIncidentReportsStore(pinia);
    vi.mocked(store.createIncidentReport).mockResolvedValue(makeIncidentReport({ uid: "r1" }));

    const [typeSelect] = wrapper.findAllComponents(Select);
    await typeSelect.vm.$emit("update:modelValue", "type-1");

    const datePicker = wrapper.findComponent(DatePicker);
    await datePicker.vm.$emit("update:modelValue", new Date("2026-07-10T10:00:00Z"));

    await flushPromises();
    await wrapper.find(`[data-testid="${SUBMIT}"]`).trigger("click");
    await flushPromises();

    expect(add).toHaveBeenCalledWith(
      expect.objectContaining({ severity: "success", summary: "Success" }),
    );
  });

  it("shows error toast when createIncidentReport rejects", async () => {
    const { wrapper, pinia } = await renderCreate();
    const store = useIncidentReportsStore(pinia);
    vi.mocked(store.createIncidentReport).mockRejectedValue(new Error("Network Error"));

    const [typeSelect] = wrapper.findAllComponents(Select);
    await typeSelect.vm.$emit("update:modelValue", "type-1");

    const datePicker = wrapper.findComponent(DatePicker);
    await datePicker.vm.$emit("update:modelValue", new Date("2026-07-10T10:00:00Z"));

    await flushPromises();
    await wrapper.find(`[data-testid="${SUBMIT}"]`).trigger("click");
    await flushPromises();

    expect(add).toHaveBeenCalledWith(
      expect.objectContaining({ severity: "error", summary: "Error" }),
    );
  });
});
