# HealthLog

Personal health record app — patients scan or manually log their hospital visit
reports, get an AI-generated plain-language explanation, and see health trends
organized by date and by hospital.

Full product/engineering spec, design prompts, and the phased build plan are in
[`/docs`](./docs). Start with `HealthLog-Developer-Guide.md`.

## Project structure

```
healthlog/
├── apps/
│   ├── mobile/   # React Native (Expo) app
│   └── api/      # Node/Express API
├── docs/         # Full spec, design prompts, phased roadmap
└── .github/workflows/ci.yml
```

## Running the API

```bash
cd apps/api
cp .env.example .env    # fill in your own values
npm install
npm run dev              # starts on http://localhost:4000
```

`GET http://localhost:4000/health` should return `{ "status": "ok" }`.

## Running the mobile app

```bash
cd apps/mobile
npm install
npx expo start
```

Scan the QR code with Expo Go, or press `i`/`a` for a simulator/emulator.

By default the mobile app points at `http://localhost:4000` — change
`API_BASE_URL` in `apps/mobile/src/api/client.ts` if your API runs elsewhere
(e.g. your machine's LAN IP when testing on a physical phone).

## Current status

This is the **Phase 0 scaffold**: project structure, auth (signup/login),
health check, and CI are wired up and working. Hospitals, visits, the AI
pipeline, trends, share links, and Care Circle are stubbed with empty routers
— see `docs/HealthLog-Phase-Roadmap.md` for what gets built in each
following phase, as GitHub-issue-ready tasks.

## Environment variables (API)

See `apps/api/.env.example` for the full list. At minimum for Phase 0 you
need `MONGODB_URI` and `JWT_SECRET`.
