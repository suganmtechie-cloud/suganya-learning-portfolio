# Continuous integration and dependency management

Reviewed: 28 November 2026

This repository has three GitHub Actions workflows:

- `.github/workflows/ci.yml` runs frontend unit tests, Firestore Emulator authorization tests, TypeScript checks, the production build and backend tests on pushes and pull requests.
- `.github/workflows/deploy-pages.yml` builds the React Learning Studio, copies the existing root-level portfolio and Markdown resources into the deployment artifact, then deploys that artifact to GitHub Pages on pushes to `main`.
- `.github/workflows/prepare-lockfiles.yml` regenerates both npm lockfiles on a manual dispatch or when that workflow definition changes on `main`. It validates the files and pushes them to a run-specific review branch; it never pushes generated dependency files directly to `main`.

## Reviewed action releases

The workflows use the following stable releases. The JavaScript actions declare the Node 24 runtime in their checked-in `action.yml` metadata. The Pages upload action is composite and wraps `actions/upload-artifact@v7`.

| Action | Version | Purpose |
| --- | --- | --- |
| [actions/checkout](https://github.com/actions/checkout/releases/tag/v7.0.1) | v7.0.1 | Checkout source without persisting the token in local Git configuration |
| [actions/setup-node](https://github.com/actions/setup-node/releases/tag/v7.1.0) | v7.1.0 | Install Node.js and cache npm package data |
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
- Every checkout step sets `persist-credentials: false`; these workflows do not retain the GitHub token in local Git configuration.
- The lockfile preparation job scopes `contents: write` to its single generation job. It uses the short-lived workflow token only to push a run-specific review branch. The generated branch is reviewed and merged through a pull request.
- Firebase web configuration continues to come from GitHub Actions secrets at build time. No service-account credential or private key belongs in the browser bundle or repository.

## Dependency lockfiles and installation

Both package manifests now have committed npm lockfiles:

| Project | Lockfile | Lockfile format | Package entries (excluding root) |
| --- | --- | ---: | ---: |
| React Learning Studio | `package-lock.json` | 3 | 169 |
| Optional Express API | `backend/package-lock.json` | 3 | 90 |

The files were generated on GitHub Actions with Node.js 22.23.5 and npm 10.9.9. No package manifest or dependency range was changed. The lockfiles preserve the existing major-version boundaries; for example, the Firebase 12 range resolves to 12.19.0 rather than moving to Firebase 13, and Express remains on 4.x. The Vite range resolves to stable 8.4.0. No prerelease versions were found.

Every resolved package uses an HTTPS URL under `registry.npmjs.org` and has an integrity hash. The preparation workflow checks these conditions, along with package name, version and lockfile format, before it creates a review branch.

CI and Pages deployment use `npm ci`, which refuses to proceed if the lockfile and manifest are out of sync. The root jobs cache npm package data using `package-lock.json`; the backend job uses `backend/package-lock.json`. This caches npm's package data, not `node_modules`.

To refresh dependencies deliberately, update the relevant manifest and lockfile together. To regenerate both lockfiles from the current manifests, run **Prepare npm lockfiles** manually from the Actions tab. Review the generated branch and its pull request before merging; do not copy lockfiles from an unverified source.

Official references: [npm install and package-lock-only](https://docs.npmjs.com/cli/install/), [npm ci](https://docs.npmjs.com/cli/commands/npm-ci/), and [setup-node npm caching](https://github.com/actions/setup-node#caching-global-packages-data).

## Local verification

From the repository root:

```bash
npm ci
npm run test:unit
npm run test:rules
npm run typecheck
npm run build
```

The Firestore Emulator test requires Java 21 or later. To verify the optional Express API:

```bash
npm --prefix backend ci
npm --prefix backend test
```

The workflow-action contract tests are part of `npm run test:unit`; they verify reviewed action versions, checkout credential handling, least-privilege Pages permissions, lockfile-backed installs, npm cache paths, the lockfile refresh workflow and lockfile integrity.
