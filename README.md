# darbha.info — a legacy of writers, travellers & narrators

A multi-tenant platform for the Darbha family. The apex site shows a gallery of every hosted
Darbha with an application form; each writer gets their own themed subdomain.

| Surface | Where | What |
| --- | --- | --- |
| `darbha.info` | Vercel (`apps/web`) | Gallery of Darbha cards + "apply for a subdomain" form |
| `{name}.darbha.info` | same Next.js app | Per-person site (wildcard routing via `proxy.ts`) |
| `admin.darbha.info` (or `/admin`) | same Next.js app | Writer/admin dashboard (Supabase auth) |
| `api.darbha.info` | Google Cloud Run (`apps/api`) | NestJS REST API on Supabase Postgres |
| DBA (mobile) | Expo (`apps/mobile/dba`) | Darbha Babu Rao memorial app, reads the same API |

## Layout

```
apps/
  web/           Next.js 16 (App Router, Tailwind v4) — apex, subdomains, admin
  api/           NestJS 11 — tenants, works, applications + Supabase JWT auth
  mobile/
    dba/         Expo SDK 57 — "DBA" app; standalone npm project, NOT in the pnpm workspace
packages/
  types/         Shared TypeScript domain types
  ui/            Themeable React components (cards, hero, palettes)
  db/            Prisma 7 schema, migrations, Supabase setup SQL
  config/        Shared tsconfig presets
```

## Prerequisites

- Node >= 20.9, pnpm 10 (`corepack enable`)
- A Supabase project (free tier is fine)
- Accounts on Vercel (web + DNS) and Google Cloud (API on Cloud Run) for deploys

## First-time setup

```bash
pnpm install

# 1. Point Prisma at Supabase — use the SESSION-MODE POOLER (port 5432,
#    aws-<n>-<region>.pooler.supabase.com). The old db.<ref>.supabase.co
#    direct host is IPv6-only and won't resolve on most networks.
cp packages/db/.env.example packages/db/.env   # fill in DATABASE_URL

# 2. Create tables, then seed the three starter tenants
pnpm --filter @darbha/db migrate:deploy
pnpm db:seed

# 3. Run packages/db/supabase/setup.sql in the Supabase SQL editor
#    (RLS, the public `media` storage bucket, and the auth->profiles trigger).
#    Then add the storage upload policy via the dashboard - the SQL editor
#    can't create policies on storage.objects. See the note at the bottom
#    of setup.sql for the exact two clicks.

# 4. Configure the apps
cp apps/api/.env.example apps/api/.env         # pooled DATABASE_URL + SUPABASE_URL
cp apps/web/.env.example apps/web/.env.local   # API URL + Supabase anon key
```

Create your own login in Supabase (Authentication -> Add user), then promote yourself
(this works whether or not your profile row exists yet):

```sql
insert into public.profiles (id, role)
select id, 'admin' from auth.users where email = 'you@example.com'
on conflict (id) do update set role = 'admin';
```

To let a writer manage a site, link their profile: `update public.profiles set tenant_id = '<tenant-id>' where id = '<their-user-id>';`

## Develop

```bash
pnpm dev:site     # NestJS api (4400) + Next.js web (3400) only
pnpm dev          # everything
pnpm dev:mobile   # Expo app (own npm install first: cd apps/mobile/dba && npm install)
```

- Apex: http://localhost:3400
- Subdomains work locally out of the box: http://sailendra.localhost:3400
- Admin: http://localhost:3400/admin (or http://admin.localhost:3400)
- API: http://localhost:4400/v1 (health check at `/v1/health`)

## How multi-tenancy works

[apps/web/proxy.ts](apps/web/proxy.ts) inspects the `Host` header:

- apex / `www` -> the gallery + apply form
- `admin.` -> rewritten to `/admin`
- anything else -> rewritten to `/s/{subdomain}`, which fetches the tenant (name, theme,
  published works) from the API and renders the shared template with that tenant's palette

Adding a Darbha is a data change, not a deploy: approving an application in the admin
dashboard creates the tenant row and the subdomain is live immediately.

Public pages cache API data for 60s, so edits appear on the live site within a minute
or so of saving.

## The admin — Darbha Studio

`admin.darbha.info` (Supabase email/password auth; roles come from `public.profiles`):

- **Works** — write/edit in Markdown, cover images, tags, language (English/Telugu),
  draft vs published, and an explicit date field (when the piece was *written*, not
  uploaded). Admins pick which writer a new work belongs to; writers are scoped to
  their own site automatically.
- **My Site** — each writer edits their own public identity: display name, tagline,
  bio, photo, theme preset, and the structured "Life" profile (roles, born, parents,
  education/career timelines). Blank sections simply don't render publicly. Admins get
  a site picker to curate any site (e.g. Baburao's memorial page).
- **Applications** (admin) — approve to create the tenant + live subdomain, or reject.
- **Sites** (admin) — theme presets and gallery visibility per tenant.
- Every action confirms or fails via glass toasts (top right).

## SEO & discovery

Each host serves its own `robots.txt` and `sitemap.xml` (the apex also lists every
writer's homepage; `admin.` disallows crawling). Pages carry canonical URLs, OpenGraph
tags, and JSON-LD (`Person` on tenant pages, `CreativeWork` with `inLanguage` on works).
Google Search Console is verified as a **Domain property** (DNS TXT in Vercel), which
covers the apex and every `*.darbha.info` subdomain with one verification.

## Deploy

### 1. Supabase

Create the project, run the migration + `setup.sql` as above.

### 2. API -> Google Cloud Run

The API runs as a container on Cloud Run in `asia-southeast1` (Singapore — nearest
region to the Supabase Mumbai database that supports domain mappings; Mumbai itself
doesn't). Built remotely with Cloud Build from [apps/api/Dockerfile](apps/api/Dockerfile)
via [cloudbuild.yaml](cloudbuild.yaml):

```bash
gcloud builds submit --config cloudbuild.yaml --substitutions=_TAG=$(git rev-parse --short HEAD) .
gcloud run deploy darbha-api \
  --image asia-south1-docker.pkg.dev/PROJECT/darbha/api:TAG \
  --region asia-southeast1 --allow-unauthenticated --min-instances 0 --memory 512Mi \
  --set-secrets DATABASE_URL=darbha-database-url:latest \
  --set-env-vars SUPABASE_URL=...,SITE_DOMAIN=darbha.info,CORS_ORIGINS=https://darbha.info
```

`DATABASE_URL` (pooled, port 6543) lives in Secret Manager. The custom domain is a
Cloud Run domain mapping (`gcloud beta run domain-mappings create --service darbha-api
--domain api.darbha.info`) — requires the domain verified in Search Console under the
same Google account.

Note the deploy asymmetry: the web app auto-deploys on every push to `main` (Vercel),
but the API is deployed manually with the two commands above.

### 3. Web -> Vercel

- Import the repo, set the project root to `apps/web` (build config in `apps/web/vercel.json`).
- Env vars: `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_SITE_DOMAIN`, `NEXT_PUBLIC_SUPABASE_URL`,
  `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
- Domains: add `darbha.info` **and** `*.darbha.info` to the project (buying ≠ attaching —
  both entries are needed). The domain lives on Vercel's nameservers, which is what makes
  the `*.darbha.info` wildcard certificate automatic.
- DNS (managed in Vercel): one explicit record peels the API off the wildcard —
  `CNAME api -> ghs.googlehosted.com` (explicit records beat `*`, so `api` routes to
  Cloud Run while every writer subdomain stays on Vercel).

## API surface (prefix `/v1`)

| Method | Path | Auth | Purpose |
| --- | --- | --- | --- |
| GET | `/tenants` | public | Active tenants (gallery cards) |
| GET | `/tenants/:slug` | public | Tenant + published works (subdomains) |
| GET | `/tenants/me` | signed-in | Caller's role + own tenant (drives the dashboard) |
| GET | `/tenants/all` | admin | Every tenant incl. hidden |
| POST/PATCH/DELETE | `/tenants` | admin (writers may PATCH their own) | Manage sites |
| GET/POST/PATCH/DELETE | `/works` | writer/admin | CRUD works (writers scoped to their tenant) |
| POST | `/applications` | public | Apply for a subdomain |
| GET / PATCH | `/applications` | admin | Review; approving creates the tenant |
| GET | `/health` | public | Liveness |
