# HealthLog — Developer Guide
### Complete Product & Engineering Spec — Zero to Production

> **One-line pitch:** HealthLog turns every hospital visit — a photo of one report — into an instantly understandable, permanently organized, shareable piece of a patient's personal health history. No hospital integration required. Built to be usable by people with little tech confidence, not just tech-comfortable early adopters.

This is the single reference document for the product. Everything a developer needs to build it from an empty repo to a production-ready app lives here.

---

## Table of Contents

1. [The Problem](#1-the-problem)
2. [The Solution](#2-the-solution)
3. [Core Loop — Why People Keep Using It](#3-core-loop--why-people-keep-using-it)
4. [Feature Set](#4-feature-set)
5. [Designing for Low Tech-Confidence Users](#5-designing-for-low-tech-confidence-users)
6. [System Architecture](#6-system-architecture)
7. [AI Pipeline](#7-ai-pipeline)
8. [Data Model](#8-data-model)
9. [API Design](#9-api-design)
10. [Screens & UX Flows](#10-screens--ux-flows)
11. [Hospital-Wise & Date-Wise Organization](#11-hospital-wise--date-wise-organization)
12. [Tech Stack](#12-tech-stack)
13. [AI API Options — OCR & LLM (Paid + Free)](#13-ai-api-options--ocr--llm-paid--free)
14. [Non-Functional Requirements](#14-non-functional-requirements)
15. [Roadmap: Zero to Production](#15-roadmap-zero-to-production)
16. [Production Readiness Checklist](#16-production-readiness-checklist)
17. [Codebase Structure](#17-codebase-structure)
18. [Glossary](#18-glossary)

---

## 1. The Problem

A patient leaves a hospital with a paper report full of numbers and medical shorthand, gets a couple of minutes of verbal explanation, and then:

- The paper gets lost or buried among a dozen others, unsorted
- Nobody remembers the last visit's results by the time the next one happens
- A new doctor starts from zero, because records never leave the hospital that created them
- A value trending upward for a year just looks like one more confusing number in isolation
- A family member abroad has no visibility into a parent's health until there's an emergency

The information already exists. The patient has no way to see it, understand it, or use it. That's the real problem — not "no digital records," but **no usable meaning from records that already exist**, and no low-effort way to organize them.

---

## 2. The Solution

HealthLog doesn't require any hospital to change anything. The patient is the integration layer: they capture what they're already handed (photo, or manual entry), and the app does the rest.

1. Report is added — scanned via QR at the hospital, photographed, or entered manually
2. AI reads and explains it in plain language
3. It's auto-filed under the correct hospital and date
4. It's plotted against every past reading of the same kind
5. It's instantly shareable with a new doctor or a family member

The phone becomes the one place a patient's real medical history lives, assembled from paper (or a quick manual entry) they were going to have anyway.

---

## 3. Core Loop — Why People Keep Using It

```
   Visit hospital
        │
        ▼
   Add the report (scan / photo / manual entry)
        │
        ▼
   AI reads + explains it in seconds        ← value from report #1, no waiting
        │
        ▼
   Auto-filed: correct hospital, correct date
        │
        ▼
   Compared against past readings → trend shown
        │
        ▼
   Patient understands their own health better than 5 minutes ago
        │
        ▼
   Next visit: repeat — the trend gets more useful every time
```

The loop works because **using the app is the fastest way to understand a report the patient already has in hand** — not an extra chore layered on top of the visit.

---

## 4. Feature Set

### Core
- **Capture** — camera-first photo/PDF capture, QR-assisted at partner hospitals, **and** a fully manual step-by-step entry flow (see [Section 10](#10-screens--ux-flows))
- **AI report reader** — OCR + LLM extraction of test names, values, units, reference ranges, diagnosis, medication
- **Plain-language explainer** — what a report means, generated per report; explains, never diagnoses
- **Auto-filing** — every report attached to the correct hospital and date without manual sorting
- **Timeline view** — every visit, chronological, across all hospitals
- **Hospital view** — every visit, grouped by hospital, chronological within each
- **Trend graphs** — any repeated test value plotted over time automatically
- **Hospital/clinic select-or-create** — search-and-pick from previously used hospitals, or add a new one; no free-text duplicates
- **Doctor name autocomplete** — suggests doctors previously logged at the selected hospital; optional field, never blocks saving

### Growth / retention
- **Care Circle** — link family members' timelines to one account (e.g. a relative abroad checking on a parent's health); also the intended way a tech-comfortable person can log a visit on behalf of someone who isn't
- **Doctor handoff link** — one-tap, read-only, expiring share link/QR for a new doctor
- **Follow-up reminders** — based on dates mentioned in a report

### Later / differentiators
- Handwriting OCR improvements (printed reports are reliable at launch; handwriting is a disclosed limitation, not a launch promise)
- Out-of-range value alerts — informational only, never diagnostic
- PDF export of a date range

---

## 5. Designing for Low Tech-Confidence Users

This is a first-class design constraint, not a nice-to-have — a meaningful share of the target users will not be comfortable with typical app patterns.

- **Tap over type, everywhere possible** — hospital and doctor selection are search-and-pick lists, not free-text fields; typing is where low-confidence users struggle most
- **One question per screen** — the manual add-report flow is a short wizard (one decision per step), never a single long form
- **Camera-first** — most people already know how to take a photo; the whole capture flow is built around that one familiar action
- **Nothing blocks saving except the essentials** — hospital and the report itself; doctor's name and other detail are skippable
- **A big, obvious confirm screen before saving** — so a mistake is easy to catch, never committed silently
- **Icons alongside every label** — a hospital icon next to "Hospital," a calendar icon next to "Date" — so meaning doesn't depend on reading fluency alone
- **Someone else can log it for them** — Care Circle isn't just convenience; it's the accessibility path for a user who genuinely can't use a phone app themselves

---

## 6. System Architecture

```
┌─────────────┐      photo/PDF        ┌────────────────────┐
│  Mobile App │ ────────────────────▶ │  Upload Service      │
│ (React      │                       │  (signed URL → S3)   │
│  Native)    │                       └──────────┬───────────┘
└─────────────┘                                  │
      ▲                                           ▼
      │                               ┌────────────────────┐
      │                               │  OCR + AI Pipeline  │
      │                               │  (async job queue)  │
      │                               └──────────┬───────────┘
      │                                           ▼
      │                               ┌────────────────────┐
      │         structured result       │  Extraction Result │
      │◀─────────────────────────────  │  → MongoDB           │
      │         (push/poll)             └──────────┬───────────┘
      │                                           ▼
      │                               ┌────────────────────┐
      └──────────────────────────────▶│  REST API (Node/      │
        reads: timeline, trends,        │  Express)              │
        hospitals, share links          └────────────────────┘
```

Processing is **asynchronous**. When a report is scanned/photographed, the patient sees "Processing your report…" immediately, and gets notified when the AI pass finishes (typically seconds). Manual entries with a photo still go through this pipeline; manual entries without a photo skip straight to `ready` since there's nothing to OCR.

---

## 7. AI Pipeline

```
1. Image/PDF uploaded (if provided)
        ↓
2. OCR extracts raw text
        ↓
3. LLM structures the text into fields:
     { testName, value, unit, referenceRange, date, hospitalGuess, diagnosis, medication }
        ↓
4. LLM generates a plain-language explanation of the report
        ↓
5. Structured values matched against the patient's prior readings
   of the same test (if any) → trend delta computed
        ↓
6. Result saved to the visit record; patient notified
```

**Hard design rule:** the AI explains and organizes — it never diagnoses. Every generated explanation should read like "here's what this measurement generally relates to," never "you have condition X." This is a safety requirement and a trust requirement at once — the product's credibility depends on staying clearly on the "translation" side of the line, not the "medical advice" side.

---

## 8. Data Model

```js
// users
{
  _id: ObjectId,
  name: String,
  email: String,
  passwordHash: String,
  careCircleMembers: [ObjectId],   // linked dependent profiles
  createdAt: Date
}

// hospitals — first-class entity, not free text
{
  _id: ObjectId,
  userId: ObjectId,
  name: String,
  type: String,                    // 'hospital' | 'clinic'
  location: String,
  firstVisitDate: Date,
  lastVisitDate: Date,
  visitCount: Number                // denormalized counter
}

// visits
{
  _id: ObjectId,
  userId: ObjectId,
  hospitalId: ObjectId,             // reference — enables clean hospital-wise grouping
  visitDate: Date,
  doctorName: String,               // optional, autocompleted from prior visits at this hospital
  reason: String,
  tag: String,                      // 'consultation' | 'lab_test' | 'prescription' | 'vaccination' | 'surgery' | 'other'
  entryMethod: String,              // 'scanned' | 'manual'
  status: String,                   // 'processing' | 'ready' | 'failed'
  attachments: [{
    fileUrl: String,
    fileType: String
  }],
  extractedFields: {                // filled by the AI pipeline when a photo is present
    diagnosis: String,
    medication: String,
    plainLanguageSummary: String,
    testResults: [{
      testName: String,
      value: Number,
      unit: String,
      referenceRange: String
    }]
  },
  createdAt: Date,
  updatedAt: Date
}

// shareLinks — doctor handoff
{
  _id: ObjectId,
  userId: ObjectId,
  scope: String,                    // 'all' | 'lastNVisits' | 'dateRange'
  scopeParams: Object,
  token: String,                    // unguessable, used in the shared URL/QR
  expiresAt: Date,
  createdAt: Date
}
```

`testResults` inside each visit is what powers trend graphs — a query for every visit where `testResults.testName == "Blood Sugar"`, sorted by `visitDate`, is the entire trend feature. Doctor autocomplete is a live query (`distinct('doctorName', { hospitalId })`), not a separate collection — one less thing to keep in sync.

---

## 9. API Design

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/api/auth/signup` / `/login` | Account access |
| GET | `/api/hospitals` | List hospitals the patient has added, for the select step |
| POST | `/api/hospitals` | Create a new hospital/clinic |
| GET | `/api/hospitals/:id/doctors` | Distinct doctor names previously logged at this hospital, for autocomplete |
| GET | `/api/hospitals/:id/visits` | Hospital-wise visit history |
| POST | `/api/visits` | Create a visit (manual fields; `status: ready` if no photo, `processing` if one is attached) |
| POST | `/api/visits/:id/attachments` | Attach a photo/PDF (triggers the AI pipeline) |
| GET | `/api/visits` | Timeline — supports `?from=&to=&hospitalId=&tag=` |
| GET | `/api/visits/:id` | Full visit detail incl. AI explanation and extracted fields |
| PATCH | `/api/visits/:id` | Edit a visit |
| DELETE | `/api/visits/:id` | Delete a visit and its attachments |
| GET | `/api/trends/:testName` | Time series of a given test across all visits |
| POST | `/api/care-circle/invite` | Add a family member to the account |
| POST | `/api/share-links` | Generate a doctor-handoff link/QR |
| GET | `/api/share/:token` | Public, read-only view for a valid share link |

---

## 10. Screens & UX Flows

### Manual "Add Report" flow — one decision per screen
```
Step 1 — Select Hospital/Clinic
  Search box + list of previously used hospitals (tap, no typing)
  "Not in the list?" → + Add New (name, type: Hospital/Clinic, location)
        ↓
Step 2 — Doctor's name
  Autocomplete from doctors seen at THIS hospital before, if any
  Free text if new — optional, skippable
        ↓
Step 3 — Date of visit
  Calendar picker, one-tap "Today" default
        ↓
Step 4 — Upload the report (optional)
  Camera button front and center, gallery as secondary option
  Can save without a photo and add one later
        ↓
Step 5 — Confirm & Save
  Single summary screen showing everything entered, before committing
```

### Overall navigation
```
Onboarding
   └─ Sign up → optional: add first Care Circle member
        ↓
Home (Timeline)
   ├─ [+ Add Report] — always one tap away, launches the manual flow above
   │    (or QR scan shortcut where a partner hospital's code is available)
   ├─ visits grouped by month, hospital badge + tag on each row
   ├─ tab switch → Hospitals view
   └─ tap visit → Visit Detail
                    ├─ AI plain-language summary (shown first, above raw data)
                    ├─ extracted test values + trend sparkline if repeat test
                    ├─ attached photo/PDF (zoomable), or "no report attached" state
                    └─ [Share this report] → generates handoff link/QR
        ↓
Trends tab
   └─ pick a test → full graph across every hospital, colored by source
        ↓
Care Circle tab
   └─ switch between your timeline and a linked family member's
```

---

## 11. Hospital-Wise & Date-Wise Organization

Two views, one dataset — no duplication, just two query paths over `visits`:

| View | Query shape | Use case |
|---|---|---|
| **Timeline** | `find({ userId }).sort({ visitDate: -1 })` | "What's happened to me overall, most recent first" |
| **Hospital-wise** | `find({ userId, hospitalId }).sort({ visitDate: -1 })` | "My full history at this specific hospital," e.g. before a follow-up there |

Filters stack: date range **and** hospital **and** tag can all apply on the Timeline at once. New hospitals are created via the select-or-create step in the Add Report flow — never inferred from free text — which is what keeps every visit at the same place grouped correctly regardless of how carefully the patient types.

---

## 12. Tech Stack

| Layer | Choice | Why |
|---|---|---|
| Mobile app | React Native + Expo | Camera/gallery capture is core to the product; matches prior experience |
| Backend | Node.js + Express | Small, focused API surface for this scope |
| Database | MongoDB | Visit documents are naturally variable-shaped; nested `testResults` arrays fit a document model well |
| File storage | AWS S3 | Photos/PDFs stored here; MongoDB holds only URLs + extracted metadata |
| OCR | Cloud OCR API (e.g. Google Vision / AWS Textract) | Printed reports first; handwriting accuracy is a disclosed limitation |
| AI extraction/explanation | LLM API (e.g. Claude via Anthropic API) | Structuring OCR text and generating the plain-language summary |
| Job queue | BullMQ + Redis | Keeps capture instant while OCR/AI processing runs asynchronously |
| Push notifications | Expo Notifications / FCM | Notify when a scanned report finishes processing |
| Auth | JWT | Standard for a personal-data mobile app |

---

## 13. AI API Options — OCR & LLM (Paid + Free)

Two separate AI jobs run in the pipeline — **reading** the photo (OCR) and **understanding/explaining** the text (LLM) — and they don't have to come from the same vendor. Prices and free-tier limits move often, so treat the numbers below as a snapshot and re-check each provider's official pricing page before committing.

### OCR — reading the report photo

| Option | Type | Free tier | Best for |
|---|---|---|---|
| **Google Cloud Vision (OCR)** | Cloud API | First ~1,000 pages/month free, then roughly $1.50 per 1,000 units | High accuracy on printed reports and even messy handwriting; good default for production |
| **AWS Textract** | Cloud API | Limited AWS free-tier allowance for new accounts | Strong when reports have structured tables/forms, not just plain text |
| **OCR.space** | Hosted free/paid API | <cite index="17-1">Around 25,000 free requests per month</cite> | Fastest way to get a working OCR call with zero setup, good for MVP |
| **Tesseract** | Self-hosted, open source | <cite index="9-1">Fully free under Apache 2.0, runs locally with no usage limits</cite> | Zero ongoing cost and full data control, but needs more setup work and struggles with handwriting/complex layouts |

For clean, printed hospital lab reports, Google Cloud Vision or AWS Textract will give the most reliable extraction. For a free student/MVP build, start with OCR.space or Tesseract and only move to a paid cloud OCR API once accuracy on real reports becomes the bottleneck.

### LLM — structuring the text and writing the plain-language explanation

| Option | Type | Free tier | Best for |
|---|---|---|---|
| **Anthropic Claude API** | Paid, per-token | No standing free production tier | Highest-trust option for the patient-facing explanation, where tone and the "explain, never diagnose" boundary matter most |
| **Google Gemini API** | Free tier available | <cite index="22-1">Gemini 2.5 Flash offers around 1,500 requests/day and a very large tokens-per-minute allowance, with no credit card required</cite> | Prototyping and demos at zero cost — but see the privacy note below before using it on real patient data |
| **Groq** | Free tier available | Roughly 1,000 requests/day per model, fast inference | Cheap/free structuring of already-OCR'd text into fields; less suited to the patient-facing summary itself |

Current Anthropic API rates (per million tokens, input/output) as of this writing: <cite index="31-1">Claude Haiku 4.5 at $1/$5, Claude Sonnet 5 at $2/$10 as an introductory rate through August 31, 2026, and Claude Opus 5 at $5/$25</cite> — confirm current figures at [docs.claude.com](https://docs.claude.com/en/docs/about-claude/pricing) before budgeting, since Anthropic updates pricing over time. A practical split: use the cheaper Haiku-tier model for structuring OCR text into fields (high volume, mechanical task), and reserve the stronger Sonnet-tier model for generating the plain-language explanation itself (lower volume, highest-stakes output — worth the extra cost).

**Important privacy note, not just a cost one:** <cite index="21-1,22-1">Google's Gemini free tier terms allow using free-tier inputs and outputs to improve their models</cite>, and that's true of several free LLM tiers generally, not just Google's. Real hospital reports contain sensitive personal health data. Free tiers with model-training clauses are fine for development with synthetic/dummy reports, but should not touch real patient photos once the app has actual users — switch to a paid tier (which typically excludes your data from training) before launch, regardless of which vendor you land on.

### Recommended stack by stage

- **Prototype / thesis demo (synthetic data only):** OCR.space or Tesseract + Gemini 2.5 Flash free tier — genuinely $0 to build and demo the full pipeline.
- **Production (real patient data):** Google Cloud Vision or AWS Textract for OCR + Claude API (Haiku for structuring, Sonnet for the explanation) — paid, but with the accuracy and data-handling guarantees real health data warrants.

---

## 14. Non-Functional Requirements

| ID | Requirement |
|---|---|
| NFR1 | **Privacy** — all uploaded reports and extracted health data are personal data; encrypt at rest (S3 server-side encryption) and in transit (TLS everywhere). |
| NFR2 | **Safety boundary** — AI output is explanatory only; no wording that reads as diagnosis or treatment advice (see [Section 7](#7-ai-pipeline)). |
| NFR3 | **Accessibility** — every core flow must be completable via tap-only interaction, without required free-text entry, per [Section 5](#5-designing-for-low-tech-confidence-users). |
| NFR4 | **Resilience** — a failed OCR/AI pass must leave the visit in a clear `failed` state with a retry option, never silently stuck in `processing`. |
| NFR5 | **Performance** — capture-to-"processing" confirmation should feel instant (<1s); full AI processing should complete within a few seconds for a typical single-page report. |
| NFR6 | **Data ownership** — a patient can export or delete their full account and all associated data on request. |

---

## 15. Roadmap: Zero to Production

### Phase 0 — Setup
- Repo scaffolding (Expo app + Express API, shared TypeScript types if applicable)
- MongoDB instance (dev), S3 bucket, basic CI (lint + test on push)
- Auth: signup/login, JWT issuance

### Phase 1 — Core MVP (no AI yet)
- Hospital select-or-create, doctor autocomplete
- Manual Add Report wizard (Steps 1–5), photo/PDF attachment upload to S3
- Timeline view, Hospital view, basic filters
- Visit Detail screen (shows raw entered data + attachment, no AI summary yet)

### Phase 2 — AI Pipeline
- OCR integration, async job queue (BullMQ + Redis)
- LLM structuring pass (extracted fields) + plain-language summary generation
- Processing/ready/failed status handling end-to-end, push notifications
- Trend graphs (single test, single hospital first, then cross-hospital)

### Phase 3 — Growth Features
- Doctor handoff share links (read-only public view)
- Care Circle (invite, linked profiles, switch-view UI)
- Follow-up reminders

### Phase 4 — Production Hardening
- Security review (auth, signed URLs, share-link token expiry/revocation)
- Load testing the async pipeline under concurrent uploads
- Crash/error monitoring (e.g. Sentry), structured logging
- App store submission (iOS/Android) — privacy disclosures for health data are required by both stores, budget real time for this
- Data export/delete flows for account closure (NFR6)
- Beta test specifically with low tech-confidence users, not just early adopters — this validates [Section 5](#5-designing-for-low-tech-confidence-users) in practice, not just on paper

---

## 16. Production Readiness Checklist

- [ ] All health data encrypted at rest and in transit
- [ ] Share-link tokens are unguessable, expire, and are revocable
- [ ] AI summaries reviewed against the explain-not-diagnose rule with real sample reports
- [ ] OCR/LLM provider confirmed to be on a paid tier that excludes user data from model training before any real patient report is processed
- [ ] Manual entry flow fully tap-completable, tested with non-technical users
- [ ] Failed OCR/AI jobs surface a retry path, never a silent stuck state
- [ ] App store health-data privacy disclosures completed (iOS App Privacy, Google Play Data Safety)
- [ ] Account data export and full deletion implemented and tested
- [ ] Monitoring/alerting on the job queue (stuck or failing jobs)
- [ ] Backups configured for MongoDB and S3

---

## 17. Codebase Structure

```
healthlog/
├── apps/
│   ├── mobile/                 # React Native (Expo)
│   │   └── src/
│   │       ├── screens/
│   │       │   ├── AddReport/  # Steps 1-5 wizard
│   │       │   ├── Timeline/
│   │       │   ├── Hospitals/
│   │       │   ├── VisitDetail/
│   │       │   ├── Trends/
│   │       │   └── CareCircle/
│   │       └── components/
│   └── api/                    # Node/Express
│       └── src/
│           ├── auth/
│           ├── hospitals/
│           ├── visits/
│           ├── pipeline/       # OCR + LLM job processing
│           ├── trends/
│           ├── shareLinks/
│           └── careCircle/
├── workers/
│   └── ocrAiWorker/             # BullMQ consumer for the AI pipeline
└── docs/
    └── HealthLog-Developer-Guide.md   # this file
```

---

## 18. Glossary

| Term | Meaning |
|---|---|
| **Entry method** | How a visit was added — `scanned` (QR/photo) or `manual` |
| **Extracted fields** | The structured data (diagnosis, medication, test results, summary) produced by the AI pipeline from an attached report |
| **Trend** | A time series of one test's values across every visit where it appears, regardless of hospital |
| **Care Circle** | Linked family member profiles viewable from one account |
| **Share link** | A read-only, expiring, token-based link/QR for handing history to a new doctor |
