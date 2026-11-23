import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth'
import type { Auth, User } from 'firebase/auth'
import { getFirebaseAuth, isFirebaseConfigured } from '../../lib/firebase'

type Props = { onUserChange: (user: User | null) => void }

export default function FirebaseAuthPanel({ onUserChange }: Props) {
  const [user, setUser] = useState<User | null>(null)
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const [auth, setAuth] = useState<Auth | null>(null)

  useEffect(() => {
    let cancelled = false
    let unsubscribe: (() => void) | undefined

    void getFirebaseAuth().then((nextAuth) => {
      if (cancelled) return
      setAuth(nextAuth)
      if (!nextAuth) {
        onUserChange(null)
        return
      }
      unsubscribe = onAuthStateChanged(nextAuth, (nextUser) => {
        setUser(nextUser)
        onUserChange(nextUser)
      })
    }).catch((error: unknown) => {
      if (!cancelled) {
        setMessage(error instanceof Error ? error.message : 'Could not load Firebase authentication.')
        onUserChange(null)
      }
    })

    return () => {
      cancelled = true
      unsubscribe?.()
    }
  }, [onUserChange])

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!auth) {
      setMessage('Firebase authentication is still loading. Please try again.')
      return
    }
    setBusy(true)
    setMessage('')
    try {
      if (mode === 'signup') {
        await createUserWithEmailAndPassword(auth, email.trim(), password)
      } else {
        await signInWithEmailAndPassword(auth, email.trim(), password)
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Authentication failed. Please try again.')
    } finally {
      setBusy(false)
    }
  }

  async function handleSignOut() {
    if (!auth) return
    await signOut(auth)
    setMessage('Signed out. Your cloud records remain safely in your account.')
  }

  if (!isFirebaseConfigured) {
    return (
      <div className="mt-4 rounded-xl border border-amber-300/25 bg-amber-300/5 p-4">
        <p className="font-semibold text-amber-100">Firebase setup required</p>
        <p className="mt-2 text-sm leading-6 text-slate-300">Add the Firebase web app settings as GitHub Actions secrets and enable Email/Password sign-in in Firebase Authentication. Until then, this workspace continues to use this browser's saved drafts.</p>
        <a className="mt-2 inline-block text-sm font-semibold text-teal-200 underline" href="https://github.com/suganmtechie-cloud/suganya-learning-portfolio/blob/main/docs/FIREBASE_SETUP.md">Open Firebase setup guide</a>
      </div>
    )
  }

  if (user) {
    return (
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-emerald-300/20 bg-emerald-300/5 p-4">
        <div>
          <p className="text-sm font-semibold text-emerald-100">Cloud account connected</p>
          <p className="mt-1 text-xs text-slate-300">{user.email}</p>
        </div>
        <button type="button" onClick={handleSignOut} className="rounded-lg border border-white/15 px-3 py-2 text-xs font-semibold text-slate-200 hover:bg-white/5">Sign out</button>
      </div>
    )
  }

  return (
    <form onSubmit={submit} className="mt-4 rounded-xl border border-white/10 bg-slate-950/35 p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-semibold text-white">Access your cloud workspace</p>
        <button type="button" onClick={() => { setMode(mode === 'signin' ? 'signup' : 'signin'); setMessage('') }} className="text-xs font-semibold text-teal-200 underline">
          {mode === 'signin' ? 'Create account' : 'Sign in instead'}
        </button>
      </div>
      <label className="mt-3 block text-xs font-medium text-slate-200" htmlFor="firebase-email">Email</label>
      <input id="firebase-email" type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} className="mt-1 w-full rounded-lg border border-white/15 bg-slate-950 px-3 py-2 text-sm text-white" />
      <label className="mt-3 block text-xs font-medium text-slate-200" htmlFor="firebase-password">Password</label>
      <input id="firebase-password" type="password" autoComplete={mode === 'signin' ? 'current-password' : 'new-password'} minLength={6} required value={password} onChange={(event) => setPassword(event.target.value)} className="mt-1 w-full rounded-lg border border-white/15 bg-slate-950 px-3 py-2 text-sm text-white" />
      {message && <p className="mt-3 text-xs text-rose-200" role="alert">{message}</p>}
      <button type="submit" disabled={busy} className="mt-4 min-h-10 rounded-lg bg-teal-300 px-4 py-2 text-xs font-bold text-slate-950 disabled:opacity-50">{busy ? 'Please wait…' : mode === 'signin' ? 'Sign in' : 'Create cloud account'}</button>
    </form>
  )
}
