# HealthLog — Google Stitch Design Prompts

> Written for [Google Stitch](https://stitch.withgoogle.com), Google's text-to-UI design tool. Stitch works best when you seed a project with one broad "foundation" prompt (overall app, style, tone), then generate individual screens one at a time inside that same project — rather than one giant prompt describing everything at once. That's how this file is structured: paste the Foundation Prompt first, then work through the Screen Prompts in order, refining each in Stitch's chat before moving to the next.

Note: Stitch's free tier currently allows a generous number of generations per month on its standard model, no credit card required — plenty for iterating through every screen below. Check Stitch's current limits if that matters for your workflow, as free-tier allowances change over time.

---

## How to Use This File

1. Open a new project in Stitch, set **Medium: App** (mobile), and paste the **Foundation Prompt** first.
2. For each screen after that, paste the matching **Screen Prompt** as a new message in the same project — Stitch carries the established style forward automatically.
3. If a screen doesn't come out right, refine with a short follow-up ("make the status badge more prominent," "increase spacing between rows") rather than rewriting the whole prompt — small, incremental edits work better than large rewrites.
4. Do the Add Report wizard steps in order (1 → 5) so Stitch treats them as one connected flow rather than five unrelated screens.

---

## 1. Foundation Prompt (paste first)

```
Design a mobile app called HealthLog — a personal health record app where
patients scan or manually log their own hospital/clinic visit reports, get
an AI-generated plain-language explanation of each report, and see their
health trends over time, organized both by date and by hospital.

Target users include people with low tech confidence, so the whole app
should favor tapping and selecting over typing wherever possible, use
generous spacing, and pair every label with a small icon so meaning
doesn't depend on reading fluency alone.

Visual style: clean, trustworthy, clinical-but-warm — not cold or
sterile. Primary palette: a calm blue/teal as the main brand color on a
white/light-gray background. Reserve color-coded status badges strictly
for meaning: green for "ready," amber for "processing," red only for
errors or out-of-range values — never used decoratively elsewhere.
Typography: one modern, highly legible sans-serif family, a small clear
type scale, rounded-corner cards, soft shadows, comfortable padding.

Platform: mobile app (iOS/Android), portrait orientation, bottom tab
navigation with four tabs: Home, Hospitals, Trends, Care Circle, plus a
prominent floating "+ Add Report" action reachable from Home.
```

---

## 2. Screen Prompts

### 2.1 Onboarding / Sign Up
```
Design the onboarding and sign-up flow for HealthLog. Screen 1: a simple
welcome screen with the app name, a one-line tagline ("Your health
history, organized"), and a single large "Get Started" button — minimal
text, no feature list. Screen 2: sign-up form with just name, email,
password fields (large tappable input fields, clear labels above each
field, no placeholder-only labels), and a "Continue with Google" option
above the manual form. Screen 3: an optional "Add a family member?" step
with a skip option, introducing Care Circle in one short sentence plus
a single "+ Add family member" button.
```

### 2.2 Home / Timeline
```
Design the Home screen for HealthLog: a chronological timeline of visit
reports, newest first, grouped under month headers (e.g. "August 2026").
Each row is a card showing: hospital name with a small hospital icon, a
colored tag badge (Consultation / Lab Test / Prescription / Vaccination /
Surgery), the visit date, and a small thumbnail if a report photo is
attached. Cards with status "processing" show a subtle amber "Processing…"
badge instead of a thumbnail. At the top: a search bar and a filter icon
(opens date range, hospital, and tag filters). A large circular "+"
floating action button bottom-right opens Add Report. Empty state (no
visits yet): a friendly icon illustration and "Add your first report" button.
```

### 2.3 Add Report — Step 1: Select Hospital
```
Design step 1 of a 5-step "Add Report" wizard for HealthLog, shown as a
progress indicator (1 of 5) at the top. Title: "Which hospital or clinic?"
Below it: a search input with a magnifying glass icon, and beneath that a
scrollable list of the patient's previously used hospitals as tappable
rows (hospital icon, name, location, last visit date) — no typing
required to select one. At the bottom of the list: a clearly separated
"+ Add a new hospital or clinic" row that expands into name, type
(Hospital/Clinic toggle), and location fields. Large "Next" button,
disabled until a hospital is selected.
```

### 2.4 Add Report — Step 2: Doctor's Name
```
Design step 2 of 5 of the Add Report wizard (progress indicator showing
2 of 5). Title: "Which doctor did you see? (optional)". Below: a search/
autocomplete input showing doctor names previously logged at the hospital
selected in step 1, as tappable suggestion chips. A visible "Skip this
step" text link, since this field is optional. "Back" and "Next" buttons
at the bottom, "Next" always enabled here since the field is optional.
```

### 2.5 Add Report — Step 3: Date of Visit
```
Design step 3 of 5 of the Add Report wizard (progress indicator 3 of 5).
Title: "When was the visit?" A large calendar date picker fills most of
the screen, with today's date pre-selected and a "Today" quick-select
chip above the calendar for one-tap selection. "Back" and "Next" buttons
at the bottom.
```

### 2.6 Add Report — Step 4: Upload the Report
```
Design step 4 of 5 of the Add Report wizard (progress indicator 4 of 5).
Title: "Add a photo of the report (optional)". Center of screen: one
large, prominent camera-icon button labeled "Take Photo," with a smaller
secondary "Choose from Gallery" button below it. Below both: a visible
"Skip — I'll add this later" link. If a photo has been added, show a
thumbnail preview with a small "Retake" option. "Back" and "Next" buttons
at the bottom.
```

### 2.7 Add Report — Step 5: Confirm & Save
```
Design step 5 of 5 of the Add Report wizard (progress indicator 5 of 5,
all filled). Title: "Review and save". A single summary card showing
everything entered in steps 1-4: hospital name + icon, doctor name (or
"Not specified"), visit date, and the report photo thumbnail (or "No
photo attached"), each row with a small "Edit" link that jumps back to
that step. A large, full-width "Save Report" button at the bottom, and
a secondary "Back" text link above it.
```

### 2.8 Visit Detail
```
Design the Visit Detail screen for HealthLog, opened by tapping a
Timeline card. Header: hospital name, date, and a status badge. First
and most prominent section below the header: a plain-language AI summary
of the report in a highlighted card ("What this report means"), shown
before any raw data. Below that: extracted test values as a simple list
(test name, value, unit, reference range), with a small trend sparkline
icon next to any value that has prior readings. Below that: the attached
photo/PDF as a tappable, zoomable thumbnail. Bottom of screen: a
secondary "Share this report" button with a share/QR icon.
```

### 2.9 Hospitals View
```
Design the Hospitals tab for HealthLog: a list of every hospital/clinic
the patient has visited, each as a card showing the hospital name and
icon, number of visits, and the date of the most recent visit. Tapping
a card opens that hospital's own mini-timeline — the same visit-card
style as Home, but filtered to just that hospital, with a back arrow at
the top labeled with the hospital's name.
```

### 2.10 Trends
```
Design the Trends tab for HealthLog: a dropdown or search field at the
top to pick a test (e.g. "Blood Sugar," "Blood Pressure"), and below it
a clean line graph plotting that test's values over time, with data
points color-coded by which hospital recorded them and a small legend.
Below the graph, a compact list of the individual readings that make up
the graph (date, hospital, value). Empty state for a test with only one
reading: the graph area shows a friendly message that a trend will
appear once there's more than one reading.
```

### 2.11 Care Circle
```
Design the Care Circle tab for HealthLog: at the top, a horizontal row
of circular avatar chips — one for the patient themself (marked "You")
and one per linked family member, plus a "+" chip to add someone new.
Tapping a family member's avatar switches the rest of the screen to
their timeline, using the exact same card layout as the Home screen,
with a small banner at the top clarifying whose records are being
viewed ("Viewing: Mom's health record").
```

---

## 3. Style & Component Reference

Keep this on hand while iterating, to keep every screen consistent:

| Element | Guidance |
|---|---|
| Primary color | Calm blue/teal — used for primary buttons, active tab, and links |
| Status badges | Green = ready, Amber = processing, Red = error/out-of-range only — never decorative |
| Typography | One sans-serif family, small/clear type scale distinct for data rows vs. headings |
| Icons | Every major label pairs with a small icon (hospital, calendar, camera, share) |
| Cards | Rounded corners, soft shadow, generous internal padding |
| Primary actions | One obvious primary button per screen; secondary actions as text links, not competing buttons |
| Navigation | Bottom tab bar (Home, Hospitals, Trends, Care Circle) + floating "+ Add Report" |
