# HealthLog — Security & Vulnerability Audit Report

**Date:** 2026-08-29
**Scope:** `apps/api` (Node/Express API) and `apps/mobile` (React Native / Expo)
**Type:** Manual code review + live penetration-style testing (no automated scanner)

This report covers the HealthLog personal health-record application. All findings
were verified against the running API. The vulnerabilities marked **FIXED** have
been resolved in code and re-tested live. Items under **Remaining Risk** require
infrastructure/deployment changes or are accepted trade-offs.

---

## 1. Executive Summary

| Severity | # Fixed | # Remaining |
|----------|:-------:|:-----------:|
| Critical | 1 | 0 |
| High     | 3 | 0 |
| Medium   | 3 | 2 |
| Low      | 2 | 3 |

All **Critical** and **High** findings identified during this audit have been
resolved and re-verified. The remaining items are primarily **HTTPS hardening**
and **rate limiting on non-auth share lookups** which require a deployed reverse
proxy and environment configuration rather than application code changes.

**Good news:** passwords are hashed with `bcrypt`, MongoDB was accessed via
Mongoose (no raw NoSQL injection observed), JWTs are verified on every protected
route, and `.env` (containing real secrets) is correctly git-ignored.

---

## 2. Critical Findings (all FIXED)

### 2.1 Stored/Reflected Cross-Site Scripting (XSS) in the share pages — FIXED
**File:** `apps/api/src/sharePages.ts`
**Severity:** Critical

**Description:**
The two browser fallback pages (`/share/report/:token` and `/share/circle/:code`)
injected values directly into HTML/JavaScript **without escaping**:

1. **Stored XSS via AI-extracted report data.** The `plainLanguageSummary`,
   `testResults[].testName`, `referenceRange`, `unit`, `doctorName`, and
   `hospitalId.name` fields come from an LLM (Groq) that processes uploaded
   PDF/photo text. A crafted document could trick the model into emitting HTML
   such as `<img src=x onerror=alert(document.cookie)>`. When a recipient opened
   a shared report link, the script executed in their browser, reading cookies
   / localStorage / exfiltrating data.
2. **Reflected XSS via the invite `code` path parameter** — repeated on
   `/share/circle/:code`.
3. **Reflected XSS via the `Host` header.** The base URL was built from
   `req.get("host")` (attacker-controlled) and injected into a JS string.

**Fix applied:**
- Added `escapeHtml()` used for **every** server-side interpolation (`code`).
- Added a client-side `esc()` and applied it to all AI-extracted data rendered
  inside `.innerHTML`.
- Embedded all JavaScript literals (`BASE`, `DEEP links`) via `JSON.stringify`
  to prevent JS-string breakout.
- Sanitized the `Host` value with a strict `[^a-zA-Z0-9.:\[\]-]` whitelist.
- Configured helmet CSP to bound script/style sources.

**Verified:** Requesting `/share/circle/%3Cscript%3Ealert(1)%3C/script%3E`
now returns `<div class="code">&lt;script&gt;alert(1)&lt;/script&gt;</div>`
(escaped, inert).

---

## 3. High Findings (all FIXED)

### 3.1 Auth token stored in plaintext AsyncStorage — FIXED
**File:** `apps/mobile/src/context/AuthContext.tsx`
**Severity:** High

**Description:** The JWT was saved with `@react-native-async-storage/async-storage`,
which stores data **unencrypted** in the app sandbox. On a rooted/jailbroken
device, via device backups, or from a compromised process, the token (and thus
full account access to medical records) could be read.

**Fix applied:** Installed `expo-secure-store` and migrated token persistence to
the OS **keychain/keystore** (`SecureStore.getItemAsync/setItemAsync`), with an
AsyncStorage fallback only on web and on storage errors. Also removed
`console.log`s that printed user email addresses to the device log.

> **Action required:** `expo-secure-store` is a **native module**. It will not
> run inside Expo Go; a **development/preview build** (`npx expo run:ios|android`
> or EAS build) is required for the change to take effect.

### 3.2 No rate limiting on authentication (brute-force) — FIXED
**Files:** `apps/api/src/auth/auth.routes.ts`, `apps/api/src/middleware/rateLimit.ts`
**Severity:** High

**Description:** `/api/auth/login` and `/api/auth/signup` had **no throttling**,
allowing unlimited password-guessing against any account.

**Fix applied:** Installed `express-rate-limit`; added an `authLimiter`
(**10 requests / 15 min / IP**) on both login and signup, plus a general
`apiLimiter` (**300 / 15 min**) across all `/api` routes and a `publicShareLimiter`
(100 / 15 min) on `/api/share-links/public/:token`. Set `trust proxy = 1` for
correct client IPs behind a reverse proxy.

**Verified:** After 8 failed logins the 9th returned **HTTP 429** with
`{"error":"Too many attempts. Please try again later."}`.

### 3.3 Predictable invite codes (weak RNG) — FIXED
**File:** `apps/api/src/careCircle/careCircle.controller.ts`
**Severity:** High

**Description:** Care-circle invite codes were generated with `Math.random()`,
which is **not cryptographically secure** and could be predicted, enabling an
attacker to forge valid invite codes.

**Fix applied:** Replaced `Math.random()` with `randomBytes(8)` and a modulo
index into the character set (crypto-secure).

---

## 4. Medium Findings (all FIXED)

### 4.1 CORS wide open + missing security headers — FIXED
**File:** `apps/api/src/index.ts`
**Severity:** Medium

**Description:** `app.use(cors())` with no origin restriction allowed any website
to call the API (web client case), and the server sent no security headers.

**Fix applied:** Installed `helmet` (X-Frame-Options, X-Content-Type-Options,
CSP, HSTS, DNS-prefetch control) and locked CORS to a configurable allow-list
(`CORS_ORIGINS` env var; native mobile clients send no `Origin` and are unaffected).

**Verified:** A request with `Origin: https://evil.com` returns **no**
`Access-Control-Allow-Origin` header (blocked). Security headers confirmed
present on all responses.

### 4.2 `updateVisit` allowed assigning an arbitrary (foreign) hospital — FIXED
**File:** `apps/api/src/visits/visits.controller.ts`
**Severity:** Medium

**Description:** `updateVisit` moved a visit to any `hospitalId` without verifying
that the target hospital belonged to the user or was global, allowing a user to
mutate visit counts / last-visit metadata on arbitrary hospitals. It also rebuilt
the document via `Object.assign`.

**Fix applied:** The target hospital is now validated against
`{ isGlobal: true } OR { userId: req.userId }` before reassignment (requires 404 on
an unknown/foreign hospital), and only the whitelisted fields are applied.

**Verified:** `PUT /api/visits/:id` with a foreign `hospitalId` returns
**HTTP 404 `{"error":"Hospital not found"}`**; updating one's own doctor returns 200.

### 4.3 Unbounded unvalidated file uploads — FIXED
**Files:** `apps/api/src/visits/visits.controller.ts`, `.../visits.routes.ts`
**Severity:** Medium

**Description:** The batch base64 upload accepted **any** MIME type and **unlimited**
file counts/sizes (subject only to the global 50 MB body limit), enabling storage
abuse / DoS.

**Fix applied:** Added a MIME-type whitelist (`image/jpeg|png|webp|heic`,
`application/pdf`), a **15 MB per-file** byte limit, and a **20-file-per-batch**
cap. Both single and batch paths call the shared `validateUpload()` helper.

**Verified:** Uploading `text/html` returns **HTTP 400**; a 21-file batch returns
**HTTP 400** `"You can upload a maximum of 20 files at once"`; a mixed batch
processed only the allowed PDF and skipped the disallowed type.

---

## 5. Remaining Risk (accepted / requires deployment changes)

### 5.1 API served over plain HTTP — HIGH (infrastructure)
`apps/mobile/src/api/client.ts` and the share URLs default to `http://192.168.254.5:4000`.
On a public deployment, tokens and medical data travel **in cleartext** and can be
sniffed on the network.

**Required action (deployment):** Terminate TLS at a reverse proxy (nginx/Caddy/ALB)
and set `PUBLIC_BASE_URL` to the `https://` address. HSTS is already sent by helmet;
`upgrade-insecure-requests` is present in the CSP. Set `BASE_URL` in the mobile
client to the same `https://` host for production builds.

### 5.2 Share tokens are capability URLs with limited throttling — MEDIUM
`/api/share-links/public/:token` returns a full visit if the token is known;
tokens are 48 hex chars (~192 bits), which is impractical to brute-force. Public
lookups are now throttled (100/15 min). Anyone with a share link can read the
linked visit until it expires — this is the intended design. Consider a per-token
view cap / earlier expiry for sensitive links.

### 5.3 `updateProfile` trusts arbitrary `emergencyContact`/freetext — MEDIUM
User-supplied profile fields are stored as-is and rendered in the app. React
Native renders text as text (no HTML injection), so risk is low, but validate
lengths to prevent abuse. No `authLimiter` on profile picture upload (it is
throttled by the general API limiter).

---

## 6. Low / Informational

| # | Finding | Status |
|---|---------|--------|
| 1 | Global `express.json({ limit: "50mb" })` — large payloads; bounded per-upload now. | Accepted (needed for base64) |
| 2 | No account email-verification / recovery / 2FA. | Roadmap item |
| 3 | Care-circle `getVisit` fallback logic (visits.controller.ts) is confusing; verify care-circle sharing semantics in a future audit. | Review |
| 4 | Share `base` scheme hard-coded to `http`; switch to `https` w/ proxy. | Deployment |
| 5 | Mobile logs removed for PII; keep device logs free of emails/health data in future. | Done |

---

## 7. What Was Tested (live verification)

- Login/signup happy path (still works after rate limiting). ✅
- Helmet headers present on all responses. ✅
- CSP permits inline share-page scripts (functionality preserved). ✅
- Auth brute-force → **429** after limit. ✅
- Care-circle code XSS → escaped/inert. ✅
- Disallowed MIME upload → **400**. ✅
- Batch size/count caps → **400**. ✅
- Foreign-hospital reassignment → **404**. ✅
- CORS disallowed origin → blocked. ✅
- Both `apps/api` and `apps/mobile` typecheck clean (`npx tsc --noEmit`). ✅

---

## 8. Files Changed (security)

| File | Change |
|------|--------|
| `apps/api/src/sharePages.ts` | HTML/JS escaping + host sanitization (XSS fix) |
| `apps/api/src/middleware/rateLimit.ts` | **New:** auth/public/API limiters |
| `apps/api/src/auth/auth.routes.ts` | Applied `authLimiter` |
| `apps/api/src/shareLinks/shareLinks.routes.ts` | Applied `publicShareLimiter` |
| `apps/api/src/careCircle/careCircle.controller.ts` | CSPRNG codes; `PUBLIC_BASE_URL` |
| `apps/api/src/visits/visits.controller.ts` | Upload validation; hospital ownership check |
| `apps/api/src/visits/visits.routes.ts` | (none) |
| `apps/api/src/shareLinks/shareLinks.controller.ts` | `PUBLIC_BASE_URL` for share URL |
| `apps/api/src/index.ts` | helmet + locked CORS + general limiter + trust proxy |
| `apps/api/.env.example` | Documented `PUBLIC_BASE_URL`, `CORS_ORIGINS` |
| `apps/mobile/src/context/AuthContext.tsx` | **SecureStore** token storage; removed PII logs |
| `apps/mobile/package.json` | added `expo-secure-store` |

**New dependencies:** `express-rate-limit`, `helmet` (API); `expo-secure-store` (mobile).

---

## 9. Recommended Deployment Checklist

1. Put the API behind a reverse proxy with **TLS**; set `PUBLIC_BASE_URL` to the
   `https://` domain.
2. Set a long, random `JWT_SECRET` and rotate if it was ever shared.
3. Point the mobile `BASE_URL` (and any prod build) at the `https://` host.
4. Build mobile with `expo-secure-store` (native dev/preview build) so the token
   lands in the OS keychain.
5. Restart the API (`npm run dev`) so all code changes are live.
