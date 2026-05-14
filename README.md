# ರೇಷ್ಮೆ ನಮ್ಮ ಹೆಮ್ಮೆ — Reshme-Namma Pride (Web)

> **Next.js 15 + Firebase port** of the original Kotlin/Android silkworm rearing app.

---

## Tech Stack

| Layer | Android (original) | Web (this project) |
|---|---|---|
| Language | Kotlin | TypeScript |
| UI | Jetpack Compose / Fragments | Next.js 15 (App Router) |
| Auth | — | Firebase Authentication |
| Database | Room (SQLite, local) | Firebase Firestore (cloud) |
| Background jobs | WorkManager | — (browser notifications TBD) |
| AI | Gemini SDK (client-side) | Gemini REST API (server-side route) |
| State | ViewModel + StateFlow | React useState / useEffect |
| DI | Hilt | — (direct imports) |

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
│   ├── dashboard/page.tsx      # Home screen (mirrors HomeFragment)
│   ├── batches/page.tsx        # Batch CRUD (mirrors BatchFragment)
│   ├── climate/page.tsx        # Climate entry (mirrors ClimateFragment)
│   ├── advice/page.tsx         # Advice log (mirrors AdviceFragment)
│   └── history/page.tsx        # Climate history (mirrors HistoryFragment)
├── components/
│   ├── layout/AppLayout.tsx    # Bottom nav + auth guard
│   └── climate/ClimateDial.tsx # SVG dial (mirrors DialView canvas)
├── lib/
│   ├── firebase.ts             # Firebase app init
│   ├── firestore.ts            # Firestore DAOs (replaces Room DAOs)
│   ├── auth-context.tsx        # React auth context
│   └── domain.ts               # Pure domain logic (ported from Kotlin)
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

## License
Internal use only · MindMatrix VTU Internship 2025–26
