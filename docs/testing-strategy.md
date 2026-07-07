# Testing Strategy & CI

A phased roadmap to stand up and enforce an enterprise-grade testing setup for `snrub.client` (Vue 3 + Vite + TS, PrimeVue, Pinia, Vuelidate, Chart.js).

## Where we are

- 7 unit-test files (~67 tests + 12 TODO) covering 3 stores, 1 composable, `utils/index`, and 2 components.
- Highest-risk logic is **untested**: the HTTP client (`httpService.ts`), the WebSocket telemetry state machine (`useReactorTelemetry.ts`), the router auth/RBAC guard, and every form view.
- No coverage measurement, no shared test scaffolding, duplicated inline fixtures, an inconsistent naming convention, two contradictory prettier configs.
- CI runs type-check + tests + build on PRs but gives no coverage signal. E2E (separate `snrub.e2e` repo) results never report back to the client PR.

## Decisions

- **Network mocking = hybrid.** MSW at the fetch boundary for integration + `httpService` tests; keep `vi.mock("@/services/httpService")` for fast store unit tests.
- **Accessibility.** Component-level `vitest-axe` from Phase 3 (with the component backfill); full-page `@axe-core/playwright` in `snrub.e2e` in Phase 4.
- **Coverage.** Ratchet, not a day-one hard gate — informational through P1–P2, enforced in P3.

## Testing layers (mapped to phases)

1. **Static** — `vue-tsc` type-check, `eslint .` (no `--fix` in CI), `prettier --check`. → P1 sets up, P2 enforces in CI.
2. **Unit** — pure fns (`utils/*`), `HttpError`, stores (module-mock), `httpService` (via MSW), router guard, `useReactorTelemetry` (fake WS/timers). → targeted subset in P1, remainder in P3.
3. **Component** — `mount` + real PrimeVue via `renderWithPlugins`; `shallowMount`/stub only for Chart.js and heavy children; Vuelidate driven by real input. → migrate 2 + 1 new in P1, form views in P3.
4. **Integration** — component + real store + real router + **MSW** at fetch boundary. → infra + 1 test in P1, remainder in P3.
5. **E2E** — Playwright in `snrub.e2e` (do **not** add here). → report-back gap closed in P4.
6. **Accessibility** — `vitest-axe` (component, P3) + `@axe-core/playwright` (full-page, `snrub.e2e`, P4).

---

## Phase 1 — Foundation + targeted first tests

The `src/test/` harness is a prerequisite for both the component migration and the integration test, so deliver as **two PRs**.

### PR 1a — static hygiene + scaffolding

**Static fixes**

- **Resolve prettier conflict:** `.prettierrc` (`semi:true`, `singleQuote:false`) vs `.prettierrc.json` (`semi:false`, `singleQuote:true`) contradict; Prettier picks one non-deterministically. The codebase uses semicolons + double quotes → **delete `.prettierrc.json`, keep `.prettierrc`, add `printWidth:100`**. Keep `@vue/eslint-config-prettier` `skip-formatting` in `eslint.config.ts`.
- Add scripts: `lint:ci` = `eslint .` (no `--fix`), `format:check` = `prettier --check src/`. Keep `lint` (`--fix`) for local.
- Add `husky` + `lint-staged` pre-commit: `eslint --fix` + `prettier --write` on staged `*.{ts,vue}`. Type-check/vitest stay in CI (too slow for pre-commit).
- Add `"packageManager": "npm@<version>"` to `package.json`.
- Ratchet `@typescript-eslint/no-explicit-any` to **warning** (existing violations in `httpService.ts`/`errors.ts` block an error-level rule for now).

**Scaffolding (`src/test/`)**

```
src/test/
├── setup.ts                       # PrimeVue(theme:"none")+ToastService; Chart stub; MSW listen/reset/close;
│                                  # global afterEach Pinia reset + vi.clearAllMocks(); matchMedia/ResizeObserver polyfills
├── renderWithPlugins.ts           # mount(component,{props,initialRoute,piniaState,stubs}) → {wrapper,router,pinia}
├── factories/                     # makeUser / makeIncidentReport / makeIncidentType — replace duplicated inline mocks
├── fixtures/                      # authResponse sample, etc.
└── msw/{server.ts, handlers.ts}   # setupServer + happy-path handlers per httpService endpoint
```

- Wire `setupFiles: ['src/test/setup.ts']` into `vitest.config.ts`; extend `tsconfig.vitest.json` include to `src/test/**/*.ts`.
- Add `@vitest/coverage-v8` + coverage block (reporters `['text','html','json-summary','lcov']`, `all:true`, exclusions per [Coverage policy](#coverage-policy)) — **thresholds OFF**. Enables local `vitest run --coverage`; CI wiring is P2.
- Add devDeps: `@vitest/coverage-v8`, `msw`, `@pinia/testing`.

### PR 1b — first tests on the new harness

**Unit (targeted)**

- Rename `src/utils/index.spec.ts` → `index.unit.spec.ts` (convention: `[Name].unit.spec.ts` / `[Name].int.spec.ts`).
- `src/utils/incident.ts` — `getTagSeverity`, `getEscalationSeverity`, `getSeverityClass` (severity 1–7 → Tailwind classes, incl. the `bg-fuchsia-600` boundary).
- `src/utils/reactor.ts` — `getReactorStatusSeverity` + `parseReactorTelemetry` (valid / null / non-object / each of 6 fields missing / NaN / Infinity / non-number).
- Store `incidentTypes.ts` — mirror the existing store-unit pattern (`setActivePinia` + `vi.mock("@/services/httpService")` + factories).

**Component (migrate 2 + 1 new)**

- Migrate `DashboardNavbar.unit.spec.ts` and `DeleteConfirmDialog.unit.spec.ts` off `shallowMount` + hand-written stubs onto `renderWithPlugins` + factories (removes `vi.mock("vue-router")`, uses real memory router + real PrimeVue).
- **1 new:** `DashboardSidebar` (or `DashboardDrawer`) — nav-item rendering + active-route highlight — exercises the "write from scratch" path.

**Integration (MSW infra + 1 test)**

- `Login.int.spec.ts` — real auth store + real router, MSW intercepts `POST /auth/login`. Assert: success sets `authStore.token` + navigates; 401 renders the error message. Exercises real `httpService` header injection + `handleResponse` end-to-end.

---

## Phase 2 — Tests working in CI (coverage on every PR)

Split `test-and-build.yml` (currently one serial job) into parallel jobs:

- **`static`** — `lint:ci` + `format:check` + `type-check`
- **`test`** — `vitest run --coverage`
- **`build`** — `npm run build-only`

Details:

- `setup-node@v4` with `node-version-file: .nvmrc` (replaces hardcoded `22`; `.nvmrc` = 22.15.0) + `cache: npm`.
- **Coverage visible on every PR:** upload `coverage/` HTML artifact + `davelosert/vitest-coverage-report-action` posts a sticky PR comment (table + diff vs base) from `coverage-summary.json`.
- Coverage thresholds **stay OFF** (informational) — no hard gate yet.
- Mark `static`/`test`/`build` as required checks on `main`.
- **E2E left for later** (P4).

---

## Phase 3 — Finish unit / component / integration + enforce gates

**Backfill (risk order)**

1. `types/errors.ts` (`HttpError` boundary values) — pure, fast.
2. `httpService.ts` — `getHeaders`/`getAuthHeaders` (Bearer from Pinia + fallback), query serialization (arrays repeated / null-undefined skipped), `handleResponse` (FastAPI `detail[0].msg` array vs string, 500 skips detail, 401 → `authStore.$reset()` + `router.push({name:"Login"})`) via MSW.
3. `router/index.ts` guard — unauth→Login, whitelist passes, non-super-admin→`employees` on `requiresSuperAdmin`; `afterEach` focus/title.
4. Store `incidentCategories.ts`; finish the 9 TODO tests in `useIncidentReportSubjects.unit.spec.ts`.
5. Form views (component + integration): `ForgotPassword`, `ResetPassword`, `IncidentReportCreate/Edit`, `EmployeeNew/Edit`; `ReactorMonitoring` with stubbed charts.
6. **`useReactorTelemetry.ts` (last):** host-component mount + `vi.stubGlobal("WebSocket", FakeWebSocket)` + `vi.useFakeTimers()`. Cases: connect on mount; buffers cap at `MAX_POINTS=50`; malformed JSON dropped; schema-invalid dropped; unintentional close → backoff (1s→2s→4s…30s); `intentionalClose` no reconnect; stale-socket race guard (`ws !== socket`); unmount clears timer + closes.

**Accessibility (component level starts here)** — add `vitest-axe` devDep + matcher in `setup.ts`; attach `expect(await axe(wrapper.element)).toHaveNoViolations()` to form + dashboard-chrome tests as they're written.

**Enforce gates (closing step of P3, once coverage exists)**

- Flip global thresholds **ON** at the ratcheted floor (target end-state global 80% lines / 75% branches).
- Per-file **90%** on the risk core: `httpService.ts`, `useReactorTelemetry.ts`, `router/index.ts`, `utils/reactor.ts`, `utils/incident.ts`, `types/errors.ts`, all stores.
- Ratchet the global floor upward as PRs merge so coverage can't regress.

---

## Phase 4 — Cross-cutting (in `snrub.e2e`)

**Close the E2E report-back gap** (current `e2e.yml` dispatches and never hears back):

1. Client dispatch payload also carries head SHA (`github.event.pull_request.head.sha`) + repo; client sets a `pending` status right after dispatch.
2. `snrub.e2e` on completion calls the **GitHub Commit Status API** (`POST /repos/Mr-Snrub-Corp/snrub.client/statuses/{sha}`, `context:"e2e/playwright"`, `state`, `target_url`) using a token with `statuses:write` on `snrub.client` (secret in `snrub.e2e`).
3. Add `e2e/playwright` as a required check on `main`.

**Full-page accessibility** — `@axe-core/playwright` in `snrub.e2e`: focus order across navigation, live-region announcements for the telemetry "Reconnecting…" states.

*(Both live in `snrub.e2e`; nothing added to this repo.)*

---

## Coverage policy

- Provider `@vitest/coverage-v8`; `all: true`.
- **Exclude:** `main.ts`, `views/dashboard/design/**` (PrimeVue showcase), `components/icons/**`, `*.spec.ts`, `src/test/**`, `types/**` **except `errors.ts`**, `env.d.ts`, `*.config.ts`, generated OpenAPI types.
- **Ratchet, not day-one hard gate:** OFF through P1–P2, floor raised each P3 merge; per-file 90% on the risk core once backfilled.

## Conventions

- Naming: `[Name].unit.spec.ts` / `[Name].int.spec.ts`, co-located beside source (no `__tests__` tree). ESLint's `src/**/*.spec.ts` vitest glob covers both.
- Factories in `src/test/factories/` replace the `mockUser`/`mockUser2` objects duplicated across the store specs.
- `renderWithPlugins` is the default component mount; `shallowMount`/stub only for Chart.js + heavy children.

## Per-phase verification

- **P1** — `npm run build` + `npx vitest run --coverage` green locally.
- **P2** — a CI run showing the 3 jobs + the coverage PR comment.
- **P3** — thresholds enforced + required checks passing.
- **P4** — a client PR showing the `e2e/playwright` status flip.
