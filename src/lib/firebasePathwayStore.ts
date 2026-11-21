import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  serverTimestamp,
  setDoc,
} from 'firebase/firestore'
import { firestore } from './firebase'
import type { PathwayStore } from './pathwayStore'
import type { LearningPathDraft } from '../features/pathways/pathwayTypes'

function database() {
  if (!firestore) {
    throw new Error('Firebase is not configured. Add the Firebase web app settings to the deployment environment.')
  }
  return firestore
}

function pathwayCollection(ownerId: string) {
  return collection(database(), 'users', ownerId, 'pathways')
}

/**
 * Current cloud adapter. Firestore rules remain responsible for enforcing
 * that the authenticated Firebase UID matches the ownerId path segment.
 */
export const firebasePathwayStore: PathwayStore = {
  async list(ownerId) {
    const snapshot = await getDocs(pathwayCollection(ownerId))
    return snapshot.docs.map((item) => {
      const data = item.data()
      return {
        id: item.id,
        title: String(data.title ?? ''),
        audience: String(data.audience ?? ''),
        outcome: String(data.outcome ?? ''),
        level: data.level === 'Intermediate' || data.level === 'Advanced' ? data.level : 'Beginner',
        durationHours: Number(data.durationHours ?? 1),
        createdAt: typeof data.createdAt === 'string' ? data.createdAt : new Date().toISOString(),
        modules: Array.isArray(data.modules) ? data.modules : [],
      } satisfies LearningPathDraft
    })
  },

  async save(ownerId, pathway) {
    await setDoc(doc(pathwayCollection(ownerId), pathway.id), {
      ...pathway,
      ownerId,
      updatedAt: serverTimestamp(),
    })
  },

  async remove(ownerId, pathwayId) {
    await deleteDoc(doc(pathwayCollection(ownerId), pathwayId))
  },
}
