HealthLog 🩺

Your medical history, organized in one place.

HealthLog is a privacy-focused mobile health record platform designed to help people turn scattered medical documents, hospital reports, and health information into a structured, accessible personal health timeline.

Instead of keeping medical history across paper files, phone galleries, messaging apps, and different hospitals, HealthLog aims to give patients a single place to capture, organize, understand, and securely share their health records.

«Your health history should belong to you.»

---

🚀 The Problem

Medical history is often fragmented.

A patient's reports may exist across:

- 📄 Physical hospital documents
- 📸 Photos of medical reports
- 🏥 Different hospitals and clinics
- 💬 Messages and email attachments
- 📁 Unorganized PDF files
- 🧠 Personal memory

This makes it difficult to answer simple but important questions:

- What happened during my previous hospital visit?
- Which hospital performed this test?
- When was this report created?
- What did the report actually say?
- What has changed over time?
- What information should I share with my doctor?

HealthLog is being built to solve this fragmentation.

---

💡 Our Vision

HealthLog aims to become a personal health data layer where individuals can build a longitudinal record of their own medical history.

The long-term vision is:

Medical Documents
       ↓
   HealthLog
       ↓
Structured Health Timeline
       ↓
AI-assisted Understanding
       ↓
Health Trends & Context
       ↓
Secure Sharing
       ↓
Better-informed Conversations with Healthcare Professionals

The goal is not to replace doctors.

The goal is to help patients arrive better prepared.

---

✨ Core Features

📄 Medical Record Capture

Capture medical history directly from your phone.

Planned support includes:

- Scan medical documents
- Upload reports
- Add hospital visits
- Manually record health information
- Organize records by date
- Organize records by hospital
- Maintain a chronological health timeline

---

🤖 AI-Powered Report Explanation

Medical reports can contain terminology that is difficult for non-medical users to understand.

HealthLog is designed to transform report information into plain-language explanations.

Example

Medical report
      ↓
Document processing
      ↓
Relevant information extracted
      ↓
AI-generated explanation
      ↓
Simple language for the patient

The purpose is to improve understanding—not to provide a medical diagnosis.

---

📊 Health Timeline

Instead of treating every medical report as an isolated document, HealthLog is designed around a longitudinal timeline.

Users will be able to see their health history organized around:

- Date
- Hospital
- Visit
- Report
- Medical information
- Trends

This creates a clearer picture of how a person's health history develops over time.

---

🏥 Hospital & Visit Organization

Health records can be associated with specific healthcare visits and hospitals.

This makes it easier to answer:

«"What happened when I visited this hospital?"»

and

«"Show me my records from this period."»

---

📈 Health Trends

HealthLog is planned to transform stored health information into meaningful visual trends.

Potential areas include:

- Measurements over time
- Report history
- Recurring health events
- Hospital visit history
- Longitudinal patterns

The objective is to make health history understandable at a glance.

---

🔐 Privacy & Data Ownership

Health information is extremely sensitive.

HealthLog is being designed around the principle that:

«Patients should have meaningful control over their own health information.»

Privacy considerations include:

- Secure authentication
- Protected API access
- Controlled record access
- Secure sharing workflows
- Minimal exposure of sensitive information
- Privacy-conscious architecture

Security will become increasingly important as HealthLog moves from prototype to production.

---

🤝 Care Circle

A future HealthLog feature is Care Circle.

Care Circle is intended to allow users to securely involve trusted people in their healthcare journey.

Potential use cases include:

- Family members
- Caregivers
- Trusted contacts
- Healthcare professionals

Access should be explicit, controlled, and revocable rather than permanently exposing a patient's entire health history.

---

🔗 Secure Record Sharing

HealthLog is planned to support controlled sharing of selected medical information.

Instead of handing over an entire collection of personal documents, users should be able to share only what is necessary.

The long-term direction includes:

Patient
   │
   ├── Select records
   │
   ├── Define access
   │
   ├── Generate secure share
   │
   ↓
Healthcare Professional

---

🧠 Product Architecture

HealthLog currently follows a mobile + API architecture:

┌───────────────────────────────┐
│       React Native App        │
│            Expo               │
└───────────────┬───────────────┘
                │
                │ REST API
                ↓
┌───────────────────────────────┐
│       Node.js / Express       │
│             API               │
└───────────────┬───────────────┘
                │
                ↓
┌───────────────────────────────┐
│           MongoDB             │
│       Health Data Layer       │
└───────────────────────────────┘

Future components can be added around this foundation, including:

                    ┌───────────────┐
                    │  Mobile App   │
                    └───────┬───────┘
                            │
                            ↓
                    ┌───────────────┐
                    │   API Layer   │
                    └───────┬───────┘
                            │
              ┌─────────────┼─────────────┐
              ↓             ↓             ↓
        ┌──────────┐  ┌──────────┐  ┌──────────┐
        │ Database │  │ AI Layer │  │  Storage │
        └──────────┘  └──────────┘  └──────────┘
              │             │             │
              └─────────────┼─────────────┘
                            ↓
                    ┌───────────────┐
                    │ Health Record │
                    │    System     │
                    └───────────────┘

---

🛠️ Tech Stack

Layer| Technology
Mobile| React Native
Mobile Framework| Expo
Backend| Node.js
API| Express.js
Database| MongoDB
Authentication| JWT
Language| JavaScript / TypeScript
CI| GitHub Actions

The current repository contains separate "mobile" and "api" applications with documentation and CI configuration.

---

📁 Project Structure

HealthLog---App/
│
├── apps/
│   │
│   ├── mobile/
│   │   └── React Native + Expo application
│   │
│   └── api/
│       └── Node.js + Express backend
│
├── docs/
│   ├── Product documentation
│   ├── Developer guide
│   ├── Design specifications
│   └── Phase roadmap
│
├── .github/
│   └── workflows/
│       └── ci.yml
│
├── start.sh
│
└── README.md

The repository currently follows this mobile/API/docs separation.

---

⚙️ Getting Started

Prerequisites

Install:

- Node.js
- npm
- MongoDB
- Expo-compatible development environment
- Expo Go for physical-device testing

---

1. Clone the repository

git clone https://github.com/altafKhan-nep/HealthLog---App.git

cd HealthLog---App

---

🔧 2. Configure the API

cd apps/api

Create your environment file:

cp .env.example .env

Configure the required variables.

At minimum, the current Phase 0 API requires:

MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_secure_jwt_secret

The repository's current documentation identifies "MONGODB_URI" and "JWT_SECRET" as the minimum Phase 0 configuration.

---

📦 3. Install API dependencies

npm install

Start the development server:

npm run dev

The API runs by default on:

http://localhost:4000

Verify the server:

curl http://localhost:4000/health

Expected response:

{
  "status": "ok"
}

---

📱 4. Run the Mobile Application

Open another terminal:

cd apps/mobile

Install dependencies:

npm install

Start Expo:

npx expo start

You can then:

- Scan the QR code with Expo Go
- Press "i" for iOS simulator
- Press "a" for Android emulator

The current mobile client defaults to the local API and can be configured through "API_BASE_URL" when testing against another machine or LAN IP.

---

🧪 Development Workflow

Recommended workflow:

1. Start MongoDB
       ↓
2. Start API
       ↓
3. Verify /health
       ↓
4. Start Expo
       ↓
5. Connect mobile application
       ↓
6. Test authentication
       ↓
7. Develop feature
       ↓
8. Run CI / tests
       ↓
9. Submit PR

---

🗺️ Roadmap

HealthLog is being developed incrementally.

Phase 0 — Foundation

- [x] Repository architecture
- [x] Mobile application scaffold
- [x] API scaffold
- [x] Authentication foundation
- [x] Signup / login
- [x] API health endpoint
- [x] CI foundation

These are the capabilities currently represented in the repository.

Phase 1 — Health Records

- [ ] Patient profiles
- [ ] Hospital records
- [ ] Hospital visits
- [ ] Medical report upload
- [ ] Document organization
- [ ] Health timeline

Phase 2 — AI Understanding

- [ ] Report processing
- [ ] OCR pipeline
- [ ] AI-generated explanations
- [ ] Medical terminology simplification
- [ ] Structured information extraction

Phase 3 — Health Intelligence

- [ ] Health trends
- [ ] Historical comparisons
- [ ] Visual analytics
- [ ] Longitudinal health timeline
- [ ] Personal health insights

Phase 4 — Sharing

- [ ] Secure record sharing
- [ ] Share permissions
- [ ] Expiring access
- [ ] Care Circle
- [ ] Healthcare-provider workflows

Phase 5 — Health Data Infrastructure

Longer-term development may explore:

- Interoperable health records
- Standardized health-data exchange
- Patient-controlled data
- Healthcare-provider integrations
- Secure health-data portability

---

🧭 Product Philosophy

HealthLog follows several principles.

1. Patient-first

The patient should be able to understand and access their own history.

2. Privacy by design

Health information should receive stronger protection than ordinary application data.

3. Explain, don't diagnose

AI should help users understand information while leaving clinical decisions to qualified healthcare professionals.

4. Longitudinal context

A single report is only one point in a person's health history.

5. Interoperability

Health information should eventually be portable rather than trapped inside one application or institution.

6. Human-centered design

Healthcare software should reduce complexity rather than create more of it.

---

⚠️ Medical Disclaimer

HealthLog is a health-record and information-management project.

It is not a medical device, diagnostic system, or substitute for professional medical advice.

AI-generated explanations may contain errors and should not be used to diagnose, treat, or make medical decisions.

Always consult a qualified healthcare professional for medical concerns and clinical decisions.

---

🔒 Security

Health information is highly sensitive.

If you discover a security vulnerability, please do not publicly disclose sensitive details through a GitHub issue.

Instead, contact the maintainer privately and provide enough information to reproduce the issue safely.

Security practices will continue to evolve as HealthLog moves toward production readiness.

---

🤝 Contributing

Contributions are welcome.

If you want to contribute:

# Fork the repository

# Create a branch
git checkout -b feature/your-feature

# Make your changes

# Commit
git commit -m "feat: add your feature"

# Push
git push origin feature/your-feature

Then open a Pull Request.

Before contributing, review the documentation inside:

/docs

The repository contains a developer guide and phased roadmap intended to explain the planned architecture and development direction.

---

📚 Documentation

Detailed product and engineering documentation is available inside:

/docs

Start with:

docs/HealthLog-Developer-Guide.md

The roadmap is documented in:

docs/HealthLog-Phase-Roadmap.md

---

🌍 Why HealthLog Matters

Healthcare information follows a patient throughout life, but the digital representation of that information is often fragmented.

HealthLog explores a different model:

«What if your medical history was something you carried with you—not something scattered across hospitals?»

The long-term vision is a patient-controlled health record that can transform fragmented documents into structured, understandable, and securely shareable health information.

---

👨‍💻 Built By

Mohammad Altaf Khan

BCA Student • Full-Stack Developer • Open-Source Enthusiast

Building HealthLog as an exploration of:

- Healthcare technology
- AI-assisted health information
- Mobile development
- Health-data interoperability
- Privacy-focused software
- Patient-controlled health records

---

⭐ Support the Project

If you find HealthLog interesting:

⭐ Star the repository
🐛 Report bugs
💡 Open feature discussions
🤝 Contribute code
📢 Share the project

Every contribution helps move the project forward.

---

License

License information will be added as the project moves toward its next development phase.