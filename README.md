# Dr. Suganya M | Learning & Development Portfolio

A growing Learning & Development application: portfolio, learning pathway design, reusable resources and learner progress.

## Technology

- **Frontend:** React 19, TypeScript, Vite 8 and Tailwind CSS 4
- **Platform backend:** Supabase PostgreSQL, Auth and Row Level Security
- **Optional server API:** Node.js 22 and Express for server-only workflows
- **DevOps:** Docker Compose and GitHub Actions

## Architecture

The original static portfolio and its resources remain at the repository root. The React application lives in `src/` and `app/`.

Supabase is the system of record for application data and identity. The React app uses the Supabase publishable key and Row Level Security. The Express API is a separate server-side extension point for work that should not run in the browser (for example, certificate generation or trusted integrations). It connects to the same Supabase PostgreSQL database through the server-only `DATABASE_URL`; it does not introduce a second production database or a duplicate password store.

The existing `learning_paths` table represents a course, and `learning_modules` represents its modules. The LMS migration adds categories, lessons, enrollments and learner progress while reusing Supabase Auth's `auth.users` identities.

## Run locally

Requirements: Node.js 22.12+ and npm.

```bash
npm install
cp .env.example .env.local
# Fill in the Supabase Project URL, publishable key and server database URL.
npm run dev
```

The React application is served by Vite. To run the optional Express API in another terminal:

```bash
npm install --prefix backend
npm run api:dev
```

The API listens on http://localhost:4000. Its `/api/health` endpoint checks the PostgreSQL connection; the root endpoint is a process liveness check.

## Docker

After configuring `.env.local`, run:

```bash
docker compose up --build
```

The API container uses the same Supabase database URL as the application. This deliberately avoids creating a second local PostgreSQL database whose schema could drift from Supabase. Stop it with `docker compose down`.

## Supabase setup

1. Copy the Project URL and publishable key from Supabase **Connect** into `.env.local`.
2. Copy the PostgreSQL connection string into `DATABASE_URL` in the same file. Keep it server-only; never use a `VITE_` prefix for it.
3. Install and link the Supabase CLI to your project.
4. Review and apply migrations with `supabase db push`.

The migrations add learning paths, modules, categories, lessons, enrollments and progress with Row Level Security. They have not been applied to your hosted Supabase project by this repository change.

**Security:** Never commit `.env.local`, database passwords, Supabase secret keys or service-role keys. The browser must use only the publishable key. Never disable RLS to make a feature work.

## Scripts

- `npm run dev` — React development server
- `npm run typecheck` — TypeScript checks
- `npm run build` — typecheck and production build
- `npm run api:dev` — Express API in watch mode
- `npm run api:test` — backend tests

## Privacy

Do not add personal contact details, private learner information or confidential employer materials to this public repository.
