## Onboarding Tool — Technical Handover

### Overview
Hotel onboarding and management platform consisting of a React (Vite) frontend and Express + MySQL backend. Tables are automatically prefixed with `onboarding_` via a SQL rewriter.

### Architecture
- Frontend: `frontend/` (React + TS + Tailwind + shadcn)
- Backend: `backend/` (Express, mysql2/promise)
- DB: MySQL (external instance)
- Files: AWS S3 (optional)

Key backend entrypoints:
- `backend/src/server.js`: Express app wiring, routes, health/readiness, graceful shutdown
- `backend/src/db/config.js`: MySQL pool, SQL table prefixing, keepalive
- `backend/src/services/s3Service.js`: Upload middleware, list/read/delete/move files

Important frontend modules:
- `frontend/src/apiClient/`: Typed fetch wrappers and per-domain APIs
- `frontend/src/hooks/useHotelFormState.ts`: Multi-step wizard state and orchestration
- `frontend/src/components/forms/*`: Step forms and sections

### Running Locally
1) Install deps
```
npm i
cd frontend && npm i
cd ../backend && npm i
```
2) Create env files from examples (see below)
3) Start dev
```
npm run dev
```
- Frontend: http://localhost:5173
- Backend: http://localhost:3001

### Environment Variables
See `.env.example` files:
- `frontend/.env.example`
- `backend/.env.example`

Backend highlights:
- `DB_*` connection params
- `TABLE_PREFIX` (defaults to `onboarding_`)
- Optional S3: `AWS_REGION`, `AWS_S3_BUCKET`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`

Frontend highlights:
- `VITE_API_BASE_URL`
- `VITE_API_LOGGING_ENABLED` (debug toggle)

### Deployments
- Frontend: Vercel (static)
- Backend: Railway (Node)
- DB: Managed MySQL (publicly reachable, secured by creds/IPs)
See `DEPLOYMENT.md` for steps.

### Data Model
MySQL tables auto-prefixed. See `backend/src/db/config.js` for the rewriter and `backend/src/db/*.sql` for schemas and migrations.

### Coding Conventions
- Removed `console.*` statements and obvious commented-out code.
- File headers added to critical modules.
- Frontend API client exposes typed helpers for HTTP verbs. Errors bubble as `Error(message)`.

### Testing
Jest tests under `backend/test/`. Adjust DB or mock as needed.

### Operational Notes
- Health: `/health` returns `ok`.
- Readiness: `/ready` checks DB connectivity.
- Graceful shutdown handles SIGINT/SIGTERM and unhandled errors.

### Next Steps / Suggestions
- Add structured logger (pino/winston) with env-controlled levels.
- Expand test coverage for events and F&B flows.
- Consider rate limiting and request validation hardening.

### Contacts
All code paths are self-contained. Refer to this document and `README.md` for entrypoints and configuration.

