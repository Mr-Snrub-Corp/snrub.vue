import { http, HttpResponse } from "msw";
import { makeUser } from "@/test/factories/user.factory";

const API = import.meta.env.VITE_API_URL;

// Default happy-path handlers. Individual tests override per-case with server.use(...).
export const handlers = [
  http.post(`${API}/auth/login`, () =>
    HttpResponse.json({ access_token: "test-token", user: makeUser({ uid: "u1" }) }),
  ),
];
