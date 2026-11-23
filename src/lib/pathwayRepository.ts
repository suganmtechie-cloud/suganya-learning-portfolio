import { createPathwayRepository } from './pathwayRepositoryFactory.mjs'
import type { PathwayStore } from './pathwayStore'

/**
 * Database-independent repository API consumed by the React workspace.
 * The Firebase SDK is loaded only when a signed-in user requests cloud data.
 * To introduce another backend, implement PathwayStore and select its
 * adapter here after its authentication and ownership policies are verified.
 */
const lazyFirebaseStore: PathwayStore = {
  async list(ownerId) {
    const { firebasePathwayStore } = await import('./firebasePathwayStore')
    return firebasePathwayStore.list(ownerId)
  },

  async save(ownerId, pathway) {
    const { firebasePathwayStore } = await import('./firebasePathwayStore')
    return firebasePathwayStore.save(ownerId, pathway)
  },

  async remove(ownerId, pathwayId) {
    const { firebasePathwayStore } = await import('./firebasePathwayStore')
    return firebasePathwayStore.remove(ownerId, pathwayId)
  },
}

const pathwayRepository = createPathwayRepository(lazyFirebaseStore)

export const listCloudPathways = pathwayRepository.list
export const saveCloudPathway = pathwayRepository.save
export const deleteCloudPathway = pathwayRepository.remove
