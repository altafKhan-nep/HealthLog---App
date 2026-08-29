# HealthLog — Every Patient's Health History, In One Place

> **One-line pitch:** HealthLog turns every hospital visit — a photo of one report — into an instantly understandable, permanently organized, shareable piece of your personal health history. No hospital integration required. The patient owns the data from day one.

---

## Table of Contents

1. [The Real Problem](#1-the-real-problem)
2. [The Solution](#2-the-solution)
3. [The Core Loop (Why People Keep Using It)](#3-the-core-loop-why-people-keep-using-it)
4. [Feature Set](#4-feature-set)
5. [System Architecture](#5-system-architecture)
6. [AI Pipeline (Capture → Understanding)](#6-ai-pipeline-capture--understanding)
7. [Data Model](#7-data-model)
8. [Hospital-Wise & Date-Wise Organization](#8-hospital-wise--date-wise-organization)
9. [API Design](#9-api-design)
10. [Screens & UX Flow](#10-screens--ux-flow)
11. [Modern Design Principles](#11-modern-design-principles)
12. [Habit-Forming Mechanics](#12-habit-forming-mechanics)
13. [Growth Loops](#13-growth-loops)
14. [Tech Stack](#14-tech-stack)
15. [Roadmap](#15-roadmap)

---

## 1. The Real Problem

A patient walks out of a hospital with a piece of paper covered in numbers and medical shorthand, gets maybe two minutes of explanation, and then:

- The paper gets lost, or sits in a drawer with a dozen others, unsorted
- Nobody remembers what the last visit's results were when the next one happens
- A new doctor starts from zero because the old hospital's records never left that hospital
- A value that's been trending upward for a year looks, to the patient, like just one more confusing number
- A family member abroad has no idea what's going on with a parent's health until there's an emergency

The paper *contains* the information. The patient just has no way to see it, understand it, or use it. That's the actual problem — not "no digital records," but **no usable meaning from the records that already exist.**

---

## 2. The Solution

HealthLog doesn't ask hospitals to change anything. The patient is the integration layer: they photograph what they're already handed, and the app does the rest —

1. Reads the report (OCR)
2. Explains it in plain language (AI)
3. Files it under the right hospital and date automatically
4. Plots it against every past reading of the same kind
5. Makes it instantly shareable with a new doctor or a family member

The patient's phone becomes the one place their entire, real medical history lives — assembled from paper they were going to have anyway.

---

## 3. The Core Loop (Why People Keep Using It)

```
   Visit hospital
        │
        ▼
   Scan the report (QR at counter, or just photo)
        │
        ▼
   AI reads + explains it in seconds        ← value on visit #1, no waiting
        │
        ▼
   Auto-filed: correct hospital, correct date
        │
        ▼
   Compared against past readings → trend shown
        │
        ▼
   Patient understands their own health better than they did 5 minutes ago
        │
        ▼
   Next visit: repeat — and the trend gets more useful every time
```

The loop is what makes this a habit rather than a chore: **using the app is the fastest way to understand a report you already have in your hand**, not an extra task layered on top of the hospital visit.

---

## 4. Feature Set

### Core (must exist for the product to make sense)
- **Scan & capture** — camera-first report capture, QR-code assisted at partner hospitals/pharmacies
- **AI report reader** — OCR + LLM extraction of test names, values, units, reference ranges, diagnosis, medication
- **Plain-language explainer** — "what this report means," generated per report, not a diagnosis
- **Auto-filing** — every report attached to the correct hospital and date without manual sorting
- **Timeline view** — every visit, chronological, across all hospitals
- **Hospital view** — every visit, grouped by hospital, chronological within each
- **Trend graphs** — any repeated test value (blood sugar, BP, cholesterol, etc.) plotted over time automatically

### Growth / retention features
- **Care Circle** — one account can include family members (e.g., a parent), so someone abroad or simply busy can check in on a loved one's health history remotely
- **Doctor handoff link** — a one-tap, read-only, expiring share link or QR code that gives a new doctor the relevant history instantly
- **Follow-up reminders** — nudges based on dates mentioned in a report ("Next check-up: 15 Sep")

### Later / differentiators
- On-device OCR pre-fill for handwritten prescriptions (harder problem, lower initial accuracy — flag as a known limitation, not a launch promise)
- Abnormal-value alerts ("this reading is outside the typical range — consider discussing at your next visit") — informational only, never diagnostic
- Export a date range as a single PDF for offline sharing

---

## 5. System Architecture

```
┌─────────────┐      photo/PDF       ┌────────────────────┐
│  Mobile App │ ───────────────────▶ │  Upload Service      │
│ (React      │                      │  (signed URL → S3)  │
│  Native)    │                      └──────────┬──────────┘
└─────────────┘                                 │
      ▲                                          ▼
      │                              ┌────────────────────┐
      │                              │  OCR + AI Pipeline  │
      │                              │  (async job queue)  │
      │                              └──────────┬──────────┘
      │                                          ▼
      │                              ┌────────────────────┐
      │        structured result      │  Extraction Result │
      │◀──────────────────────────── │  → MongoDB          │
      │        (push/poll)            └──────────┬──────────┘
      │                                          ▼
      │                              ┌────────────────────┐
      └─────────────────────────────▶│  REST API (Node/    │
        reads: timeline, trends,      │  Express)            │
        hospitals, share links        └────────────────────┘
```

Processing is **asynchronous**: the patient sees "Processing your report…" immediately after capture and gets a push notification/in-app update when the AI pass finishes (typically seconds, not instant) — this keeps the capture flow fast even though OCR+LLM work takes a moment.

---

## 6. AI Pipeline (Capture → Understanding)

```
1. Image/PDF uploaded
        ↓
2. OCR extracts raw text
        ↓
3. LLM structures the text into fields:
     { testName, value, unit, referenceRange, date, hospitalGuess, diagnosis, medication }
        ↓
4. LLM generates a plain-language explanation of the report
        ↓
5. Structured values are matched against the patient's prior readings
   of the same test (if any) → trend delta computed
        ↓
6. Result saved to the visit record; patient notified
```

**Design rule:** the AI explains and organizes — it never diagnoses. Every AI-generated explanation should read like "here's what this measurement generally relates to," never "you have X condition." This is both a safety requirement and a trust requirement — the product's credibility depends on staying clearly on the "translation" side of the line, not the "advice" side.

---

## 7. Data Model

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

// hospitals — first-class entity, not a free-text field
{
  _id: ObjectId,
  userId: ObjectId,
  name: String,
  location: String,
  firstVisitDate: Date,
  lastVisitDate: Date,
  visitCount: Number                // denormalized counter
}

// visits
{
  _id: ObjectId,
  userId: ObjectId,
  hospitalId: ObjectId,             // reference, not text — enables clean hospital-wise grouping
  visitDate: Date,
  doctorName: String,
  reason: String,
  tag: String,                      // 'consultation' | 'lab_test' | 'prescription' | 'vaccination' | 'surgery' | 'other'
  status: String,                   // 'processing' | 'ready' | 'failed'
  attachments: [{
    fileUrl: String,
    fileType: String
  }],
  extractedFields: {                // filled in by the AI pipeline
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

// shareLinks — for doctor handoff
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

`testResults` inside each visit is what powers trend graphs — a query pulling every visit where `testResults.testName == "Blood Sugar"`, sorted by `visitDate`, is the entire trend feature.

---

## 8. Hospital-Wise & Date-Wise Organization

Two views, one dataset — no duplication, just two query paths over `visits`:

| View | Query shape | Use case |
|---|---|---|
| **Timeline** | `find({ userId }).sort({ visitDate: -1 })` | "What's happened to me overall, most recent first" |
| **Hospital-wise** | `find({ userId, hospitalId }).sort({ visitDate: -1 })` | "What's my full history at this specific hospital, before my follow-up there" |

Filters stack on the Timeline: date range **and** hospital **and** tag can all apply at once — "everything from City Hospital, last 6 months, lab tests only" is a single query, not a separate feature to build.

New hospital entries are created automatically the first time a patient logs a visit there (autocomplete against existing hospitals first, to avoid duplicates like "City Hospital" vs. "city hospital").

---

## 9. API Design

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/api/auth/signup` / `/login` | Account access |
| POST | `/api/visits` | Create a visit, returns immediately with `status: processing` |
| POST | `/api/visits/:id/attachments` | Attach a photo/PDF (triggers the AI pipeline) |
| GET | `/api/visits` | Timeline — supports `?from=&to=&hospitalId=&tag=` |
| GET | `/api/visits/:id` | Full visit detail incl. AI explanation and extracted fields |
| GET | `/api/hospitals` | List of hospitals the patient has visited, with visit counts |
| GET | `/api/hospitals/:id/visits` | Hospital-wise visit history |
| GET | `/api/trends/:testName` | Time series of a given test across all visits |
| POST | `/api/care-circle/invite` | Add a family member to the account |
| POST | `/api/share-links` | Generate a doctor-handoff link/QR |
| GET | `/api/share/:token` | Public, read-only view for a valid share link |

---

## 10. Screens & UX Flow

```
Onboarding
   └─ Sign up → optional: add first Care Circle member
        ↓
Home (Timeline)
   ├─ [Scan] button, always one tap away
   ├─ visits grouped by month, hospital badge + tag on each row
   ├─ tab switch → Hospitals view
   └─ tap visit → Visit Detail
                    ├─ AI plain-language summary (shown first, above raw data)
                    ├─ extracted test values + trend sparkline if repeat test
                    ├─ attached photo/PDF (zoomable)
                    └─ [Share this report] → generates handoff link/QR
        ↓
Trends tab
   └─ pick a test → full graph across every hospital, colored by source
        ↓
Care Circle tab
   └─ switch between your timeline and a linked family member's
```

Capture flow specifically:
```
[Scan] → camera opens → snap photo → confirm hospital (autocomplete, or "New hospital")
   → confirm date (defaults to today) → Save
   → "Processing your report…" (async)
   → push notification when ready → tap → Visit Detail with AI summary
```

---

## 11. Modern Design Principles

- **AI summary first, raw data second** — the plain-language explanation is what the patient opens the report for; the numbers and attachment are supporting detail below it, not the headline.
- **Status is always visible** — every processing report shows its state (`processing` / `ready` / `failed`) as a small, persistent badge, never silent.
- **One primary action per screen** — Home's only prominent action is Scan; everything else (search, filters, tabs) is secondary, so the habit-forming action stays the obvious one.
- **Trends are visual, not tabular** — a sparkline next to a test value in Visit Detail, a full graph in the Trends tab; numbers alone don't communicate "getting better/worse" as fast as a line does.
- **Color carries meaning, not decoration** — reserve alert colors strictly for out-of-range values or failed processing; everything else stays neutral so the alerts actually stand out when they matter.

---

## 12. Habit-Forming Mechanics

| Mechanism | How it shows up here |
|---|---|
| **Trigger** | QR code at the hospital counter — the prompt to use the app happens at the moment of the visit, not left to memory later |
| **Action** | One tap to scan — the lowest-friction possible entry point |
| **Variable reward** | The AI summary is different every time and sometimes surfaces something the patient didn't already know (a trend, an out-of-range value) — not a predictable, boring confirmation screen |
| **Investment** | Every report added makes the trend graphs and history more valuable — the more they use it, the more they'd lose by stopping, which is what turns usage into a habit rather than a one-off download |

---

## 13. Growth Loops

1. **Point-of-care acquisition** — QR codes at hospital reception/pharmacy counters turn a routine visit into a new signup, without any ad spend.
2. **Doctor-driven referral** — a doctor who receives a clean handoff link from one patient has a reason to suggest the same app to the next one.
3. **Care Circle referral** — inviting a family member into your Care Circle is itself a signup for them — this is the most emotionally motivated share you can design for (a family member's health, not a generic invite).

---

## 14. Tech Stack

| Layer | Choice | Why |
|---|---|---|
| Mobile app | React Native + Expo | Camera/gallery capture is a first-class use case; matches prior experience |
| Backend | Node.js + Express | Small, focused API surface |
| Database | MongoDB | Visit documents are naturally variable-shaped; nested `testResults` arrays fit a document model well |
| File storage | AWS S3 | Photos/PDFs stored here; MongoDB holds only URLs + extracted metadata |
| OCR | Cloud OCR API (e.g., Google Vision / AWS Textract) | Printed reports first; handwriting accuracy is a known, disclosed limitation |
| AI extraction/explanation | LLM API (e.g., Claude via Anthropic API) | Structuring OCR text into fields and generating the plain-language summary |
| Job processing | Queue (e.g., BullMQ + Redis) | Keeps capture instant while OCR/AI processing happens asynchronously |
| Push notifications | Expo Notifications / FCM | Notify when a scanned report finishes processing |

---

## 15. Roadmap

1. **MVP** — capture, OCR+AI explainer, auto-filing by hospital/date, Timeline + Hospital views, single-test trend graphs.
2. **Growth phase** — Care Circle, doctor handoff links, hospital QR-code partnerships.
3. **Depth phase** — reminders, out-of-range alerts, PDF export, handwriting OCR improvements.
4. **Optional future** — if this ever needs to talk to real hospital systems instead of relying on patient-captured photos, that's exactly the integration [[healthbridge-nepal]]'s FHIR layer was designed for — a deliberate later step, not part of this product's core bet.
