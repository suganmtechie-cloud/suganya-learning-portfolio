# Firebase setup for Learning Studio

This repository uses Firebase Authentication and Cloud Firestore. The Firebase web configuration identifies the project; it is not a server credential. Access to pathway documents is enforced by Firestore Security Rules.

## 1. Create a Firebase project

1. Open https://console.firebase.google.com/ and create a project.
2. Add a Web App in Project settings.
3. Copy its web configuration values. Do not create or download a service-account key for the browser app.

## 2. Enable authentication

1. In Firebase Console, open **Authentication → Sign-in method**.
2. Enable **Email/Password**.
3. In **Authentication → Settings → Authorized domains**, add `suganmtechie-cloud.github.io` if it is not already listed.
4. Create your first account from the Learning Studio sign-in panel.

## 3. Create Firestore and deploy rules

1. Open **Firestore Database** and create a database.
2. Choose a region appropriate for your users and data residency requirements. The database location cannot be changed after creation.
3. In **Firestore → Rules**, publish the contents of this repository's `firestore.rules` file, or deploy them with the Firebase CLI:

   ```bash
   npm install --global firebase-tools
   firebase login
   firebase use --add
   firebase deploy --only firestore:rules
   ```

The rules allow each authenticated user to read and change only their own pathway documents under `users/{uid}/pathways`. All other paths are denied by default.

## 4. Configure GitHub Pages

In the GitHub repository, open **Settings → Secrets and variables → Actions** and add these repository secrets using the matching values from the Firebase Web App configuration:

- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`

The Pages build workflow reads these values during the build. Do not add a service account, Admin SDK credential or private key to a `VITE_` variable.

## 5. Local development

Copy `.env.example` to `.env.local`, fill in the same six web configuration values, then run:

```bash
npm install
npm run dev
```

## 6. Existing draft migration

When a user signs in for the first time after Firebase is configured, the app merges the drafts already saved in that browser with the cloud account's pathways. Browser drafts with IDs already present in the cloud are not duplicated. The merged records are uploaded to that user's Firestore collection.

Keep the browser's local storage intact until the cloud migration has been checked. Signing out does not delete cloud data.

## Current scope

- Cloud-backed pathway drafts, module outlines and nested lesson content.
- Lessons are stored inside the owning user's pathway document, so the existing user-scoped Firestore rule protects them with the same ownership boundary. The UI validates lesson structure, limits each module to 20 lessons, caps text notes at 800 characters and accepts HTTPS-only external resource links.
- Email/password account creation and sign-in.
- Per-user Firestore access rules.
- Other areas (resource library, assessments, certification tracking and learner progress) remain roadmap items and should receive explicit data models and rules before they are enabled.
