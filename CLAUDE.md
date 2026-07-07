This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

In all interactions and commit messages, be extremely concise and sacrifice grammar for the sake of concision. Avoid flattery.

## GitHub

- Primary method for interacting with GitHub: GitHub CLI.

## Git

- Branch prefix: `feature/` or `bug/` depending on nature of work.
- `main` is protected — always create a new branch for work.

## Tech Stack

- Vue 3 + Vite + TypeScript
- PrimeVue (theme: "none", styled via tailwindcss-primeui plugin)
- Tailwind CSS v3
- Pinia (+ pinia-plugin-persistedstate) for state management
- Vuelidate for form validation
- Chart.js for charts (e.g. reactor monitoring)
- Vitest + `@vue/test-utils` for unit tests

## Project Structure

```
src/
├── assets/       # CSS, PrimeVue component styles
├── components/   # Reusable Vue components
├── composables/  # Reusable logic (not components)
├── constants/
├── router/       # Routes + auth guard (index.ts)
├── services/     # API services and HTTP client
├── stores/       # Pinia stores
├── types/        # TypeScript interfaces
├── utils/
└── views/        # Page-level components (e.g. auth/, dashboard/)
```

## Api Endpoints schema

Adjacent `shared/` folder (sibling to this repo) contains an `openapi.json` export from the FastAPI service.

## Routing

- Defined in `src/router/index.ts`.
- Auth guard redirects unauthenticated users to `Login`.
- `requiresSuperAdmin` meta redirects non-super-admins to `employees`.

## Styling

- Use Tailwind v3 utility classes
- PrimeVue per-component styles in `src/assets/primevue/*.css`
- Theme customization via CSS variables in `src/assets/main.css`
- Custom palette: primary (purple), surface (gray), danger, success, info, warn
- Colors via CSS vars (`var(--p-primary-700)`) or Tailwind classes (`text-primary-700`)

## Development Rules

- Use PrimeVue components whenever possible
  - Component docs: `https://primevue.org/{component}.md`
  - LLM index: `https://primevue.org/llms/`
- Follow DRY principles
- Interfaces in `types/`, derived from constants when appropriate
- Reusable patterns go in composables, not components
- No speculative/convenience code — every line must be called
- No re-exports or abstractions unless requested
- Follow existing project patterns exactly; don't introduce new ones without consultation
- Never remove a `TODO`/`FIXME`/`HACK` comment; carry them verbatim when moving code
- Use npm for package management
- Prettier for formatting
- Never use type `any`
- Validate the build after every change: `npm run build` (runs type-check + build)

## data-testid Convention

- All interactive elements get `data-testid="domain.component.element-type"` — three required kebab-case segments separated by `.`.
- Stable; never derived from dynamic/user content (no IDs, indices, user strings).
- Suffixes: `-btn`, `-input`, `-select`, `-table`, `-link`, `-message`, `-dialog`.
- Full spec + registry of existing IDs: `.cursor/rules/data-testid-convention.mdc`.

## Testing

### Unit tests
- Sit beside the file: `[Name].unit.spec.ts`
- Use `@vue/test-utils`; run with `npm run test:unit`
- Quality over quantity

### E2E tests
- Live in `Mr-Snrub-Corp/snrub.e2e` — do not add Playwright tests or config to this repo
- On PR, `.github/workflows/e2e.yml` dispatches a `client-pr` event to `snrub.e2e` with the branch name
- Results are visible in the `snrub.e2e` Actions tab, not as a status check on the client PR
- TODO: report E2E result back to the client PR via GitHub commit status API
