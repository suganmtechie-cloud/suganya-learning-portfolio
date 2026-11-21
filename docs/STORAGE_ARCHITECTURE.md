# Learning Studio storage architecture

## Current implementation

The React workspace uses a small, typed storage boundary rather than importing a database SDK into feature components.

- `src/lib/pathwayStore.ts` defines the `PathwayStore` contract: list, save and remove pathways for an owner.
- `src/lib/pathwayRepositoryFactory.mjs` validates an adapter and exposes a stable repository API.
- `src/lib/pathwayRepository.ts` selects the active adapter and preserves the API currently used by the workspace.
- `src/lib/firebasePathwayStore.ts` implements the contract with Cloud Firestore.
- `src/lib/firebase.ts` initializes the Firebase browser client from `VITE_FIREBASE_*` build variables.

The current Firestore layout is `users/{uid}/pathways/{pathwayId}`. Every adapter operation receives the authenticated owner's ID. Firestore Security Rules remain the authorization boundary; passing an owner ID from the browser is not itself proof of ownership.

The existing React components continue to call `listCloudPathways`, `saveCloudPathway` and `deleteCloudPathway`. This keeps today's feature behavior unchanged while isolating the persistence implementation.

## Supabase migration status

Supabase SQL files in `supabase/migrations` are repository artifacts only. No Supabase connector was available during this implementation, so the live project, applied migration history and database policies could not be inspected. No migration has been applied and no Supabase adapter is active.

Do not infer a connected Supabase project from the presence of SQL files.

## Requirements before adding a Supabase adapter

1. Confirm access to the intended Supabase project and inspect its actual schema and migration history.
2. Review every table's Row Level Security policies before enabling browser access. Owner-owned rows must use `auth.uid()`; child rows must prove ownership through their parent relationship.
3. Map Firebase pathway, module and lesson records to the relational schema, including stable IDs, ordering, timestamps and legacy records.
4. Use Supabase Auth identity for new records. Firebase UIDs and Supabase user UUIDs are different identity domains; plan an explicit account/data migration rather than assuming they match.
5. Use only the Supabase project URL and publishable key in browser configuration. Keep service-role keys and database credentials out of the client and Git history.
6. Keep Storage buckets private by default and add object policies tied to authenticated ownership before uploading learner or course files.
7. Test owner access, cross-user denial, published-course reads and learner-progress writes against the real project before switching the active adapter.
8. Use one active write backend during migration. Do not dual-write to Firebase and Supabase without a separately designed reconciliation strategy and tested rollback plan.

Once the Supabase adapter is verified, selection should be changed in `src/lib/pathwayRepository.ts`. The React workspace should not need to know which database is active.

## Local verification

Run the repository checks:

```bash
npm run test:unit
npm run typecheck
npm run build
```
