# Dr. Suganya M | Learning & Development Portfolio

A growing Learning & Development application: portfolio, learning pathway design, reusable resources and learner progress.

## Technology

- React 19 + TypeScript
- Vite 8 for development and production builds
- Tailwind CSS 4 for styling
- Supabase (PostgreSQL, Auth and Row Level Security) for the application backend
- GitHub for source control and planned CI/CD

## Existing portfolio

The original static portfolio and its resources remain at the repository root. The new application is being developed in `src/` and `app/` so the existing GitHub Pages portfolio is preserved during the migration.

## Run locally

Requirements: Node.js 22.12+ and npm.

```bash
npm install
cp .env.example .env.local
# Add VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY to .env.local
npm run dev
```

The Vite app is rooted at `app/`; the production build is written to `dist/`.

## Supabase setup

1. Open your Supabase project and copy the Project URL and publishable key from **Connect**.
2. Put them in your local `.env.local` file. Do not commit this file.
3. Install the Supabase CLI and link the repository to your project.
4. Apply the migration in `supabase/migrations/` with `supabase db push`.

The migration creates learning paths, modules and learner progress with Row Level Security. The browser client uses only the publishable key. Never expose a Supabase secret or service-role key in frontend code or a `VITE_*` variable.

The application currently detects whether local Supabase configuration is present; it does not claim a live database connection until a real query is implemented and verified.

## Scripts

- `npm run dev` — local development server
- `npm run typecheck` — TypeScript checks
- `npm run build` — typecheck and production build
- `npm run preview` — preview the production build

## Privacy

Do not add personal contact details, private learner information or confidential employer materials to this public repository.
