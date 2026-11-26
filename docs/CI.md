# Continuous integration and deployment

Reviewed: 26 November 2026

This repository has two GitHub Actions workflows:

- `.github/workflows/ci.yml` runs frontend unit tests, Firestore Emulator authorization tests, TypeScript checks, the production build and backend tests on pushes and pull requests.
- `.github/workflows/deploy-pages.yml` builds the React Learning Studio, copies the existing root-level portfolio and Markdown resources into the deployment artifact, then deploys that artifact to GitHub Pages on pushes to `main`.

## Reviewed action releases

The workflows use the following stable releases. The JavaScript actions declare the Node 24 runtime in their checked-in `action.yml` metadata. The Pages upload action is composite and wraps `actions/upload-artifact@v7`.

| Action | Version | Purpose |
| --- | --- | --- |
| [actions/checkout](https://github.com/actions/checkout/releases/tag/v7.0.1) | v7.0.1 | Checkout source without persisting the token in local Git configuration |
| [actions/setup-node](https://github.com/actions/setup-node/releases/tag/v7.1.0) | v7.1.0 | Install the project Node.js runtime |
| [actions/setup-java](https://github.com/actions/setup-java/releases/tag/v6.3.0) | v6.3.0 | Install Java 21 for Firestore Emulator tests |
| [actions/configure-pages](https://github.com/actions/configure-pages/releases/tag/v6.0.0) | v6.0.0 | Prepare GitHub Pages metadata |
| [actions/upload-pages-artifact](https://github.com/actions/upload-pages-artifact/releases/tag/v5.0.0) | v5.0.0 | Package the static site using actions/upload-artifact v7 internally |
| [actions/deploy-pages](https://github.com/actions/deploy-pages/releases/tag/v5.0.1) | v5.0.1 | Publish the Pages artifact |

The action runtime and the application's Node.js version are separate concerns. The actions execute on Node 24, while the project continues to install Node 22 to match the repository's current engine requirement (`>=22.12.0`). This avoids combining a CI action migration with an untested application runtime upgrade.

`setup-java@v6.3.0` makes the Java problem matcher opt-in. The CI workflow explicitly sets `problem-matcher: true` so compiler diagnostics continue to appear as annotations.

## Permissions and credentials

- CI has only `contents: read`.
- The Pages build job has only `contents: read`.
- The Pages deployment job receives `pages: write` and `id-token: write`, which are required for deployment.
- Every checkout step sets `persist-credentials: false`; these workflows do not need to push commits back to the repository.
- Firebase web configuration continues to come from GitHub Actions secrets at build time. No service-account credential or private key belongs in the browser bundle or repository.

## Dependency installation and caching

There is currently no root or backend npm lockfile in the repository. The workflows therefore continue to use `npm install`. They deliberately do not enable `setup-node`'s npm cache, because npm caching depends on a committed lockfile (or another dependency file) to derive a reliable cache key.

A separate dependency-management change should add and review both lockfiles. After that, CI can switch to `npm ci` and enable caching using the corresponding lockfile paths. This change does not silently introduce a generated dependency graph.

## Local verification

From the repository root:

```bash
npm install
npm run test:unit
npm run test:rules
npm run typecheck
npm run build
```

The Firestore Emulator test requires Java 21 or later. To verify the optional Express API:

```bash
npm --prefix backend install
npm --prefix backend test
```

The workflow-action contract is part of `npm run test:unit`; it catches accidental reintroduction of the older action references or broader Pages permissions.
