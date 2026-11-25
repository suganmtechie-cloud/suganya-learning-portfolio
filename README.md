# Dr. Suganya M | Learning & Development Portfolio

A growing Learning & Development application: portfolio, learning pathway design, reusable resources and learner progress.

## Technology

- **Frontend:** React 19, TypeScript, Vite 8 and Tailwind CSS 4
- **Cloud data and identity:** Firebase Authentication and Cloud Firestore
- **Hosting:** GitHub Pages with GitHub Actions
- **Optional server API:** Node.js 22 and Express for future trusted server-side workflows

## Architecture

The original static portfolio and its resources remain at the repository root. The React Learning Studio lives in `src/` and `app/`.

Firebase Authentication provides email/password sign-in. The React workspace uses a typed `PathwayStore` contract, currently implemented by a Cloud Firestore adapter that stores each user's pathways under `users/{uid}/pathways`. Firestore Security Rules restrict each signed-in user to their own documents and deny access to all other document paths by default. Pathway writes also use an explicit top-level field allowlist, field type/size checks, an ID-to-document-path check, immutable creation time and a server-generated update timestamp. The nested module list is count-limited; every nested module/lesson field is not yet independently validated by Firestore Rules. See [Firestore security contract](docs/FIRESTORE_SECURITY.md) before adding learner records. Runtime authorization tests now exercise the rules in the local Firestore emulator. Authentication, Firestore, the module editor and the resource library are loaded on demand to keep the initial workspace lighter. See [storage architecture](docs/STORAGE_ARCHITECTURE.md) and [performance architecture](docs/PERFORMANCE.md) before changing the backend or loading boundaries.

The Firebase browser configuration is supplied through GitHub Actions repository secrets at build time. Supabase SQL files in `supabase/migrations` are not evidence of a live connection or applied migrations; the Supabase adapter remains inactive until the project and its RLS policies can be verified. Firebase web configuration is not a server credential; authorization is enforced by Authentication and Firestore Security Rules. Never add a Firebase service-account private key or Admin SDK credential to a browser build.

## Current React workspace

- Create and retain learning pathway drafts with an audience, practical outcome, level and duration.
- Add up to 12 modules to each pathway, with a learning objective, optional activity notes and estimated minutes.
- Add up to 20 lessons per module, using text content or HTTPS links for video, PDF and other resources; edit, reorder and estimate lesson time.
- Edit, remove and reorder modules. A time-allocation indicator compares module estimates with the overall programme duration.
- Sign in or create an account using Firebase Authentication.
- Save pathway and module changes to the signed-in user's Firestore collection.
- On first sign-in, merge browser-saved drafts into the cloud account without duplicating records that already exist there. The browser copy is retained as a local backup.
- Browse five built-in L&D resources covering design, assessment, feedback, facilitation and course templates. Add HTTPS references and filter the library; custom links remain in the current browser only.
- Learner progress, reflection, certification tracking and cloud resource storage remain roadmap areas; their data models and security rules must be added before those features are enabled.

## Run locally

Requirements: Node.js 22.12+ and npm. Java 21+ is required only for Firestore emulator tests.

```bash
npm install
cp .env.example .env.local
# Fill in the Firebase Web App configuration values.
npm run dev
```

See [Firebase setup](docs/FIREBASE_SETUP.md) for project creation, Authentication, Firestore rules and GitHub Actions secrets. See [resource library guidance](docs/RESOURCE_LIBRARY.md) for built-in assets and local-only custom links. See [performance architecture](docs/PERFORMANCE.md) for deferred loading and browser verification steps.

## GitHub Pages deployment

The workflow builds the React app and publishes it alongside the existing static portfolio. Add the six `VITE_FIREBASE_*` repository secrets under **Settings → Secrets and variables → Actions**. Without these values, the app still builds and retains browser-only drafts, but cloud sign-in remains disabled.

## Optional Express API

The existing Express API is separate from the React app and is not currently used for pathway storage. Future server-side features should use Firebase Admin SDK only in a trusted server environment, with service-account credentials stored as server secrets and never exposed to the browser.

## Scripts

- `npm run dev` — React development server
- `npm run typecheck` — TypeScript checks
- `npm run test:unit` — dependency-free feature-model, repository-boundary and Firestore rules source-contract tests
- `npm run test:rules` — runtime Firestore authorization tests against the local emulator (Java 21+)
- `npm run build` — typecheck and production build
- `npm run api:dev` — optional Express API in watch mode
- `npm run api:test` — backend tests

## Privacy and security

Do not add personal contact details, private learner information or confidential employer materials to this public repository. Never commit `.env.local`, Firebase service-account files, private keys or Admin SDK credentials. Publish the Firestore rules before using cloud data. Run `npm run test:rules` after changing Firestore rules; emulator tests do not deploy rules to production.
