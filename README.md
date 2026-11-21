# Dr. Suganya M | Learning & Development Portfolio

A growing Learning & Development application: portfolio, learning pathway design, reusable resources and learner progress.

## Technology

- **Frontend:** React 19, TypeScript, Vite 8 and Tailwind CSS 4
- **Cloud data and identity:** Firebase Authentication and Cloud Firestore
- **Hosting:** GitHub Pages with GitHub Actions
- **Optional server API:** Node.js 22 and Express for future trusted server-side workflows

## Architecture

The original static portfolio and its resources remain at the repository root. The React Learning Studio lives in `src/` and `app/`.

Firebase Authentication provides email/password sign-in. The React workspace uses a typed `PathwayStore` contract, currently implemented by a Cloud Firestore adapter that stores each user's pathways under `users/{uid}/pathways`. Firestore Security Rules restrict each signed-in user to their own documents and deny access to all other document paths by default. See [storage architecture](docs/STORAGE_ARCHITECTURE.md) before changing or adding a backend.

The Firebase browser configuration is supplied through GitHub Actions repository secrets at build time. Supabase SQL files in `supabase/migrations` are not evidence of a live connection or applied migrations; the Supabase adapter remains inactive until the project and its RLS policies can be verified. Firebase web configuration is not a server credential; authorization is enforced by Authentication and Firestore Security Rules. Never add a Firebase service-account private key or Admin SDK credential to a browser build.

## Current React workspace

- Create and retain learning pathway drafts with an audience, practical outcome, level and duration.
- Add up to 12 modules to each pathway, with a learning objective, optional activity notes and estimated minutes.
- Add up to 20 lessons per module, using text content or HTTPS links for video, PDF and other resources; edit, reorder and estimate lesson time.
- Edit, remove and reorder modules. A time-allocation indicator compares module estimates with the overall programme duration.
- Sign in or create an account using Firebase Authentication.
- Save pathway and module changes to the signed-in user's Firestore collection.
- On first sign-in, merge browser-saved drafts into the cloud account without duplicating records that already exist there. The browser copy is retained as a local backup.
- Learning resources, assessments, certification tracking and learner progress remain roadmap areas; their data models and security rules must be added before those features are enabled.

## Run locally

Requirements: Node.js 22.12+ and npm.

```bash
npm install
cp .env.example .env.local
# Fill in the Firebase Web App configuration values.
npm run dev
```

See [Firebase setup](docs/FIREBASE_SETUP.md) for project creation, Authentication, Firestore rules and GitHub Actions secrets.

## GitHub Pages deployment

The workflow builds the React app and publishes it alongside the existing static portfolio. Add the six `VITE_FIREBASE_*` repository secrets under **Settings → Secrets and variables → Actions**. Without these values, the app still builds and retains browser-only drafts, but cloud sign-in remains disabled.

## Optional Express API

The existing Express API is separate from the React app and is not currently used for pathway storage. Future server-side features should use Firebase Admin SDK only in a trusted server environment, with service-account credentials stored as server secrets and never exposed to the browser.

## Scripts

- `npm run dev` — React development server
- `npm run typecheck` — TypeScript checks
- `npm run test:unit` — dependency-free lesson model tests using Node's built-in test runner
- `npm run build` — typecheck and production build
- `npm run api:dev` — optional Express API in watch mode
- `npm run api:test` — backend tests

## Privacy and security

Do not add personal contact details, private learner information or confidential employer materials to this public repository. Never commit `.env.local`, Firebase service-account files, private keys or Admin SDK credentials. Publish the Firestore rules before using cloud data.
