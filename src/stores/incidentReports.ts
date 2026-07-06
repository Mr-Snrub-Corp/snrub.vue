import { defineStore } from "pinia";
import { computed, ref } from "vue";
import api from "@/services/httpService";
import type {
  IncidentReport,
  IncidentReportCreate,
  IncidentReportUpdate,
} from "@/types/incidentReport";

export const useIncidentReportsStore = defineStore("incidentReports", () => {
  // State
  const incidentReports = ref<Record<string, IncidentReport>>({});

  // Getters
  const getAllIncidentReports = computed(() => Object.values(incidentReports.value));
  const getIncidentReportById = computed(() => (uid: string) => {
    return incidentReports.value[uid];
  });

  // Actions
  async function createIncidentReport(data: IncidentReportCreate) {
    try {
      const response = await api.incidentReports.create(data);
      incidentReports.value[response.uid] = response;
      return response;
    } catch (err) {
      console.error("Error creating incident report:", err);
      throw err;
    }
  }

  async function fetchIncidentReports(params?: Record<string, string | number | string[]>) {
    try {
      const response = await api.incidentReports.get(params);
      const map: Record<string, IncidentReport> = {};
      response.forEach((report: IncidentReport) => {
        map[report.uid] = report;
      });
      incidentReports.value = map;
      return response;
    } catch (err) {
      console.error("Error fetching incident reports:", err);
      throw err;
    }
  }

  async function fetchIncidentReportById(uid: string) {
    try {
      const response = await api.incidentReports.getOne(uid);
      incidentReports.value[uid] = response;
      return response;
    } catch (err) {
      console.error(`Error fetching incident report ${uid}:`, err);
      throw err;
    }
  }

  async function updateIncidentReport(uid: string, data: IncidentReportUpdate) {
    try {
      const response = await api.incidentReports.updateOne(uid, data);
      incidentReports.value[uid] = response;
      return response;
    } catch (err) {
      console.error(`Error updating incident report ${uid}:`, err);
      throw err;
    }
  }

  function $reset() {
    incidentReports.value = {};
  }

  return {
    incidentReports,
    $reset,
    getAllIncidentReports,
    getIncidentReportById,
    createIncidentReport,
    fetchIncidentReports,
    fetchIncidentReportById,
    updateIncidentReport,
  };
});
