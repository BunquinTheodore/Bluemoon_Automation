# Bluemoon Business Management App

<div align="center">
  <img src="src/assets/3f9d5e2624d6f76604e00bccf7f947f633651625.png" alt="Bluemoon Logo" height="100" />
  <p>A role-based business management app for Bluemoon: tasks, inventory, sales, payroll, requests and reporting in one place.</p>
  <p><a href="https://www.figma.com/design/w7rherjoaYQEbDtuoZz9uU/Bluemoon-Business-Management-App">Figma design</a></p>
</div>

## Overview

Bluemoon centralizes daily operations for a multi-branch business. Users sign in with Firebase Authentication and are routed to a dashboard based on their role stored in Firestore (`users/{uid}.role`).

| Role | What they see |
|------|---------------|
| **Owner** | Full oversight: analytics, store, products, inventory, sales, payroll, employees, requests, cup inventory, reports and exports |
| **Manager** | Task assignment and tracking, team coordination, cup inventory review, report emails |
| **Employee** | Assigned tasks, task history, QR check-in, cup inventory submission |

## Features

- **Task management** - assign, schedule (calendar view), track and complete tasks with photo proof
- **Products and recipes** - product catalogue with ingredients and recipe details
- **Inventory control** - stock levels tied to recipes
- **Cup Inventory** - per-branch daily cup counts (opening, sold, expected vs actual ending) with automatic discrepancy detection. Role-specific pages: `OwnerCupInventoryPage`, `ManagerCupInventoryPage`, `TeamCupInventoryPage` (`src/components/*CupInventoryPage.tsx`, logic in `src/lib/cupInventory.ts`)
- **Sales and financial reports** - daily sales, report photos, automated and on-demand email reports (Postmark, via Cloud Functions)
- **Google Sheets export** - one-click export of financial reports to a Google Sheet using Google Identity Services OAuth (`src/components/GoogleSheetsExportButton.tsx`, `src/lib/googleSheets.ts`)
- **Payroll, employees and requests** - staff profiles, payroll views, and approve/reject request workflow
- **Attendance** - QR code scanning for check-ins
- **Photos** - task/report photos uploaded to Cloudinary (unsigned preset); photos older than 24 hours are cleaned up nightly
- **Notifications** - in-app alerts for tasks and updates
- **Modern UI** - Tailwind CSS + Radix/shadcn components, responsive layout

## Tech stack

- React 18 + TypeScript, Vite 6 (`@vitejs/plugin-react-swc`)
- Tailwind CSS, Radix UI / shadcn/ui, Lucide icons, Recharts, Sonner
- Firebase: Authentication, Firestore, Storage, Cloud Functions (`functions/`)
- Cloudinary (image hosting), Postmark (email), Google Sheets API (export)

## Prerequisites

- Node.js 20+ and npm
- A Firebase project (Blaze plan required only for Cloud Functions)
- Firebase CLI: `npm install -g firebase-tools` then `firebase login`
- Cloudinary account with an unsigned upload preset
- Google Cloud OAuth client ID (for Sheets export)

## Environment variables

Copy `.env.example` to `.env.local` and fill in your values. Variable names (all prefixed `VITE_` so Vite exposes them to the client):

```
VITE_FIREBASE_API_KEY
VITE_FIREBASE_AUTH_DOMAIN
VITE_FIREBASE_PROJECT_ID
VITE_FIREBASE_STORAGE_BUCKET
VITE_FIREBASE_MESSAGING_SENDER_ID
VITE_FIREBASE_APP_ID
VITE_FIREBASE_MEASUREMENT_ID
VITE_CLOUDINARY_CLOUD_NAME
VITE_CLOUDINARY_UPLOAD_PRESET
VITE_GOOGLE_OAUTH_CLIENT_ID
VITE_GOOGLE_SHEET_ID
```

Never commit `.env.local`. Backend secrets for Cloud Functions are configured separately (see `functions/README.md`).

## Run and build

```bash
npm install
npm run dev        # dev server on http://localhost:3000
npm run typecheck  # tsc --noEmit
npm run build      # production build -> build/
npm run preview    # serve the production build locally
```

The build output directory is `build/` (configured in `vite.config.ts`).

## Firebase setup

1. Create the Firebase project and enable Authentication (Email/Password), Firestore and Storage.
2. Seed the Firestore collections as described in [FIREBASE_SETUP_GUIDE.md](FIREBASE_SETUP_GUIDE.md) and [FIRESTORE_DATABASE_SCHEMA.md](FIRESTORE_DATABASE_SCHEMA.md).
3. Deploy the security rules:

```bash
firebase deploy --only firestore:rules,storage
```

Rules live in `firestore.rules` and `storage.rules`; indexes in `firestore.indexes.json`.

## Backend (Cloud Functions)

Scheduled and callable functions live in `functions/` (region `asia-southeast1`):

- `cleanupOldPhotos` - daily at 00:00 Asia/Manila, deletes photos older than 24 hours from Cloudinary and soft-deletes them in Firestore
- `sendDailyReport` - daily at 23:59 Asia/Manila, emails the financial report to the owner
- `sendReportManual` - HTTPS callable, triggered from the Owner Sales page (owner/manager only)

```bash
cd functions
npm install
npm run build
cd ..
firebase deploy --only functions
```

See [functions/README.md](functions/README.md) for required environment variables and troubleshooting. `vercel-backend/` contains an earlier Vercel implementation of the same backend and is kept for reference only.

## Documentation index

| File | Purpose |
|------|---------|
| [QUICK_START.md](QUICK_START.md) | Five-step Cloud Functions deployment |
| [FIREBASE_SETUP_GUIDE.md](FIREBASE_SETUP_GUIDE.md) | Step-by-step Firebase console setup and seed data |
| [FIRESTORE_DATABASE_SCHEMA.md](FIRESTORE_DATABASE_SCHEMA.md) | Firestore collections and document shapes |
| [FIREBASE_DEPLOYMENT_GUIDE.md](FIREBASE_DEPLOYMENT_GUIDE.md) | Detailed Cloud Functions deployment guide |
| [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) | Original (Vercel-based) deployment notes |
| [IMPLEMENTATION_COMPLETE.md](IMPLEMENTATION_COMPLETE.md) | Historical notes on the Firebase Functions migration |
| [IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md) | Historical notes on the photo cleanup / email report work |
| [functions/README.md](functions/README.md) | Cloud Functions reference |
| [vercel-backend/README.md](vercel-backend/README.md) | Legacy Vercel backend reference |
