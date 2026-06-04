# snrub.client

Vue 3 frontend for the Snrub platform. Built with Vite, TypeScript, PrimeVue, Tailwind CSS, and Pinia.

## Project Structure

```
src/
├── assets/       # Static assets, CSS, PrimeVue component styles
├── components/   # Reusable Vue components
├── composables/  # Shared composition functions
├── constants/    # App-wide constants
├── router/       # Vue Router configuration
├── services/     # API services and HTTP client
├── stores/       # Pinia state management
├── types/        # TypeScript type definitions
├── utils/        # Utility helpers
└── views/        # Page-level components (auth/, dashboard/, etc.)
public/           # Public static assets
```

## Local development

This repo is run as the **Vue frontend** alongside the API. Docker Compose lives in [snrub.api](https://github.com/Mr-Snrub-Corp/snrub.api) — see its [README](https://github.com/Mr-Snrub-Corp/snrub.api#local-development) for full setup.

1. Clone both repos into adjacent folders:

   ```
   parent/
   ├── snrub.api/
   └── snrub.client/
   ```

2. Follow the snrub.api local development steps (env file, Docker Compose, migrations, etc.).

3. Start the stack with the Vue profile:

   ```bash
   COMPOSE_PROFILES=vue docker compose up -d --build
   ```

   Or set `COMPOSE_PROFILES=vue` in the `.env` next to `docker-compose.yaml` in snrub.api.

The client is served by Docker as part of that stack at http://localhost:5173. API docs: http://localhost:8000/docs

## Scripts

| Command             | Description                    |
| ------------------- | ------------------------------ |
| `npm run dev`       | Vite dev server with HMR       |
| `npm run build`     | Typecheck and production build |
| `npm run lint`      | ESLint                         |
| `npm run test:unit` | Vitest unit tests              |
| `npm run preview`   | Preview production build       |

## End-to-End Tests

E2E tests live in [`Mr-Snrub-Corp/snrub.e2e`](https://github.com/Mr-Snrub-Corp/snrub.e2e) — not this repo. This allows the same test suite to run against the Vue, React, and Angular versions of the app.

On pull request, `.github/workflows/e2e.yml` dispatches a `client-pr` event to `snrub.e2e` with the branch name. Results appear in the `snrub.e2e` Actions tab.

> **TODO:** report E2E pass/fail back to the client PR via the GitHub commit status API.
