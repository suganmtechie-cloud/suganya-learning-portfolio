const config = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY as string | undefined,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN as string | undefined,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID as string | undefined,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET as string | undefined,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID as string | undefined,
  appId: import.meta.env.VITE_FIREBASE_APP_ID as string | undefined,
}

export const isFirebaseConfigured = Boolean(
  config.apiKey && config.authDomain && config.projectId && config.appId,
)

export async function getFirebaseApp() {
  if (!isFirebaseConfigured) return null

  const { getApps, initializeApp } = await import('firebase/app')
  const existingDefaultApp = getApps().find((app) => app.name === '[DEFAULT]')
  return existingDefaultApp ?? initializeApp(config)
}

export async function getFirebaseAuth() {
  const app = await getFirebaseApp()
  if (!app) return null
  const { getAuth } = await import('firebase/auth')
  return getAuth(app)
}

export async function getFirebaseFirestore() {
  const app = await getFirebaseApp()
  if (!app) return null
  const { getFirestore } = await import('firebase/firestore')
  return getFirestore(app)
}
