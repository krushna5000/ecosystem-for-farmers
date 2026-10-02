# FarmsEasy backend

One Express backend for the whole FarmsEasy ecosystem, on **Drizzle ORM + PostgreSQL**. It replaces eleven separate backends that used raw `pg` SQL (and Mongoose in a few places).

```
src/
  app.js            Express app: security, CORS, one router per portal
  server.js         bootstrap (DB check, optional Mongo + weather cron, graceful shutdown)
  config/env.js     all environment variables
  db/
    schema/         Drizzle schema — one file per PostgreSQL schema (47 tables)
    index.js        `db` (node-postgres in prod, in-memory PGlite when DB_DRIVER=pglite)
    mongo.js        optional Mongoose connection (farmer-app AI features only)
  lib/              storage (S3 or local), uploads (multer), mailer, jwt, rowCase
  modules/          app · admin · superAdmin · company · vendor · website
drizzle/            generated SQL migration
tests/              smoke tests (npm test)
```

## Run

```bash
cp .env.example .env        # fill in DB_* and JWT_SECRET
npm run db:migrate          # create schemas + tables from ./drizzle
npm run db:seed             # optional: first super admin (needs SUPERADMIN_EMAIL / SUPERADMIN_PASSWORD)
npm run dev
npm test                    # 8 smoke suites on in-memory Postgres — no database needed
```

Change the schema in `src/db/schema/*`, then `npm run db:generate` to produce a new migration.

## Run everything (backend + all frontends)

From the repository root:

```bash
npm run dev            # = node dev-all.mjs — starts the API and every web frontend, Ctrl+C stops all
npm run dev:list       # print services and ports
node dev-all.mjs --only=backend,admin,company   # start a subset
```

The first run installs any missing `node_modules` (with `npm ci`, so lockfiles are untouched).

| Service | URL | API prefix it talks to |
|---|---|---|
| backend | http://localhost:5000 | — |
| Super Admin (`SuperAdmin-main/Frontend`) | :5173 | `/api/super-admin` |
| Company (`Company/frontend`) | :5174 | `/api/company-portal` |
| Admin (`AdminFarmseasy/Frontend`) | :5175 | `/api/admin` |
| Vendor (`Vendor-master/frontend`) | :5176 | `/api/vendor-portal` |
| Farmer web app (`WebApp/Frontend`) | :5177 | `/api/app` |
| Agri dashboard (`AgriDashboard-main/frontend`) | :5178 | none (static UI) |
| Website + CMS (`FARMSEASY.IN-main/Frontend`) | :5179 | `/api/website` |
| New marketplace (`New-Marketplace-main/Frontend`) | :5180 | none (static UI) |
| GDD prototype (`FarmsEasy-AI-main/GDD/Frontend`) | :5181 | `/api/prototypes/gdd` |
| Map prototype (`FarmsEasy-AI-main/MapPrototype/frontend`) | :5182 | `/api/prototypes/map` |
| Product prototype (`FarmsEasy-AI-main/Product Prototype`) | :5183 | none (static UI) |

Each frontend gets its API URL from a git-ignored `.env` (`VITE_API_URL`, `VITE_BACKEND_URL` or `VITE_DOMAIN`). Dev logins for the admin portals are created by `npm run db:seed`, `db:seed:admin` and `db:seed:dev` (credentials are in `backend/.env`). `Application-main` is the Flutter app; it has no API client yet and is not part of this.

## Portals and routes

Every old backend became a module mounted under one prefix. **Inside a module the original paths are unchanged apart from the old leading `/api`**, so each frontend only needs a new base URL. Per-module `ROUTES.md` lists every route (old path → new path, method, auth).

| Old backend | Prefix | Frontend change | Routes |
|---|---|---|---|
| `WebApp/Backend` (farmer app, web app, WhatsApp) | `/api/app` | `…/api/auth/login/send-otp` → `…/api/app/auth/login/send-otp` | 39 |
| `AdminFarmseasy/backend` | `/api/admin` | `/api/login` → `/api/admin/login` | 33 |
| `SuperAdmin-main/Backend` | `/api/super-admin` | `/api/crops/all` → `/api/super-admin/crops/all` | 61 |
| `Company/backend` | `/api/company-portal` | `/api/company/login` → `/api/company-portal/company/login` | 45 |
| `Vendor-master/backend` | `/api/vendor-portal` | `/api/brands` → `/api/vendor-portal/brands` | 47 |
| `FARMSEASY.IN-main/Backend` | `/api/website` | `/api/jobs` → `/api/website/jobs` | 26 |
| `FarmsEasy-AI-main` GDD + Map prototypes | `/api/prototypes` | `/api/transform` → `/api/prototypes/gdd/transform`, `/api/farm` → `/api/prototypes/map/farm` | 2 |

See `src/modules/*/ROUTES*.md`.

## What was merged and what was not

- **Merged:** the six backends above plus the two prototype backends. `APP/` is an older copy of `WebApp/Backend` and was not ported separately.
- **Not ported — superseded:** `superAdminDashboard-main/backend` targets an old schema (`countries`, `category_stages`, `crop_tracking`, `admins.permissions`, …) that is not in the database documentation.
- **Not ported — prototypes:** `AgriDashboard-main/backend` (Mongo; its auth/farm routes were never mounted and its frontend makes no API calls). The two tiny `FarmsEasy-AI-main` prototype backends (GDD, Map) *were* ported as the `prototypes` module so their frontends work.
- **Still MongoDB (Mongoose):** crop-ai diagnosis cache, weather history, field indexes, stress results, CLSM lifecycle. These collections are not in the PostgreSQL documentation, so they stay on Mongoose. `MONGO_URI` is optional exactly as before.
- The old folders are untouched, so nothing is lost; delete them once you are satisfied.

## Behaviour that deliberately differs from the old backends

- **Per-portal JWT secrets and cookie names.** All portals now share one origin and one `JWT_SECRET`, which would let a farmer-app token (anyone can get one via OTP) authenticate against the super-admin API. Each portal now signs with `JWT_SECRET:<portal>` (`src/lib/jwt.js`); farmer-app tokens keep the raw secret, so mobile sessions survive. Colliding cookie names were renamed: super admin `token` → `super_admin_token`, website admin `adminToken` → `website_admin_token`. Users of the privileged portals must log in again after cutover. `tests/integration.smoke.mjs` verifies the isolation.
- **Responses stay snake_case** (Drizzle is camelCase internally; `lib/rowCase.js` converts top-level keys), so frontends keep working. JSON column contents are untouched.
- **`date` columns** (e.g. `sowing_date`) now serialise as `YYYY-MM-DD` instead of an ISO timestamp.
- **Crop-ai product recommendations** call the company recommendation service in-process (it used to be an HTTP call to the Company backend).
- **Bugs that made routes always fail were fixed:** farm update (`PUT /app/farms/update-farm/:id`), crop-stage create, crop-advisory.
- **Company scoping added** to lead/sub-category/product status updates that previously updated by id only.
- Hardcoded secrets/fallbacks (a Farmonaut token, an S3 bucket name) were removed in favour of environment variables.

## Database notes

`src/db/schema` follows the database documentation, with these reconciliations:

- Added, because the code uses them but the doc does not list them: table `company_schema.leads`, column `companies.logo_url`.
- `companies.password` is nullable (the doc's column table says so and the admin flow creates companies without a password; the doc's DDL says `NOT NULL`).
- `crops` has no `farm_id` (the doc DDL references one that the table does not define); `states.updated_at ON UPDATE` is not valid PostgreSQL and is handled by Drizzle's `$onUpdate`.
- `companies.company_type` is `NOT NULL` with `ON DELETE SET NULL` in the doc (contradictory) — kept literally, so deleting a company type that is in use fails.
- `company_schema.brands.brand_name` is globally `UNIQUE` per the doc, but the old code only checked per company: a brand name used by another company now fails with a 500.
- `website_schema.team_members.image_url` is `NOT NULL`; creating a member without an image stores `""` (the old code stored NULL).

## Open security findings (preserved from the old code — your call)

None of these were silently changed, because they alter API contracts the frontends rely on.

1. **Website CMS:** every mutating endpoint (`/registeradmin`, jobs, blogs, team, connections update/delete) is unauthenticated, and `GET /connections` exposes contact-form data. Blog/team uploads accept any file type up to 50 MB.
2. **Vendor portal:** service-location routes trust `vendor_id` from the request, so any vendor can read/create/edit/delete another vendor's locations; `PATCH /subcategories/status/:id` is not scoped to the vendor; login does not check `is_active` / `is_approve` / `is_delete`.
3. **Admin portal:** `GET /companies/company/verify-email/:token` and `GET /vendors/verify-email/:token` return a `verify_token` to anyone who sends an unknown token; `GET /companies` returns password hashes.
4. **OTP endpoints** (admin company/vendor OTP, vendor forgot-password, farmer-app login) return the OTP in the response body.
5. Cookies are `secure: false` in the admin, company, vendor and website portals.
6. **Rotate credentials that were committed in the old repo:** a Farmonaut bearer token (old `WebApp/Backend/controllers/weatherController.js`) and sample credentials in `superAdminDashboard-main/backend/README.md`.

## Not verified

Everything runs against in-memory PostgreSQL (PGlite) with the real migration; `pg`, S3, SMTP, MongoDB, Gemini, Farmonaut and Open-Meteo were not exercised against live services (Mongo models and outbound HTTP are stubbed in tests). Run the suite against a staging database before cutover.
