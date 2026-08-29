# HealthLog — Phased Build Plan

> How to go from an empty repo to a working, tested, production-ready app — broken into phases, each with GitHub-issue-style tasks you can copy straight into your repo's Issues tab, what to test before moving to the next phase, a "done when" checklist, and reference links. Working name "HealthLog" used throughout — a global find-and-replace handles a rename later.

This plan assumes solo/small-team development around a student schedule, so phases are sized by scope (Small/Medium/Large), not fixed weeks — pace them to your own availability.

---

## How to Use This File

1. Copy each `#### Issue` block below into your GitHub repo as an actual Issue (title + description + acceptance criteria checklist translate directly).
2. Don't start a phase's issues until the previous phase's **"Done When"** checklist is fully checked — each phase is a real gate, not a suggestion.
3. Run the **Testing & Trial** section for a phase before marking it complete, not after moving on.
4. Reference links are there so you're not starting from zero on unfamiliar tools (OCR APIs, job queues, mobile testing) — use them as you hit each task, not all upfront.

---

## Phase 0 — Project Setup & Foundation
**Scope: Small — this is scaffolding, not features.**

### Goal
A running (empty) app and API, connected to a database, with the basics a professional repo needs before any feature work starts.

### Issues

#### Issue 0.1: Initialize the Expo (React Native) project
**Labels:** `setup`, `mobile`
**Description:** Create the mobile app scaffold with TypeScript, matching the folder structure in the Developer Guide (`apps/mobile/src/screens`, `components`).
**Acceptance Criteria:**
- [ ] Expo project runs on both iOS simulator and Android emulator
- [ ] TypeScript configured, no default template errors
- [ ] Folder structure matches the Developer Guide's Codebase Structure section

#### Issue 0.2: Initialize the Node/Express API
**Labels:** `setup`, `backend`
**Description:** Scaffold the Express API with the module folders (`auth`, `hospitals`, `visits`, `pipeline`, `trends`, `shareLinks`, `careCircle`).
**Acceptance Criteria:**
- [ ] `GET /health` returns 200
- [ ] Folder structure matches the Developer Guide
- [ ] Environment variables loaded via `.env` (never committed)

#### Issue 0.3: Set up MongoDB (dev) and connect the API
**Labels:** `setup`, `database`
**Acceptance Criteria:**
- [ ] Local or Atlas free-tier MongoDB cluster created
- [ ] API connects on startup, logs a clear success/failure message
- [ ] `users`, `hospitals`, `visits` collections created per the schema in the Developer Guide

#### Issue 0.4: Set up S3 bucket for file storage
**Labels:** `setup`, `infra`
**Acceptance Criteria:**
- [ ] Bucket created with private access (no public files)
- [ ] Signed-URL upload flow tested with a dummy file from a script or Postman

#### Issue 0.5: Basic CI — lint + test on push
**Labels:** `setup`, `ci`
**Acceptance Criteria:**
- [ ] GitHub Actions workflow runs ESLint and the (currently empty) test suite on every push
- [ ] Broken lint/tests block a visible red X on the commit, not a silent failure

#### Issue 0.6: Auth — signup/login with JWT
**Labels:** `setup`, `auth`
**Acceptance Criteria:**
- [ ] `POST /api/auth/signup` creates a user, hashes the password
- [ ] `POST /api/auth/login` returns a valid JWT
- [ ] A protected test route rejects requests without a valid token

### Testing & Trial for Phase 0
- Manually hit every endpoint above with Postman/Insomnia and confirm the exact response shape
- Confirm the mobile app boots on a real device (not just simulator) at least once — device-only bugs show up early
- Confirm `.env`/secrets are in `.gitignore` before the first real commit — check this explicitly, not by assumption

### Done When
- [ ] Both apps run locally without manual fixes from a fresh `git clone`
- [ ] CI is green on `main`
- [ ] A teammate (or you, on a second machine) can get the project running from the README alone

### References
- Expo docs: https://docs.expo.dev
- Express docs: https://expressjs.com
- MongoDB Atlas (free tier): https://www.mongodb.com/atlas
- GitHub Actions for Node: https://docs.github.com/en/actions/use-cases-and-examples/building-and-testing/building-and-testing-nodejs

---

## Phase 1 — UI/UX Design
**Scope: Small–Medium — mostly Stitch generation + a design review pass.**

### Goal
Every screen designed and agreed on before a single line of UI code is written, so engineering isn't guessing at layout mid-build.

### Issues

#### Issue 1.1: Generate all 11 screens in Stitch
**Labels:** `design`
**Description:** Use `HealthLog-Stitch-Design-Prompts.md` — Foundation Prompt first, then each screen prompt in order, one at a time.
**Acceptance Criteria:**
- [ ] All 11 screens generated in one Stitch project
- [ ] Visual style consistent across all of them (spot-check against the Style & Component Reference table)

#### Issue 1.2: Design review pass
**Labels:** `design`, `review`
**Acceptance Criteria:**
- [ ] Every status badge color checked against the rule (green/amber/red only, used consistently)
- [ ] Every screen re-checked against the low-tech-confidence principles (tap over type, one decision per screen, skippable non-essential fields)

#### Issue 1.3: Export design tokens (colors, spacing, type scale)
**Labels:** `design`, `frontend`
**Acceptance Criteria:**
- [ ] Color palette, spacing scale, and font sizes written into a single shared constants file the mobile app will import from

### Testing & Trial for Phase 1
- Show the exported screens to at least one person with low tech confidence (not a developer) and watch them try to describe what each screen does, without you explaining it first — if a screen needs explaining, it needs redesigning

### Done When
- [ ] All 11 screens approved and exported
- [ ] Design tokens file exists and is ready to import into the mobile codebase

### References
- Google Stitch: https://stitch.withgoogle.com
- `HealthLog-Stitch-Design-Prompts.md` (already created)

---

## Phase 2 — Core MVP (Manual Flow, No AI)
**Scope: Large — this is the biggest phase; it's the whole app minus the AI.**

### Goal
A patient can sign up, add a hospital, log a visit manually (with or without a photo), and see it in both the Timeline and Hospital views. No AI processing yet — photos just get stored.

### Issues

#### Issue 2.1: Hospital select-or-create (`GET/POST /api/hospitals`)
**Labels:** `backend`, `mobile`
**Acceptance Criteria:**
- [ ] Searching returns only the current user's previously added hospitals
- [ ] Creating a new hospital prevents exact-duplicate names for the same user

#### Issue 2.2: Doctor autocomplete (`GET /api/hospitals/:id/doctors`)
**Labels:** `backend`
**Acceptance Criteria:**
- [ ] Returns distinct doctor names previously logged at that hospital, most recent first

#### Issue 2.3: Add Report wizard — Steps 1–5 (mobile UI)
**Labels:** `mobile`, `frontend`
**Description:** Build the 5-step wizard per the Stitch designs and the Developer Guide's UX flow section.
**Acceptance Criteria:**
- [ ] Each step is its own screen with a visible progress indicator
- [ ] "Next" is disabled only where genuinely required (hospital selection); everything else skippable
- [ ] Step 5 summary correctly reflects steps 1–4 before saving

#### Issue 2.4: Create visit (`POST /api/visits`)
**Labels:** `backend`
**Acceptance Criteria:**
- [ ] Visit saves with `status: ready` if no photo attached, `processing` if one is
- [ ] `entryMethod: manual` recorded correctly

#### Issue 2.5: Attachment upload (`POST /api/visits/:id/attachments`)
**Labels:** `backend`
**Acceptance Criteria:**
- [ ] File uploads via signed S3 URL, not through the API server directly
- [ ] Visit record updates with the resulting file URL

#### Issue 2.6: Timeline screen (`GET /api/visits`)
**Labels:** `mobile`, `backend`
**Acceptance Criteria:**
- [ ] Visits grouped by month, newest first
- [ ] Filters (date range, hospital, tag) work individually and combined

#### Issue 2.7: Hospital-wise view (`GET /api/hospitals/:id/visits`)
**Labels:** `mobile`, `backend`
**Acceptance Criteria:**
- [ ] Shows only that hospital's visits, chronological

#### Issue 2.8: Visit Detail screen (`GET /api/visits/:id`)
**Labels:** `mobile`, `backend`
**Acceptance Criteria:**
- [ ] Shows all entered fields and the attachment (zoomable), correctly, even with no AI data yet

#### Issue 2.9: Edit / delete a visit
**Labels:** `mobile`, `backend`
**Acceptance Criteria:**
- [ ] Editing updates the record and denormalized hospital `visitCount`/`lastVisitDate` where relevant
- [ ] Deleting removes the S3 attachment too, not just the database record

### Testing & Trial for Phase 2
- **Manual QA pass, full flow:** sign up → add a new hospital → log 3 visits (one with no photo, one with a photo, one at a second hospital) → confirm Timeline and Hospital views both show them correctly
- **Edge cases to explicitly try:** adding a visit with only the required field filled, editing a visit's hospital, deleting a visit with an attached photo (confirm S3 file is actually gone, not just the database row)
- **Automated tests:** unit tests for the hospital/visit API routes (Jest + Supertest), at minimum covering create/read/update/delete and the duplicate-hospital-name case
- **Low-tech-user test again:** have the same non-developer tester from Phase 1 add a real visit unassisted, on a real device — this is the single most important test in this phase

### Done When
- [ ] Full manual flow works end-to-end on a real device
- [ ] All Phase 2 API routes have passing automated tests
- [ ] The non-developer tester completed the flow without help

### References
- React Navigation (multi-step wizard flow): https://reactnavigation.org
- Supertest (API testing): https://github.com/ladjs/supertest
- AWS S3 signed URLs: https://docs.aws.amazon.com/AmazonS3/latest/userguide/PresignedUrlUploadObject.html

---

## Phase 3 — AI Pipeline (OCR + Explanation)
**Scope: Medium–Large — the product's actual differentiator.**

### Goal
A photographed report gets automatically read, structured, and explained in plain language, with trend graphs working off the extracted values.

### Issues

#### Issue 3.1: Job queue setup (BullMQ + Redis)
**Labels:** `backend`, `infra`
**Acceptance Criteria:**
- [ ] Uploading an attachment enqueues a job instead of processing inline
- [ ] Failed jobs are retried a bounded number of times, then marked `status: failed`, never left stuck

#### Issue 3.2: OCR integration
**Labels:** `backend`, `ai`
**Description:** Start with a free-tier OCR provider for development (OCR.space or Tesseract), per the Developer Guide's AI API Options section.
**Acceptance Criteria:**
- [ ] Raw text extracted from at least 10 varied real/sample report photos, logged for manual accuracy review

#### Issue 3.3: LLM field extraction
**Labels:** `backend`, `ai`
**Acceptance Criteria:**
- [ ] OCR text reliably structured into `{ testName, value, unit, referenceRange, diagnosis, medication }`
- [ ] Malformed/unreadable input fails gracefully into `status: failed`, not a crash

#### Issue 3.4: LLM plain-language summary generation
**Labels:** `backend`, `ai`
**Acceptance Criteria:**
- [ ] Summary generated per report, reviewed against the "explain, never diagnose" rule (see the review checklist below)

#### Issue 3.5: Trend computation (`GET /api/trends/:testName`)
**Labels:** `backend`
**Acceptance Criteria:**
- [ ] Correctly aggregates a test's values across every visit, sorted by date, regardless of hospital

#### Issue 3.6: Processing/ready/failed status + push notification
**Labels:** `mobile`, `backend`
**Acceptance Criteria:**
- [ ] Patient sees a live status badge that updates without a manual refresh
- [ ] Push notification fires when processing completes

#### Issue 3.7: Trends screen (mobile)
**Labels:** `mobile`
**Acceptance Criteria:**
- [ ] Graph renders correctly with 1 data point (no trend line, friendly empty state) and with 5+ points

### Testing & Trial for Phase 3
- **Accuracy trial:** run 15–20 real or realistic sample reports through the pipeline and manually score OCR + extraction accuracy — track this number, it's a legitimate metric for your project report
- **"Explain, not diagnose" review:** read every generated summary against a simple rubric — does it use hedged, descriptive language ("this often relates to...") and avoid definitive claims ("you have...")? Reject/regenerate any that cross the line
- **Failure-path test:** deliberately upload a blank photo, a non-report image (e.g. a random photo), and a very low-quality scan — confirm each fails into a visible, retryable state instead of hanging or crashing
- **Load check:** upload 10 reports in quick succession, confirm the queue processes them without dropping any
- **Latency check:** time from upload to "ready" status for a typical single-page report — this validates NFR5 (Section 13 of the Developer Guide) directly

### Done When
- [ ] Accuracy trial results documented (even if imperfect — this is real data for your project writeup)
- [ ] Every summary in the accuracy trial passes the explain-not-diagnose review
- [ ] Trends render correctly for both single-hospital and cross-hospital test histories

### References
- Anthropic API docs: https://docs.claude.com
- Google Gemini API docs: https://ai.google.dev/gemini-api/docs
- BullMQ docs: https://docs.bullmq.io
- Google Cloud Vision OCR docs: https://cloud.google.com/vision/docs/ocr

---

## Phase 4 — Growth Features
**Scope: Medium.**

### Goal
Care Circle, doctor handoff, and reminders — the features that make the app spread and get reused, not just used once.

### Issues

#### Issue 4.1: Care Circle invite + linked profiles
**Labels:** `backend`, `mobile`
**Acceptance Criteria:**
- [ ] Inviting a family member links their account, viewable from the inviter's Care Circle tab
- [ ] Switching between profiles correctly scopes every screen (Timeline, Hospitals, Trends) to the selected person

#### Issue 4.2: Doctor handoff share links
**Labels:** `backend`, `security`
**Acceptance Criteria:**
- [ ] Generated token is unguessable (sufficiently random, not sequential)
- [ ] Expired or revoked tokens return a clear "link no longer valid" response, not an error page
- [ ] Public share view is genuinely read-only — no write endpoints reachable via the token

#### Issue 4.3: Follow-up reminders
**Labels:** `backend`, `mobile`
**Acceptance Criteria:**
- [ ] Reminder scheduled correctly from a date mentioned in a report
- [ ] Notification fires at the right time, cancellable by the patient

### Testing & Trial for Phase 4
- **Security-specific test:** try to guess or brute-force a share link token pattern; try hitting a write endpoint (e.g. edit a visit) using a share-link token instead of a real auth token — it must fail
- **Care Circle test:** confirm a linked family member's data never leaks into the inviter's own Timeline/Trends by accident (a real bug risk once two people's data lives in one account's view)
- **Manual test:** revoke a share link, then confirm the previously-shared URL immediately stops working

### Done When
- [ ] Share links pass the security-specific tests above
- [ ] Care Circle profile-switching verified with two real linked test accounts, not just one

### References
- JWT best practices: https://curity.io/resources/learn/jwt-best-practices/
- Expo push notifications: https://docs.expo.dev/push-notifications/overview/

---

## Phase 5 — Testing, Hardening & Production Launch
**Scope: Medium–Large — don't compress this phase to save time; it's the difference between a demo and a real product.**

### Goal
Ship it — securely, with monitoring in place, and validated by real users outside your own dev circle.

### Issues

#### Issue 5.1: Security review
**Labels:** `security`
**Acceptance Criteria:**
- [ ] All health data confirmed encrypted at rest (S3) and in transit (TLS)
- [ ] AI provider confirmed on a paid tier that excludes user data from training (see Developer Guide Section 13) before any real report is processed
- [ ] Basic auth/JWT vulnerabilities checked (token expiry enforced, no sensitive data in the token payload)

#### Issue 5.2: Load test the async pipeline
**Labels:** `infra`, `testing`
**Acceptance Criteria:**
- [ ] Queue tested under a concurrent burst of uploads (simulate at least 20–30 at once) without failures or dropped jobs

#### Issue 5.3: Crash and error monitoring
**Labels:** `infra`
**Acceptance Criteria:**
- [ ] Sentry (or equivalent) integrated on both mobile and backend
- [ ] A deliberately triggered test error shows up in the dashboard within minutes

#### Issue 5.4: App store submission prep
**Labels:** `release`
**Acceptance Criteria:**
- [ ] iOS App Privacy and Google Play Data Safety forms completed accurately for health data — budget real time here, these are frequently the slowest part of submission
- [ ] Privacy policy published and linked from both store listings

#### Issue 5.5: Data export & account deletion
**Labels:** `backend`, `compliance`
**Acceptance Criteria:**
- [ ] A user can request and receive a full export of their data
- [ ] Account deletion actually removes all associated visits, attachments, and share links — verified, not assumed

#### Issue 5.6: Beta test with real, low-tech-confidence users
**Labels:** `testing`, `ux`
**Acceptance Criteria:**
- [ ] At least 5 testers outside your own dev/design circle complete the full flow (sign up → add a hospital → log a visit → view the AI summary) unassisted
- [ ] Every point of confusion they hit is logged as a follow-up issue, even small ones

### Testing & Trial for Phase 5
- Full regression pass through every screen and flow built in Phases 2–4, on both a real iOS and a real Android device
- Confirm monitoring actually alerts you (not just logs silently) when something breaks
- Confirm the production readiness checklist in the Developer Guide (Section 16) is fully checked before flipping the switch

### Done When
- [ ] All Phase 5 issues closed
- [ ] Beta testers completed the flow with a clean unassisted success rate you're comfortable with
- [ ] App submitted to at least one store, or internal-track distributed if store submission isn't the immediate goal

### References
- Sentry for React Native: https://docs.sentry.io/platforms/react-native/
- Apple App Privacy details: https://developer.apple.com/app-store/app-privacy-details/
- Google Play Data Safety: https://support.google.com/googleplay/android-developer/answer/10787469
- OWASP Mobile Top 10: https://owasp.org/www-project-mobile-top-10/

---

## Quick Reference — Phase Summary

| Phase | Focus | Scope | Gate to move on |
|---|---|---|---|
| 0 | Setup & foundation | Small | Fresh clone runs, CI green |
| 1 | UI/UX design | Small–Medium | All 11 screens approved |
| 2 | Core MVP (manual, no AI) | Large | Full manual flow works, non-dev tester succeeds unassisted |
| 3 | AI pipeline | Medium–Large | Accuracy trial documented, all summaries pass explain-not-diagnose review |
| 4 | Growth features | Medium | Share-link security tests pass, Care Circle isolation verified |
| 5 | Hardening & launch | Medium–Large | Production checklist fully checked, beta testers succeed unassisted |
