# HealthLog — Personal Health Record Management Application

## Complete Technical Documentation

**Version:** 0.1.0  
**Date:** August 2026  
**Author:** Mohammad Altaf Khan  
**Institution:** [University Name]  
**Course:** [Course Name / Capstone Project]

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Problem Statement & Motivation](#2-problem-statement--motivation)
3. [Objectives](#3-objectives)
4. [Scope & Limitations](#4-scope--limitations)
5. [User Stories](#5-user-stories)
6. [Functional Requirements](#6-functional-requirements)
7. [Non-Functional Requirements](#7-non-functional-requirements)
8. [System Architecture](#8-system-architecture)
9. [Technology Stack](#9-technology-stack)
10. [Data Models & Schema Design](#10-data-models--schema-design)
11. [API Reference](#11-api-reference)
12. [UI/UX Design & Screen Descriptions](#12-uiux-design--screen-descriptions)
13. [Third-Party Integrations](#13-third-party-integrations)
14. [Security & Privacy](#14-security--privacy)
15. [Testing Strategy](#15-testing-strategy)
16. [Performance Considerations](#16-performance-considerations)
17. [Deployment & DevOps](#17-deployment--devops)
18. [Project Plan & Timeline](#18-project-plan--timeline)
19. [Cost Estimation](#19-cost-estimation)
20. [Risks & Mitigation](#20-risks--mitigation)
21. [Evaluation Metrics](#21-evaluation-metrics)
22. [Installation & Setup Guide](#22-installation--setup-guide)
23. [User Manual](#23-user-manual)
24. [Sample Code Snippets](#24-sample-code-snippets)
25. [Glossary](#25-glossary)
26. [References](#26-references)

---

## 1. Executive Summary

**HealthLog** is a cross-platform mobile application that enables patients to photograph, digitize, and manage hospital visit reports using AI-powered optical character recognition (OCR) and natural language processing (NLP). The application transforms paper-based medical records into structured, searchable, and shareable digital health profiles.

The application addresses the fragmentation of personal health records across multiple hospitals and providers by providing a unified, patient-controlled platform. Users can scan lab reports, prescriptions, and consultation notes; the system extracts key medical data (diagnoses, medications, test results with reference ranges) using Groq AI; and presents health trends over time with visual analytics.

Key differentiators include AI-powered plain-language report summaries, a care circle system for family member access with owner-approved invitations, and one-time-share links for specific reports — all designed with a clinical clarity design system emphasizing readability and trust.

**Target Users:** Patients managing chronic conditions, elderly patients with multiple providers, caregivers managing family health records, and health-conscious individuals seeking longitudinal health tracking.

---

## 2. Problem Statement & Motivation

### The Problem

Patients today receive health records in paper format from multiple hospitals, clinics, and laboratories. These records are:

- **Scattered** across different healthcare providers with no unified view
- **Difficult to interpret** — medical jargon, abbreviations, and lab values lack context
- **Easily lost** — paper records degrade, get misplaced, or are inaccessible during emergencies
- **Hard to share** — transferring records between providers or family members is cumbersome
- **Impossible to track trends** — manual record-keeping makes longitudinal health analysis impractical

### Motivation

According to the World Health Organization, fragmented health records contribute to medical errors, duplicate testing, and delayed diagnoses. Patients with chronic conditions (diabetes, hypertension, heart disease) visit multiple providers and need a consolidated view of their health data. Caregivers managing elderly family members' health face even greater challenges when records are paper-based and分散.

HealthLog solves these problems by creating a digital, AI-enhanced, patient-controlled health record ecosystem.

---

## 3. Objectives

### Primary Objectives

1. **Digitize Paper Records** — Enable photographing and OCR extraction of hospital visit reports
2. **AI-Powered Understanding** — Use Groq AI to extract structured data and generate plain-language summaries
3. **Unified Health Profile** — Consolidate records from multiple hospitals into a single view
4. **Health Trend Visualization** — Track metrics (blood pressure, glucose, cholesterol) over time with charts
5. **Secure Sharing** — Allow controlled sharing via care circles and one-time links

### Secondary Objectives

6. **Offline Resilience** — Graceful handling of network interruptions
7. **Multi-Hospital Support** — 15+ pre-seeded global hospitals plus user-added facilities
8. **Accessibility** — Atkinson Hyperlegible font family for readability
9. **Privacy by Design** — Patient-controlled data with encryption and audit trails

---

## 4. Scope & Limitations

### In Scope

| Feature | Status |
|---------|--------|
| User registration and authentication | ✅ Complete |
| Hospital visit report scanning (camera/gallery) | ✅ Complete |
| PDF document upload and parsing | ✅ Complete |
| AI-powered OCR and data extraction | ✅ Complete |
| Plain-language report summaries | ✅ Complete |
| Health metrics trend visualization | ✅ Complete |
| Care circle with invite code system | ✅ Complete |
| One-time shareable report links | ✅ Complete |
| Hospital management and visit history | ✅ Complete |
| User profile management | ✅ Complete |
| Search and filter across records | ✅ Complete |

### Limitations

- No real-time push notifications (planned for v2)
- No integration with wearable devices (planned for v2)
- No telemedicine/video consultation feature
- No prescription refill reminders
- No insurance claim integration
- Web app only (no native desktop clients)
- Share links are IP-bound to development environment

---

## 5. User Stories

### Epic 1: Authentication & Profile

| ID | As a... | I want to... | So that... | Priority |
|----|---------|-------------|------------|----------|
| US-01 | New user | Create an account with email/password | I can access my health records | High |
| US-02 | Returning user | Log in with my credentials | I can access my data securely | High |
| US-03 | User | Update my profile (name, phone, DOB, gender, blood type) | My records have accurate information | Medium |
| US-04 | User | Upload a profile picture | My care circle can identify me | Low |

### Epic 2: Report Management

| ID | As a... | I want to... | So that... | Priority |
|----|---------|-------------|------------|----------|
| US-05 | Patient | Take a photo of my lab report | It gets digitized automatically | High |
| US-06 | Patient | Upload a PDF of my medical report | I can store it digitally | High |
| US-07 | Patient | Select the hospital and doctor for a report | Records are properly organized | High |
| US-08 | Patient | See an AI-generated summary of my report | I understand my results without medical training | High |
| US-09 | Patient | View extracted test results with reference ranges | I can see if values are normal/high/low | High |
| US-10 | Patient | Search and filter my reports | I can find specific records quickly | Medium |

### Epic 3: Health Trends

| ID | As a... | I want to... | So that... | Priority |
|----|---------|-------------|------------|----------|
| US-11 | Patient | See trend cards for my health metrics | I get an overview of my health status | High |
| US-12 | Patient | View detailed 6-month trend charts | I can track my progress over time | High |
| US-13 | Patient | Compare metrics from different hospitals | I see a consolidated view | Medium |

### Epic 4: Care Circle

| ID | As a... | I want to... | So that... | Priority |
|----|---------|-------------|------------|----------|
| US-14 | Patient | Generate an invite code for my care circle | Family members can request access | High |
| US-15 | Family member | Enter an invite code to join a care circle | I can help manage my parent's health | High |
| US-16 | Patient | Approve or decline join requests | I control who sees my records | High |
| US-17 | Patient | View a family member's health records | I can monitor their health | Medium |
| US-18 | Patient | Remove someone from my care circle | I can revoke access when needed | Medium |

### Epic 5: Sharing

| ID | As a... | I want to... | So that... | Priority |
|----|---------|-------------|------------|----------|
| US-19 | Patient | Generate a one-time share link for a report | A doctor can view my results remotely | High |
| US-20 | Recipient | View a shared report via link | I can see the health data without an account | Medium |

---

## 6. Functional Requirements

### FR-01: User Registration & Authentication
- Users can register with name, email, and password
- Passwords are hashed with bcrypt (10 rounds)
- JWT tokens (7-day expiry) for session management
- Login/logout with token persistence in AsyncStorage

### FR-02: Report Upload & Processing
- Camera capture or gallery selection for images
- PDF document upload via document picker
- Support for JPEG, PNG, PDF formats
- Files uploaded to Cloudinary as base64
- Background AI processing pipeline:
  1. Vision model (Qwen 3.6-27B) for image OCR
  2. Text extraction from PDFs via pdf-parse
  3. GPT-OSS-120B for structured data extraction
  4. GPT-OSS-120B for plain-language summary generation

### FR-03: Data Extraction
- Diagnosis extraction
- Medication extraction
- Test results with: name, value, unit, reference range
- Color-coded status (normal/high/low) based on reference ranges
- Plain-language summary of medical findings

### FR-04: Health Trends
- Summary cards with sparkline mini-charts
- Full-screen detailed trend views with SVG line charts
- Multi-hospital data aggregation with color-coded legends
- Reference range indicators (dashed lines on charts)
- Recent readings list with status badges

### FR-05: Care Circle
- Owner generates invite code (format: `HL-XXXXXXXX`, 1-90 day expiry)
- Shareable URL alongside the code
- Requester enters code → pending request created
- Owner sees pending requests with Accept/Decline buttons
- Approved members can view owner's visit timeline
- Owner can remove members at any time

### FR-06: Report Sharing
- Owner generates one-time link for a specific visit
- Custom expiry (1-168 hours)
- Link marked as "used" after first access
- Public view-only screen (no authentication required)
- Error states for expired/used/invalid links

---

## 7. Non-Functional Requirements

| Requirement | Target | Implementation |
|-------------|--------|----------------|
| **Performance** | API response < 2s | MongoDB indexing, connection pooling |
| **Availability** | 99% uptime | MongoDB Atlas with automatic failover |
| **Scalability** | 1000+ users | Stateless API, horizontal scaling possible |
| **Security** | Industry standard | JWT auth, bcrypt hashing, HTTPS in production |
| **Usability** | Intuitive UI | Material Design 3, Atkinson Hyperlegible font |
| **Accessibility** | WCAG 2.1 AA | High contrast, readable fonts, semantic markup |
| **Data Retention** | Indefinite | User-controlled, no auto-deletion |
| **Offline** | Graceful degradation | Network error handling, cached auth state |

---

## 8. System Architecture

### 8.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────┐
│                    CLIENT LAYER                      │
│  ┌──────────────────────────────────────────────┐   │
│  │          React Native / Expo Mobile App       │   │
│  │   (iOS + Android)                             │   │
│  │   ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐       │   │
│  │   │ Home │ │Hospit│ │Trends│ │ Care │       │   │
│  │   │      │ │ als  │ │      │ │Circle│       │   │
│  │   └──────┘ └──────┘ └──────┘ └──────┘       │   │
│  └──────────────────────────────────────────────┘   │
└─────────────────────┬───────────────────────────────┘
                      │ HTTP/REST
┌─────────────────────▼───────────────────────────────┐
│                   API LAYER                          │
│  ┌──────────────────────────────────────────────┐   │
│  │          Express.js REST API (Node.js)        │   │
│  │   Port: 4000 | Host: 0.0.0.0                 │   │
│  │                                               │   │
│  │   ┌────────┐ ┌────────┐ ┌────────┐          │   │
│  │   │  Auth  │ │ Visits │ │Hospital│          │   │
│  │   │Routes  │ │ Routes │ │ Routes │          │   │
│  │   └────────┘ └────────┘ └────────┘          │   │
│  │   ┌────────┐ ┌────────┐ ┌────────┐          │   │
│  │   │Trends  │ │ShareLnk│ │CareCir.│          │   │
│  │   │ Routes │ │ Routes │ │ Routes │          │   │
│  │   └────────┘ └────────┘ └────────┘          │   │
│  └──────────────────────────────────────────────┘   │
└──────┬──────────────┬──────────────┬────────────────┘
       │              │              │
┌──────▼──────┐ ┌─────▼─────┐ ┌─────▼─────┐
│  MongoDB    │ │ Cloudinary│ │  Groq AI  │
│  Atlas      │ │  (CDN)    │ │  (LLM)   │
│  (Database) │ │           │ │           │
└─────────────┘ └───────────┘ └───────────┘
```

### 8.2 Data Flow: Report Processing

```
User captures photo
        │
        ▼
┌──────────────┐
│  Expo        │
│  ImagePicker │
└──────┬───────┘
       │ base64
       ▼
┌──────────────┐     ┌──────────────┐
│  POST /api/  │────▶│  Cloudinary  │
│  visits      │     │  Upload      │
└──────┬───────┘     └──────────────┘
       │
       ▼
┌──────────────┐
│  Create Visit│
│  (status:    │
│  processing) │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│  Groq Vision │  ← Image OCR
│  (Qwen 3.6)  │
└──────┬───────┘
       │ extracted text
       ▼
┌──────────────┐
│  Groq Text   │  ← Structured extraction
│  (GPT-OSS)   │
└──────┬───────┘
       │ JSON fields
       ▼
┌──────────────┐
│  Groq Text   │  ← Plain-language summary
│  (GPT-OSS)   │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│  Update Visit│
│  (status:    │
│  ready)      │
└──────────────┘
```

### 8.3 Data Flow: Care Circle

```
Owner generates code          Requester enters code
        │                            │
        ▼                            ▼
┌──────────────┐             ┌──────────────┐
│ POST /api/   │             │ POST /api/   │
│ care-circle/ │             │ care-circle/ │
│ generate-code│             │ join         │
└──────┬───────┘             └──────┬───────┘
       │                            │
       ▼                            ▼
┌──────────────┐             ┌──────────────┐
│Create Request│             │Create Request│
│ownerId=self  │             │ownerId=owner │
│status=pending│             │status=pending│
└──────────────┘             └──────────────┘
       │                            │
       └──────────┬─────────────────┘
                  ▼
         ┌──────────────┐
         │ Owner sees   │
         │ pending      │
         │ requests     │
         └──────┬───────┘
                │
         ┌──────▼───────┐
         │ Approve /    │
         │ Decline      │
         └──────┬───────┘
                │ (approve)
                ▼
         ┌──────────────┐
         │ Add to       │
         │ careCircle   │
         │ Members      │
         └──────────────┘
```

---

## 9. Technology Stack

### 9.1 Mobile Frontend

| Technology | Version | Purpose |
|------------|---------|---------|
| React Native | 0.81.5 | Cross-platform mobile framework |
| Expo | SDK 54 | Development toolchain and runtime |
| React | 19.1.0 | UI library |
| TypeScript | ~5.3.3 | Type-safe development |
| React Navigation | 6.x | Screen navigation |
| React Native SVG | 15.x | Trend chart rendering |
| Expo Image Picker | — | Camera and gallery access |
| Expo Document Picker | — | PDF file selection |
| Axios | — | HTTP client |
| AsyncStorage | — | Local token persistence |
| Expo SecureStore | — | Secure credential storage |
| @expo/vector-icons | — | Icon library (Ionicons) |

### 9.2 Backend API

| Technology | Version | Purpose |
|------------|---------|---------|
| Node.js | 18+ | Runtime environment |
| Express.js | 4.19.2 | HTTP server framework |
| TypeScript | 5.5.3 | Type-safe development |
| Mongoose | 8.4.4 | MongoDB ODM |
| MongoDB Atlas | — | Cloud database |
| bcryptjs | — | Password hashing |
| jsonwebtoken | — | JWT authentication |
| pdf-parse | 1.1.1 | PDF text extraction |
| Groq SDK | 0.13.0 | AI model integration |
| Cloudinary SDK | — | File storage |
| dotenv | — | Environment configuration |
| cors | — | Cross-origin resource sharing |

### 9.3 External Services

| Service | Purpose | Free Tier |
|---------|---------|-----------|
| MongoDB Atlas | Database hosting | 512 MB (M0) |
| Cloudinary | Image/PDF storage | 25 GB bandwidth/month |
| Groq Cloud | AI inference (OCR, NLP) | Rate-limited |
| Expo | Mobile app build & OTA | Development builds |

### 9.4 AI Models

| Model | Provider | Use Case |
|-------|----------|----------|
| `qwen/qwen3.6-27b` | Groq | Vision/OCR for image-based reports |
| `openai/gpt-oss-120b` | Groq | Text extraction and plain-language summaries |

**Rationale:** Groq was chosen for its fast inference speeds (critical for mobile UX), generous free tier, and support for both vision and text models. Mongoose was selected over Prisma for its flexible schema evolution during prototyping. Expo was chosen to enable rapid cross-platform development without maintaining separate iOS/Android codebases.

---

## 10. Data Models & Schema Design

### 10.1 User Model

```typescript
interface IUser {
  name: string;                    // Required, display name
  email: string;                   // Required, unique, lowercase, trimmed
  passwordHash: string;            // Required, bcrypt hashed
  careCircleMembers: ObjectId[];   // References to other Users
  profilePicture: string;          // Cloudinary URL
  phone: string;
  dateOfBirth: Date | null;
  gender: string;                  // "male", "female", "other"
  bloodType: string;               // "A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"
  emergencyContact: {
    name: string;
    phone: string;
    relationship: string;
  };
  createdAt: Date;
}
```

### 10.2 Visit Model

```typescript
interface IVisit {
  userId: ObjectId;                // Owner of the record
  hospitalId: ObjectId;            // Reference to Hospital
  visitDate: Date;                 // When the visit occurred
  doctorName: string;              // Provider name
  reason: string;                  // Visit reason
  tag: "consultation" | "lab_test" | "prescription" | "vaccination" | "surgery" | "other";
  status: "processing" | "ready" | "failed";
  entryMethod: "scan" | "manual";
  attachments: [{
    fileUrl: string;               // Cloudinary URL
    fileType: string;              // MIME type
    cloudinaryPublicId: string;    // For deletion
  }];
  extractedFields: {
    diagnosis: string | null;
    medication: string | null;
    plainLanguageSummary: string | null;
    testResults: [{
      testName: string;
      value: number;
      unit: string;
      referenceRange: string;      // e.g. "70-100"
    }];
  };
  createdAt: Date;
  updatedAt: Date;
}
```

### 10.3 Hospital Model

```typescript
interface IHospital {
  userId: ObjectId | null;         // null for global hospitals
  name: string;
  type: "hospital" | "clinic";
  location: string;
  isGlobal: boolean;               // Pre-seeded, visible to all
  firstVisitDate: Date;
  lastVisitDate: Date;
  visitCount: number;
  createdAt: Date;
}
// Compound unique index: { userId, name } for non-global hospitals
```

### 10.4 ShareLink Model

```typescript
interface IShareLink {
  userId: ObjectId;                // Owner
  scope: "all" | "lastNVisits" | "dateRange" | "singleVisit";
  scopeParams: {
    lastN?: number;
    from?: Date;
    to?: Date;
    hospitalId?: ObjectId;
    visitId?: ObjectId;            // For singleVisit scope
  };
  token: string;                   // Unique, random 24-byte hex
  oneTimeUse: boolean;             // Delete after first access
  used: boolean;                   // Tracks if already accessed
  expiresAt: Date;
  createdAt: Date;
}
```

### 10.5 CareCircleRequest Model

```typescript
interface ICareCircleRequest {
  code: string;                    // Short code (e.g., "HL-AB3F7K2X")
  ownerId: ObjectId;               // Whose records are requested
  requesterId: ObjectId;           // Who wants access
  role: string;                    // e.g. "Daughter", "Doctor"
  status: "pending" | "approved" | "declined";
  expiresAt: Date;                 // Code expiry (1-90 days)
  createdAt: Date;
  updatedAt: Date;
}
// Indexes: { code, status }, { ownerId, status }, { ownerId, requesterId, status }
```

### 10.6 Entity Relationship Diagram

```
┌─────────────┐       ┌─────────────────┐       ┌─────────────┐
│    User     │       │     Visit       │       │   Hospital  │
├─────────────┤       ├─────────────────┤       ├─────────────┤
│ _id         │◄──┐   │ _id             │   ┌──►│ _id         │
│ name        │   │   │ userId ─────────┼───┘   │ name        │
│ email       │   │   │ hospitalId ─────┼──────►│ type        │
│ passwordHash│   │   │ visitDate       │       │ location    │
│ careCircle  │   │   │ doctorName      │       │ isGlobal    │
│ Members[] ──┼───┤   │ tag             │       │ visitCount  │
│ profilePic  │   │   │ status          │       └─────────────┘
│ phone       │   │   │ attachments[]   │
│ dateOfBirth │   │   │ extractedFields │
│ gender      │   │   │   .diagnosis    │
│ bloodType   │   │   │   .medication   │
│ emergency   │   │   │   .summary      │
│ Contact     │   │   │   .testResults[]│
└─────────────┘   │   └─────────────────┘
       ▲          │
       │          │   ┌─────────────────┐
       └──────────┤   │  ShareLink      │
                  │   ├─────────────────┤
                  │   │ _id             │
                  │   │ userId ─────────┼──► User
                  │   │ scope           │
                  │   │ token           │
                  │   │ oneTimeUse      │
                  │   │ expiresAt       │
                  │   └─────────────────┘
                  │
                  │   ┌─────────────────┐
                  │   │CareCircleRequest│
                  │   ├─────────────────┤
                  │   │ _id             │
                  └───│ ownerId ────────┼──► User
                      │ requesterId ────┼──► User
                      │ code            │
                      │ status          │
                      │ role            │
                      │ expiresAt       │
                      └─────────────────┘
```

---

## 11. API Reference

### 11.1 Authentication Endpoints

| Method | Endpoint | Body | Response | Auth |
|--------|----------|------|----------|------|
| POST | `/api/auth/signup` | `{ name, email, password }` | `{ token, user }` | No |
| POST | `/api/auth/login` | `{ email, password }` | `{ token, user }` | No |

### 11.2 Visit Endpoints

| Method | Endpoint | Body/Query | Response | Auth |
|--------|----------|-----------|----------|------|
| POST | `/api/visits` | `multipart: hospitalId, visitDate, ...` | `{ visit }` | Yes |
| GET | `/api/visits` | `?tag=&status=` | `[visits]` | Yes |
| GET | `/api/visits/:id` | — | `{ visit }` | Yes |
| PUT | `/api/visits/:id` | `{ hospitalId, ... }` | `{ visit }` | Yes |
| DELETE | `/api/visits/:id` | — | `{ message }` | Yes |

### 11.3 Hospital Endpoints

| Method | Endpoint | Response | Auth |
|--------|----------|----------|------|
| GET | `/api/hospitals` | `[hospitals]` | Yes |
| GET | `/api/hospitals/visited` | `[hospitals with visitCount]` | Yes |
| POST | `/api/hospitals` | `{ hospital }` | Yes |
| GET | `/api/hospitals/:id/visits` | `{ visits }` | Yes |

### 11.4 Care Circle Endpoints

| Method | Endpoint | Body | Response | Auth |
|--------|----------|------|----------|------|
| GET | `/api/care-circle` | — | `[members]` | Yes |
| POST | `/api/care-circle/generate-code` | `{ expiresInDays, role }` | `{ code, shareUrl }` | Yes |
| POST | `/api/care-circle/join` | `{ code }` | `{ message, ownerName }` | Yes |
| GET | `/api/care-circle/requests` | — | `[pendingRequests]` | Yes |
| POST | `/api/care-circle/requests/:id/approve` | — | `{ message }` | Yes |
| POST | `/api/care-circle/requests/:id/decline` | — | `{ message }` | Yes |
| DELETE | `/api/care-circle/:memberId` | — | `{ message }` | Yes |

### 11.5 Share Link Endpoints

| Method | Endpoint | Body | Response | Auth |
|--------|----------|------|----------|------|
| POST | `/api/share-links` | `{ scope, scopeParams, expiresInDays }` | `{ shareUrl }` | Yes |
| POST | `/api/share-links/visit` | `{ visitId, expiresInHours }` | `{ shareUrl }` | Yes |
| GET | `/api/share-links` | — | `[links]` | Yes |
| DELETE | `/api/share-links/:id` | — | `{ message }` | Yes |
| GET | `/api/share-links/public/:token` | — | `{ visits }` | No |

### 11.6 Trends Endpoints

| Method | Endpoint | Response | Auth |
|--------|----------|----------|------|
| GET | `/api/trends` | `[{ name, count }]` | Yes |
| GET | `/api/trends/summary` | `[trendSummaries]` | Yes |
| GET | `/api/trends/:testName` | `[trendPoints]` | Yes |

### 11.7 User Endpoints

| Method | Endpoint | Body | Response | Auth |
|--------|----------|------|----------|------|
| GET | `/api/user/profile` | — | `{ user }` | Yes |
| PUT | `/api/user/profile` | `{ name, phone, ... }` | `{ user }` | Yes |
| POST | `/api/user/picture` | `{ picture }` | `{ url }` | Yes |

---

## 12. UI/UX Design & Screen Descriptions

### 12.1 Design System

**Color Palette:**
| Token | Hex | Usage |
|-------|-----|-------|
| Primary | `#1B7A8C` | Buttons, links, accents |
| Primary Dark | `#125A67` | Pressed states |
| Primary Light | `#E8F4F6` | Backgrounds, tags |
| Background | `#F4F8FA` | Screen background |
| Surface | `#FFFFFF` | Cards, modals |
| Text Primary | `#12242B` | Headings, body text |
| Text Secondary | `#5B6E75` | Captions, labels |
| Status Ready | `#2E9E5B` | Success, completed |
| Status Processing | `#D89B2A` | In-progress states |
| Status Error | `#C9483C` | Errors, high values |

**Typography:** Atkinson Hyperlegible Next (accessibility-optimized)
| Style | Size | Weight | Usage |
|-------|------|--------|-------|
| Heading | 24px | 700 | Screen titles |
| Subheading | 18px | 600 | Section titles |
| Body | 16px | 400 | Main content |
| Body Medium | 16px | 500 | Emphasized text |
| Caption | 13px | 400 | Labels, metadata |
| Label | 14px | 600 | Section headers |
| Button | 16px | 600 | CTA text |

**Spacing Scale:** 4 / 8 / 16 / 24 / 32 / 48px  
**Border Radius:** 8 / 16 / 24 / 999px  
**Shadows:** sm (elevation 2), md (elevation 4), lg (elevation 8)

### 12.2 Screen Descriptions

#### Welcome Screen
- HealthLog logo and branding
- "Your health records, beautifully organized" tagline
- "Get Started" CTA button → SignUp
- "Already have an account? Log In" link → Login

#### Login Screen
- Email and password inputs
- "Log In" button with loading state
- "Don't have an account? Sign Up" link
- Error display for invalid credentials

#### Sign Up Screen
- Name, email, password inputs
- "Create Account" button with loading state
- "Already have an account? Log In" link
- Validation error display

#### Home / Timeline Screen
- **Header:** Clickable avatar (→ Profile) + notification bell
- **Latest Insights:** AI-generated health summary card
- **Search & Filter:** Full-text search + tag/status filter modal
- **Visit Cards:** Hospital icon, doctor name, tag badge, status chip, date
- **Month Headers:** "October 2023", "September 2023"
- **FAB:** Floating "+" button → Add Report flow
- **Empty State:** Illustration + "Add Your First Report" CTA

#### Hospitals Screen
- **Header:** Clickable avatar + bell
- **Find Provider Card:** Browse connected facilities
- **Hospital Cards:** Icon, name, record count, last visit, chevron
- **Hospital Detail View:** Back button, header with name/location, month-grouped visit cards
- **Visit Cards:** Provider icon, doctor name, tag, date/time badge, description, status chips

#### Trends Screen
- **Header:** "My Trends" with trending-up icon
- **Trend Cards:** Icon, metric name, status badge, large value, unit, sparkline chart
- **Detail View:** Metric dropdown selector, 6-month trend card with SVG line chart, reference range lines, hospital color legend, recent readings list
- **Empty State:** "More Data Needed" card with "Add Reading" CTA

#### Care Circle Screen
- **Header:** Clickable avatar + bell
- **Pending Requests:** Badge count, requester cards with Accept/Decline buttons
- **Description Card:** People icon, "Manage who has access..." text
- **Invite Code Section:** Generate button → code card with Copy/Share actions
- **Active Members:** Avatar, name, role, lock icon, remove button
- **Join Link:** "Join a Care Circle" → code input modal
- **Security Notice:** Shield icon + "Your data is secure and encrypted"
- **Member View:** Viewing banner, avatar row, member's visit timeline

#### Add Report Flow (5 Steps)
1. **Step 1 — Hospital:** Search + select hospital, add new option
2. **Step 2 — Doctor:** Optional doctor name input
3. **Step 3 — Date:** Calendar date picker
4. **Step 4 — Upload:** Camera/gallery/PDF picker with preview
5. **Step 5 — Confirm:** Review summary, submit with loading state

#### Visit Detail Screen
- Hospital name + medical icon
- Date, status badge (Reviewed/Processing), tag badge
- AI summary card (teal left border)
- Test results with color-coded values (green/red/yellow)
- Diagnosis and medication sections
- Attached documents (image thumbnails)
- Share button → share modal with expiry selector

#### Profile Screen
- Profile picture (tap to change)
- Editable fields: name, phone, DOB, gender, blood type, emergency contact
- Save button with loading state
- Logout button

#### Shared Report Screen (Public)
- "Shared Health Report" banner
- Visit data in read-only format
- Error states for expired/used links
- Footer: "This is a one-time shared report from HealthLog"

---

## 13. Third-Party Integrations

### 13.1 Groq AI (Natural Language Processing)

**Integration:** REST API via `groq-sdk` npm package

**Endpoints Used:**
- Vision model (`qwen/qwen3.6-27b`): Image-to-text OCR for handwritten/printed reports
- Text model (`openai/gpt-oss-120b`): Structured data extraction and summary generation

**Extraction Pipeline:**
```
Input Image → Vision OCR → Raw Text → Structured Extraction → Plain Language Summary
                                          ↓
                                    { diagnosis, medication,
                                      testResults[], summary }
```

**Error Handling:** Graceful degradation — if AI fails, visit is saved with `status: "failed"` and raw attachments are still accessible.

### 13.2 Cloudinary (File Storage)

**Integration:** REST API via `cloudinary` npm package

**Usage:**
- Base64 image upload for camera captures
- PDF document storage
- Automatic URL generation for display
- Secure URL signing for share links

**Configuration:**
```
Cloud Name: aho9q74v
API Key: 975955636215731
API Secret: id8g0wupPKHS_nU6518JJu-_n9g
```

### 13.3 MongoDB Atlas (Database)

**Integration:** Mongoose ODM via `mongodb+srv` connection string

**Configuration:**
```
Cluster: cluster0.t3ieyvz.mongodb.net
Database: healthlog
User: mohammadaltafkhan106_db_user
```

**Features Used:**
- Automatic failover (replica set)
- Connection pooling
- Index management
- Atlas Search (planned)

### 13.4 Expo (Development Platform)

**Integration:** Expo SDK 54 runtime

**Services Used:**
- Expo Go (development client)
- Expo Image Picker (camera/gallery)
- Expo Document Picker (PDF files)
- Expo SecureStore (secure storage)
- Expo Router (planned migration)

---

## 14. Security & Privacy

### 14.1 Authentication & Authorization

| Mechanism | Implementation |
|-----------|---------------|
| Password Storage | bcrypt with 10 salt rounds |
| Session Management | JWT tokens (7-day expiry) |
| Token Storage | React Native AsyncStorage |
| API Authorization | Bearer token in Authorization header |
| Route Protection | `requireAuth` middleware on all private endpoints |

### 14.2 Data Protection

| Measure | Details |
|---------|---------|
| Transit Encryption | HTTPS (production), HTTP (development only) |
| Database Encryption | MongoDB Atlas encryption at rest |
| File Storage | Cloudinary secure URLs |
| Input Validation | Server-side validation on all endpoints |
| SQL Injection | N/A (NoSQL with Mongoose parameterized queries) |
| XSS Prevention | React auto-escaping, no raw HTML rendering |
| CORS | Configured for cross-origin requests |

### 14.3 Care Circle Security

- Owner-generated invite codes (not email-based lookup)
- Custom expiry on all invite codes (1-90 days)
- Owner approval required for all join requests
- One-time-use share links
- Share link expiry (1-168 hours)
- No persistent access for shared links

### 14.4 Privacy Compliance

- **Data Minimization:** Only necessary health data is collected
- **User Control:** Users can delete their data and revoke sharing
- **No Third-Party Analytics:** No tracking or advertising SDKs
- **No Data Selling:** User data is never shared or sold
- **Access Logging:** Care circle access is tracked via status fields

---

## 15. Testing Strategy

### 15.1 Testing Levels

| Level | Tool | Coverage |
|-------|------|----------|
| Unit Testing | Jest + React Native Testing Library | Components, utilities |
| Integration Testing | Supertest | API endpoints |
| E2E Testing | Detox | Critical user flows |
| Manual Testing | Device testing | UI/UX validation |

### 15.2 Critical Test Scenarios

1. **Authentication Flow:** Registration → Login → Token persistence → Logout
2. **Report Upload:** Camera capture → AI processing → Data extraction → Display
3. **Care Circle:** Generate code → Join → Approve → View timeline → Remove
4. **Share Link:** Generate → Access → One-time-use validation → Expiry
5. **Trends:** Data aggregation → Chart rendering → Detail view → Hospital comparison

### 15.3 Test Data

```typescript
// Seed Users
{ email: "altaf@test.com", password: "password123", name: "Altaf Khan" }
{ email: "sita@test.com", password: "password123", name: "Sita Devi" }

// Seed Hospitals (15 global)
City General Hospital, North Hills Medical, Metro Health Center, etc.
```

---

## 16. Performance Considerations

### 16.1 Mobile App

| Optimization | Implementation |
|-------------|----------------|
| Image Compression | 70% quality for uploads, thumbnail generation |
| Lazy Loading | FlatList for visit lists (virtualized) |
| Caching | AsyncStorage for auth tokens |
| Bundle Size | Tree shaking, Expo managed workflow |
| Animation | Native driver for smooth transitions |

### 16.2 API Server

| Optimization | Implementation |
|-------------|----------------|
| Database Indexing | Indexes on userId, visitDate, status fields |
| Connection Pooling | Mongoose connection reuse |
| Response Pagination | Limit/skip for large datasets |
| Payload Size | 50MB limit for base64 uploads |
| Query Optimization | Select only needed fields with `.select()` |

### 16.3 Database

| Optimization | Implementation |
|-------------|----------------|
| Compound Indexes | (userId, visitDate), (ownerId, status) |
| TTL Indexes | Share link expiry via expiresAt |
| Text Search | MongoDB text index on visit fields |
| Connection Heartbeat | 10-second keepalive to prevent timeout |

---

## 17. Deployment & DevOps

### 17.1 Development Environment

```
API Server:    http://localhost:4000 (development)
Mobile Client: Expo Go on physical device / emulator
Database:      MongoDB Atlas (cloud)
```

### 17.2 Production Deployment Plan

| Component | Service | Notes |
|-----------|---------|-------|
| API | Render / Railway / AWS ECS | Container-based deployment |
| Database | MongoDB Atlas (M10+) | Dedicated cluster |
| File Storage | Cloudinary (Pro plan) | Custom domain, watermark removal |
| Mobile App | Expo Application Services (EAS) | Build and submit to stores |
| Domain | Custom domain with SSL | HTTPS enforcement |

### 17.3 CI/CD Pipeline

```
Code Push → GitHub Actions
    ├── Lint & Type Check
    ├── Unit Tests
    ├── Build API (Docker)
    ├── Build Mobile (EAS)
    ├── Deploy API to staging
    └── Deploy API to production (manual approval)
```

### 17.4 Environment Variables

```env
PORT=4000
MONGODB_URI=mongodb+srv://...
JWT_SECRET=healthlog-dev-secret-key
CLOUDINARY_CLOUD_NAME=aho9q74v
CLOUDINARY_API_KEY=975955636215731
CLOUDINARY_API_SECRET=id8g0wupPKHS_...
GROQ_API_KEY=gsk_uB7x27hiHNZ4SadDfsVfW...
```

---

## 18. Project Plan & Timeline

### 18.1 Development Phases

| Phase | Duration | Deliverables |
|-------|----------|-------------|
| **Phase 1: Foundation** | Week 1-2 | Project setup, auth system, database models |
| **Phase 2: Core Features** | Week 3-5 | Report upload, AI pipeline, visit management |
| **Phase 3: Sharing** | Week 6-7 | Care circle, share links, public viewing |
| **Phase 4: Trends** | Week 8 | Health metrics aggregation, chart rendering |
| **Phase 5: Polish** | Week 9-10 | UI refinement, error handling, testing |
| **Phase 6: Documentation** | Week 11-12 | Technical docs, user manual, presentation |

### 18.2 Milestones

| Milestone | Date | Status |
|-----------|------|--------|
| Project kickoff | Week 1 | ✅ |
| Auth system working | Week 2 | ✅ |
| Report upload + AI extraction | Week 5 | ✅ |
| Care circle system | Week 7 | ✅ |
| Health trends | Week 8 | ✅ |
| One-time share links | Week 9 | ✅ |
| UI polish + bug fixes | Week 10 | ✅ |
| Documentation complete | Week 12 | ✅ |

---

## 19. Cost Estimation

### 19.1 Development Costs (Student Project)

| Item | Cost | Notes |
|------|------|-------|
| Developer Time | $0 | Student project |
| Laptop/Development Machine | $0 | Existing equipment |
| MongoDB Atlas | $0 | Free M0 tier |
| Cloudinary | $0 | Free tier (25GB) |
| Groq API | $0 | Free tier (rate limited) |
| Expo | $0 | Free tier |
| GitHub | $0 | Free for students |
| **Total** | **$0** | All free tiers |

### 19.2 Production Cost Projection (1000 Users)

| Service | Monthly Cost |
|---------|-------------|
| MongoDB Atlas M10 | $57 |
| Cloudinary Plus | $89 |
| Groq (pay-per-use) | ~$50 |
| Expo Pro | $20 |
| Render Pro | $20 |
| Domain + SSL | $15 |
| **Total** | **~$251/month** |

---

## 20. Risks & Mitigation

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| AI extraction errors | High | Medium | Manual override, confidence scores, status flags |
| MongoDB connection drops | Medium | High | Heartbeat config, reconnection logic, retry |
| IP address changes | High | Low | Use tunnel mode for dev, fixed IPs in prod |
| Data loss | Low | Critical | Atlas backups, versioned snapshots |
| Security breach | Low | Critical | JWT expiry, bcrypt, input validation |
| API rate limiting | Medium | Medium | Request queuing, graceful degradation |
| Device compatibility | Low | Medium | Expo managed workflow handles it |
| Groq API downtime | Low | Medium | Fallback to manual entry, retry logic |

---

## 21. Evaluation Metrics

### 21.1 Technical Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| API Response Time | < 2 seconds | Server logs |
| AI Processing Time | < 30 seconds | Processing pipeline |
| App Launch Time | < 3 seconds | Expo performance |
| Crash Rate | < 1% | Expo crash reports |
| Test Coverage | > 80% | Jest coverage |

### 21.2 User Experience Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Task Completion Rate | > 90% | User testing |
| Time to Upload Report | < 60 seconds | User testing |
| User Satisfaction | > 4/5 | Survey |
| Feature Adoption | > 70% | Analytics |

### 21.3 Academic Assessment Criteria

| Criterion | Weight | Evidence |
|-----------|--------|----------|
| Technical Implementation | 30% | Working app, clean code, proper architecture |
| AI Integration | 20% | Groq pipeline, extraction accuracy |
| UI/UX Design | 15% | Design system, accessibility, polish |
| Documentation | 15% | This document, README, code comments |
| Innovation | 10% | Care circle, one-time links, trends |
| Testing & Quality | 10% | Test coverage, error handling |

---

## 22. Installation & Setup Guide

### 22.1 Prerequisites

```bash
# Required
Node.js >= 18.x
npm >= 9.x
Expo CLI: npm install -g expo-cli
Git

# For Android development
Android Studio + SDK
ADB (Android Debug Bridge)

# For iOS development (macOS only)
Xcode >= 14
CocoaPods
```

### 22.2 Clone & Install

```bash
# Clone repository
git clone https://github.com/[username]/healthlog.git
cd healthlog

# Install API dependencies
cd apps/api
npm install

# Install Mobile dependencies
cd ../mobile
npm install
```

### 22.3 Configure Environment

```bash
# API environment
cd apps/api
cp .env.example .env
# Edit .env with your credentials

# Mobile environment
cd ../mobile
# Edit src/api/client.ts with your LAN IP
```

### 22.4 Start Development

```bash
# Terminal 1: Start API
cd apps/api
npm run dev

# Terminal 2: Start Mobile
cd apps/mobile
npx expo start --clear
```

### 22.5 Seed Database

```bash
cd apps/api
npx ts-node src/seed.ts
```

### 22.6 Run on Device

```bash
# Android
npx expo start --android

# iOS (macOS only)
npx expo start --ios

# Physical device
# Install Expo Go from App Store / Play Store
# Scan QR code from terminal
```

---

## 23. User Manual

### 23.1 Getting Started

1. **Install Expo Go** from the App Store (iOS) or Play Store (Android)
2. **Open the app** by scanning the QR code shown in the terminal
3. **Create an account** with your name, email, and password
4. **Start adding reports** by tapping the "+" button on the Home screen

### 23.2 Uploading a Report

1. Tap the **"+"** floating action button on the Home screen
2. **Step 1:** Select the hospital or clinic where you visited
3. **Step 2:** Enter the doctor's name (optional)
4. **Step 3:** Pick the date of the visit
5. **Step 4:** Take a photo or select from gallery, or upload a PDF
6. **Step 5:** Review the extracted data and tap **"Save Report"**
7. Wait for AI processing (status changes from "Processing" to "Reviewed")

### 23.3 Viewing Health Trends

1. Tap the **"Trends"** tab in the bottom navigation
2. View your health metric cards with sparkline charts
3. Tap any card to see the detailed 6-month trend
4. Use the dropdown to switch between different metrics
5. View recent readings with color-coded status badges

### 23.4 Setting Up a Care Circle

1. Go to the **"Care Circle"** tab
2. Tap **"Generate Invite Code"**
3. Choose how long the code should be valid (1-90 days)
4. **Share the code** with family members via text, WhatsApp, etc.
5. When they join, **approve their request** in the Pending Requests section
6. You can now view each other's health records

### 23.5 Joining a Care Circle

1. Get the invite code from your family member
2. Go to the **"Care Circle"** tab
3. Tap **"Join a Care Circle"** at the bottom
4. Enter the code and tap **"Join Circle"**
5. Wait for the owner to approve your request

### 23.6 Sharing a Report

1. Open any visit detail from the Home or Hospitals screen
2. Tap **"Share this report"** at the bottom
3. Choose how long the link should be valid (1-72 hours)
4. Tap **"Generate Share Link"**
5. **Copy or share** the link with your doctor or anyone

### 23.7 Managing Your Profile

1. Tap your **avatar** in the top-right corner of any screen
2. Edit your personal information
3. Upload a profile picture
4. Tap **"Save Changes"**

---

## 24. Sample Code Snippets

### 24.1 AI Extraction Pipeline

```typescript
// apps/api/src/config/groq.ts
import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function extractReportFields(text: string) {
  const response = await groq.chat.completions.create({
    model: "openai/gpt-oss-120b",
    messages: [
      {
        role: "system",
        content: `Extract medical data from the report text. Return JSON:
        {
          "diagnosis": "string or null",
          "medication": "string or null",
          "testResults": [{
            "testName": "string",
            "value": number,
            "unit": "string",
            "referenceRange": "string"
          }]
        }`
      },
      { role: "user", content: text }
    ],
    temperature: 0.1,
    response_format: { type: "json_object" }
  });

  return JSON.parse(response.choices[0].message.content || "{}");
}
```

### 24.2 JWT Authentication Middleware

```typescript
// apps/api/src/middleware/requireAuth.ts
import jwt from "jsonwebtoken";

export function requireAuth(req: AuthedRequest, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Missing Authorization header" });
  }

  const token = header.replace("Bearer ", "");
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET) as { sub: string };
    req.userId = payload.sub;
    next();
  } catch {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}
```

### 24.3 Care Circle Invite Code Generation

```typescript
// apps/api/src/careCircle/careCircle.controller.ts
function generateCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "HL-";
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}
```

### 24.4 Health Metric Status Determination

```typescript
// apps/mobile/src/screens/Trends/TrendsScreen.tsx
function getStatus(value: number, referenceRange: string) {
  if (!referenceRange) return { label: "Unknown", color: "#5B6E75" };
  const [min, max] = referenceRange.split("-").map(Number);
  if (isNaN(min) || isNaN(max)) return { label: "Unknown", color: "#5B6E75" };

  if (value >= min && value <= max)
    return { label: "Normal", color: "#2E9E5B" };
  if (value < min)
    return { label: "Low", color: "#D89B2A" };
  return { label: "High", color: "#C9483C" };
}
```

### 24.5 One-Time Share Link Creation

```typescript
// apps/api/src/shareLinks/shareLinks.controller.ts
export async function createVisitShareLink(req: AuthedRequest, res: Response) {
  const { visitId, expiresInHours } = req.body;
  const hours = Math.min(Math.max(Number(expiresInHours) || 24, 1), 168);
  const token = randomBytes(24).toString("hex");
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + hours);

  const link = await ShareLink.create({
    userId: req.userId,
    scope: "singleVisit",
    scopeParams: { visitId },
    token,
    oneTimeUse: true,
    used: false,
    expiresAt,
  });

  return res.status(201).json({
    shareUrl: `http://192.168.254.4:4000/share/report/${token}`,
    token,
    expiresAt,
  });
}
```

---

## 25. Glossary

| Term | Definition |
|------|-----------|
| **OCR** | Optical Character Recognition — extracting text from images |
| **NLP** | Natural Language Processing — understanding and generating human language |
| **JWT** | JSON Web Token — a compact, URL-safe token for authentication |
| **ODM** | Object Document Mapper — Mongoose's abstraction over MongoDB |
| **CDN** | Content Delivery Network — Cloudinary's distributed file serving |
| **OTA** | Over-The-Air updates — Expo's mechanism for pushing JS updates |
| **FlatList** | React Native's virtualized list component for performance |
| **Sparkline** | A small, word-sized chart showing a trend |
| **Care Circle** | A group of trusted people who can view health records |
| **Reference Range** | The normal range for a medical test result |

---

## 26. References

1. React Native Documentation. https://reactnative.dev/docs
2. Expo SDK Documentation. https://docs.expo.dev/
3. Express.js Documentation. https://expressjs.com/
4. Mongoose Documentation. https://mongoosejs.com/docs/
5. Groq API Documentation. https://console.groq.com/docs
6. Cloudinary Documentation. https://cloudinary.com/documentation
7. MongoDB Atlas Documentation. https://www.mongodb.com/docs/atlas/
8. JWT Introduction. https://jwt.io/introduction
9. Material Design 3. https://m3.material.io/
10. Atkinson Hyperlegible Font. https://brailleinstitute.org/freefont

---

## Appendix A: Project File Structure

```
healthlog/
├── apps/
│   ├── api/                          # Backend API
│   │   ├── src/
│   │   │   ├── index.ts              # Express server entry
│   │   │   ├── seed.ts               # Database seeder
│   │   │   ├── config/
│   │   │   │   ├── db.ts             # MongoDB connection
│   │   │   │   ├── groq.ts           # Groq AI integration
│   │   │   │   └── cloudinary.ts     # Cloudinary config
│   │   │   ├── middleware/
│   │   │   │   └── requireAuth.ts    # JWT auth middleware
│   │   │   ├── auth/                 # Authentication module
│   │   │   │   ├── auth.model.ts
│   │   │   │   ├── auth.controller.ts
│   │   │   │   └── auth.routes.ts
│   │   │   ├── user/                 # User profile module
│   │   │   ├── hospitals/            # Hospital management
│   │   │   ├── visits/               # Visit records
│   │   │   ├── trends/               # Health trends
│   │   │   ├── shareLinks/           # Report sharing
│   │   │   └── careCircle/           # Care circle management
│   │   ├── .env
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   └── mobile/                       # React Native Mobile App
│       ├── App.tsx                   # App entry point
│       ├── app.json                  # Expo configuration
│       ├── src/
│       │   ├── api/
│       │   │   └── client.ts         # Axios API client
│       │   ├── context/
│       │   │   └── AuthContext.tsx    # Authentication state
│       │   ├── navigation/
│       │   │   └── AppNavigator.tsx   # Screen navigation
│       │   ├── theme/
│       │   │   └── tokens.ts         # Design system tokens
│       │   ├── components/           # 9 reusable components
│       │   │   ├── Avatar.tsx
│       │   │   ├── Badge.tsx
│       │   │   ├── Button.tsx
│       │   │   ├── EmptyState.tsx
│       │   │   ├── Input.tsx
│       │   │   ├── ProgressBar.tsx
│       │   │   ├── ScreenHeader.tsx
│       │   │   └── TrendCard.tsx
│       │   └── screens/              # 12 screens
│       │       ├── Onboarding/       # Welcome, Login, SignUp
│       │       ├── Home/             # Timeline
│       │       ├── Hospitals/        # Hospital list + detail
│       │       ├── Trends/           # Health trends
│       │       ├── CareCircle/       # Care circle management
│       │       ├── AddReport/        # 5-step upload wizard
│       │       ├── VisitDetail/      # Report detail view
│       │       ├── Profile/          # User profile
│       │       └── SharedReport/     # Public report viewer
│       ├── package.json
│       └── tsconfig.json
│
└── docs/                             # Documentation
    ├── HealthLog-Stitch-Design-Prompts.md
    ├── HealthLog-Product-Design.md
    ├── HealthLog-Phase-Roadmap.md
    └── stitch_healthlog_patient_record_app/
        ├── welcome_healthlog/
        ├── sign_up_healthlog/
        ├── home_healthlog/
        ├── trends_healthlog_1/
        ├── trends_healthlog_2/
        ├── care_circle_healthlog_1/
        ├── care_circle_healthlog_2/
        └── clinical_clarity/
            └── DESIGN.md
```

---

## Appendix B: Seed Data

### Hospitals (15 Global)

| Name | Type | Location |
|------|------|----------|
| City General Hospital | Hospital | Downtown |
| North Hills Medical Center | Hospital | North District |
| Metro Health Clinic | Clinic | Central Area |
| Westside Community Hospital | Hospital | West End |
| Eastview Medical Plaza | Hospital | East Side |
| St. Mary's Hospital | Hospital | Midtown |
| Riverside Health Center | Clinic | Riverside |
| Oakwood Medical Center | Hospital | Oakwood |
| Pacific Coast Hospital | Hospital | Coastal District |
| Summit Health Clinic | Clinic | Hillcrest |
| Valley Medical Center | Hospital | Valley |
| Harbor View Hospital | Hospital | Harbor |
| Lakewood Health Plaza | Clinic | Lakewood |
| Central Valley Medical | Hospital | Central Valley |
| Greenfield Community Hospital | Hospital | Greenfield |

### Test Users

| Name | Email | Password |
|------|-------|----------|
| Altaf Khan | altaf@test.com | password123 |
| Sita Devi | sita@test.com | password123 |

---

**Document Version:** 1.0  
**Last Updated:** August 22, 2026  
**Total Source Files:** 53 (28 mobile + 25 API)  
**Total Lines of Code:** ~6,500+
