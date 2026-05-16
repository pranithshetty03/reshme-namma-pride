# ರೇಷ್ಮೆ ನಮ್ಮ ಹೆಮ್ಮೆ — Reshme Namma Pride

> A silkworm rearing management web app for Karnataka farmers, built with Next.js 15 and Firebase.

**Live Demo:** _coming soon — deploy link will appear here_

---

## Problem Statement

Silkworm farmers in Karnataka must monitor temperature, humidity, and rearing stages multiple times a day across different batches. Manual record-keeping is error-prone and farmers often miss optimal windows for feeding or intervention. **Reshme Namma Pride** digitizes this workflow with real-time climate logging, AI-powered advice (Gemini), and harvest countdown tracking — accessible from any mobile browser, in both Kannada and English.

---

## Features

- **Multi-batch management** — create, track, and switch between rearing batches
- **Climate logging** — log temperature and humidity per time slot (morning / afternoon / night)
- **Climate dial** — visual SVG dial showing SAFE / CAUTION / DANGER status per instar stage
- **AI advice** — Gemini-powered contextual advice based on current conditions
- **Offline fallback advice** — rule-based advice when internet is unavailable
- **History view** — full timeline of climate readings per batch
- **Onboarding flow** — guided first-run setup
- **Bilingual UI** — Kannada (ಕನ್ನಡ) and English toggle
- **Firebase Auth** — Email/Password and Google Sign-in

---

## Screenshots

| Login | Dashboard | Climate Log |
|---|---|---|
| _(screenshot)_ | _(screenshot)_ | _(screenshot)_ |

| Batches | Advice | History |
|---|---|---|
| _(screenshot)_ | _(screenshot)_ | _(screenshot)_ |

> Add screenshots to a `/docs/screenshots/` folder and update the table above.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Auth | Firebase Authentication |
| Database | Firebase Firestore |
| AI | Gemini REST API (server-side route) |
| State | React useState / useEffect |
| Hosting | Vercel |

---

## Firebase Setup

### 1. Create a Firebase project

1. Go to [console.firebase.google.com](https://console.firebase.google.com)
2. Create a new project
3. Add a **Web app** — copy the config values

### 2. Enable services

- **Authentication** → Sign-in method → enable **Email/Password** and **Google**
- **Firestore Database** → Create in production mode → pick a region near you

### 3. Deploy Firestore security rules

```bash
npm install -g firebase-tools
firebase login
firebase init firestore   # select your project
firebase deploy --only firestore:rules
```

Or paste the contents of `firestore.rules` manually in the Firebase Console → Firestore → Rules tab.

### 4. Configure environment variables

```bash
cp .env.example .env.local
# Edit .env.local and fill in your Firebase config + Gemini API key
```

Get your Gemini API key for free at [aistudio.google.com](https://aistudio.google.com).

---

## Run Locally

```bash
npm install
npm run dev
# Open http://localhost:3000
```

---

## Project Structure

```
src/
├── app/
│   ├── api/advice/route.ts     # Server-side Gemini API call
│   ├── auth/login/page.tsx     # Login / sign-up
│   ├── dashboard/page.tsx      # Home screen with climate dial
│   ├── batches/page.tsx        # Batch CRUD
│   ├── climate/page.tsx        # Climate entry form
│   ├── advice/page.tsx         # Advice log
│   ├── history/page.tsx        # Climate history timeline
│   └── onboarding/page.tsx     # First-run guided setup
├── components/
│   ├── layout/AppLayout.tsx    # Bottom nav + auth guard
│   ├── climate/ClimateDial.tsx # SVG dial (SAFE/CAUTION/DANGER)
│   └── Onboarding.tsx          # Onboarding wizard
├── lib/
│   ├── firebase.ts             # Firebase app init
│   ├── firestore.ts            # Firestore DAOs
│   ├── auth-context.tsx        # React auth context
│   ├── domain.ts               # Pure domain logic (instar stages, climate evaluation)
│   ├── lang-context.tsx        # Language context (Kannada / English)
│   └── translations.ts         # i18n strings
└── types/index.ts              # All TypeScript types
```

---

## Firestore Schema

```
users/{uid}/
  batches/{batchId}               → Batch document
    climateLogs/{logId}           → ClimateLog sub-collection
    adviceLogs/{adviceId}         → AdviceLog sub-collection
```

---

## Instar Stage Reference

| Stage | Temp (°C) | Humidity (%) | Duration |
|---|---|---|---|
| Instar 1 — Newly Hatched | 26–28 | 85–90% | 3 days |
| Instar 2 | 25–27 | 80–85% | 3 days |
| Instar 3 | 24–26 | 75–80% | 4 days |
| Instar 4 — Late Young Age | 23–25 | 70–75% | 5 days |
| Instar 5 — Pre-Spinning | 23–24 | 65–70% | 8 days |

*Source: Karnataka State Sericulture Research & Development Institute (KSRDI)*

---

## Future Improvements

- Push notifications for missed climate readings
- Offline PWA support with service workers
- Export batch data as PDF/CSV report
- Multi-language support for more Indian languages
- Collaborative farm accounts (multiple users per farm)

---

## License

Internal use only · MindMatrix VTU Internship 2025–26
