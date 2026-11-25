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

## Runtime emulator tests

The repository now includes runtime authorization tests using the Firebase Local Emulator Suite and `@firebase/rules-unit-testing`.

Requirements:

- Node.js 22.12 or later, matching the project toolchain.
- Java 21 or later for the current Firestore Emulator.
- Dependencies installed with `npm install`.

Run:

```bash
npm run test:rules
```

The command pins Firebase CLI 15.37.0, starts only the Firestore emulator against the demo project ID `demo-learning-studio`, and runs `tests/firestoreRules.emulator.mjs`. The emulator loads the rules configured in `firebase.json`. A demo project ID has no live Firebase resources, so these tests do not read or write the production database.

The runtime suite verifies:

- A user can create, read, update and delete a pathway under their own UID.
- One user cannot read or write another user's pathway path.
- Unauthenticated reads and writes are rejected.
- Incorrect ownership, unexpected fields, mismatched IDs, invalid limits and client-controlled update timestamps are rejected.
- Updates cannot change the original creation time.
- Older pathway documents remain readable and deletable by their path owner.
- Unmatched document paths remain denied.

The repository's `npm run test:unit` continues to run fast, dependency-light source-contract tests. The emulator suite is a separate command because it starts a local Java-based service.

GitHub Actions runs the emulator suite as part of frontend CI. It uses a demo project and does not require Firebase credentials or a deployed Firebase project.

## Deploy and verify

Review the rules and deploy them to the intended Firebase project only after the emulator tests pass:

```bash
firebase deploy --only firestore:rules
```

Passing emulator tests prove the checked-in rules behave as tested in the local emulator. They do not prove that the same rules have been deployed to a live Firebase project.

Official references:

- [Test Cloud Firestore Security Rules](https://firebase.google.com/docs/firestore/security/test-rules-emulator)
- [Set up the Local Emulator Suite](https://firebase.google.com/docs/rules/emulator-setup)
- [Firebase CLI release notes](https://firebase.google.com/support/release-notes/cli)
