import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  serverTimestamp,
  setDoc,
} from 'firebase/firestore'
import { firestore } from './firebase'
import type { LearningPathDraft } from '../features/pathways/pathwayTypes'

function database() {
  if (!firestore) throw new Error('Firebase is not configured. Add the Firebase web app settings to the deployment environment.')
  return firestore
}

function pathwayCollection(uid: string) {
  return collection(database(), 'users', uid, 'pathways')
}

export async function listCloudPathways(uid: string): Promise<LearningPathDraft[]> {
  const snapshot = await getDocs(pathwayCollection(uid))
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
}

export async function saveCloudPathway(uid: string, pathway: LearningPathDraft): Promise<void> {
  await setDoc(doc(pathwayCollection(uid), pathway.id), {
    ...pathway,
    ownerId: uid,
    updatedAt: serverTimestamp(),
  })
}

export async function deleteCloudPathway(uid: string, pathwayId: string): Promise<void> {
  await deleteDoc(doc(pathwayCollection(uid), pathwayId))
}
