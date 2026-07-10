import { http, HttpResponse } from "msw";
import { makeUser } from "@/test/factories/user.factory";
import { makeIncidentType } from "@/test/factories/incidentType.factory";
import { makeIncidentReport } from "@/test/factories/incidentReport.factory";

const API = import.meta.env.VITE_API_URL;

// Default happy-path handlers. Individual tests override per-case with server.use(...).
export const handlers = [
  http.post(`${API}/auth/login`, () =>
    HttpResponse.json({ access_token: "test-token", user: makeUser({ uid: "u1" }) }),
  ),
  http.get(`${API}/users`, () => HttpResponse.json([makeUser({ uid: "u1" })])),
  http.get(`${API}/users/:uid`, () => HttpResponse.json(makeUser({ uid: "u1" }))),
  http.put(`${API}/users/:uid`, () => HttpResponse.json(makeUser({ uid: "u1" }))),
  http.put(`${API}/users/:uid/photo`, () => HttpResponse.json({})),
  http.get(`${API}/incident-types`, () => HttpResponse.json([makeIncidentType({ uid: "type-1" })])),
  http.get(`${API}/incident-reports`, () => HttpResponse.json([])),
  http.post(`${API}/incident-reports`, () =>
    HttpResponse.json(makeIncidentReport({ uid: "report-1" })),
  ),
];
