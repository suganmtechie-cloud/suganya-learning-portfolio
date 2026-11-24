# Firestore security contract

This document describes the client-access rules for pathway drafts stored at:

`users/{uid}/pathways/{pathwayId}`

## Ownership boundary

A signed-in user can read, create, update or delete documents only below the path containing their own Firebase Authentication UID. All other document paths remain denied until a separate feature receives an explicit rule.

The document's `ownerId` must match the UID in the path for every create or update. Reads and deletes are scoped by the path itself. Keeping reads/deletes path-scoped also avoids locking users out of older documents that may predate the `ownerId` field.

## Pathway write contract

Creates and updates must contain exactly these top-level fields:

- `id`
- `title`
- `audience`
- `outcome`
- `level`
- `durationHours`
- `createdAt`
- `modules`
- `ownerId`
- `updatedAt`

The rules validate the document ID, owner, field types and current UI limits: title 3–80 characters, audience 1–100, outcome 1–240, level Beginner/Intermediate/Advanced, duration 1–40 whole hours, and no more than 12 modules.

The client writes `updatedAt` with Firestore `serverTimestamp()`; the rules require it to equal `request.time`. Updates must retain the original `createdAt` value.

## Nested module and lesson limitation

The rules confirm that `modules` is a list and cap it at 12 entries. The current nested module/lesson representation is stored inside the pathway document. Firestore Rules can inspect individual list positions but do not provide a general loop that validates every arbitrary list member. The application normalizes module and lesson data, but client-side validation is not a security boundary.

Do not treat this nested structure as suitable for sensitive learner records, assessment submissions or certification evidence. Before those features are enabled, move them into separately addressable documents/tables with explicit per-record ownership and validation rules. The planned relational Supabase model with Row Level Security is a candidate once the actual project connection is available and policies can be tested.

## Deploy and verify

Review the rules and deploy them to the intended Firebase project:

```bash
firebase deploy --only firestore:rules
```

The repository's `npm run test:unit` includes static contract tests that guard important rule clauses from accidental removal. These tests inspect the source text; they are not a Firestore Rules emulator and do not prove that a live project has these rules deployed.

For runtime authorization testing, use the Firebase Local Emulator Suite and authenticated/unauthenticated test users before enabling new learner-data collections.

Official references:

- [Control access to specific fields](https://firebase.google.com/docs/firestore/security/rules-fields)
- [Writing conditions for Cloud Firestore Security Rules](https://firebase.google.com/docs/firestore/security/rules-conditions)
- [Firestore request time and server timestamps](https://firebase.google.com/docs/reference/rules/rules.firestore.Request)
