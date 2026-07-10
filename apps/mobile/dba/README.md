# DBA — Darbha Babu Rao

Memorial/portfolio app for Darbha Babu Rao, Telugu poet & playwright.
Expo SDK 57 + expo-router, terracotta/cream "Liquid Glass" theme.
Content comes from the darbha.info NestJS API (`GET /v1/tenants/baburao`).

> Standalone npm project — deliberately **not** a pnpm workspace member, so
> Metro never fights the monorepo's hoisted layout. Install with npm here.

## Run it

```bash
cd apps/mobile/dba
npm install
cp .env.example .env      # defaults point at the local API
npm run start             # scan the QR with Expo Go
```

The local API must be running (`pnpm dev:site` from the repo root). For a
device on the same Wi-Fi, set `EXPO_PUBLIC_API_URL` in `.env` to your
machine's LAN IP, e.g. `http://192.168.1.3:4400/v1` — `localhost` on a phone
points at the phone itself.

## Structure

- `app/` — expo-router routes: tabs (Home / Poems / Talks) + `poem/[id]`, `play/[id]`
- `components/` — glass primitives (GlassCard, GlassHeader, GradientBackground, …)
- `constants/theme.ts` — the Liquid Glass design tokens (light + dark)
- `lib/api.ts` — API client; `lib/types.ts` — local domain types
- `src/TenantProvider.tsx` — fetch-once tenant context with pull-to-refresh

Telugu text renders with bundled Noto Sans Telugu, registered as `TeluguFont`
in `app/_layout.tsx`.

## EAS builds

`eas.json` has development / preview / production profiles (prod points at
`https://api.darbha.info/v1`). Run `eas init` once to attach a project id,
and set `ios.bundleIdentifier` in `app.json` before an iOS build.
