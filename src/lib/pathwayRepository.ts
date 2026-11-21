import { createPathwayRepository } from './pathwayRepositoryFactory.mjs'
import { firebasePathwayStore } from './firebasePathwayStore'

/**
 * Database-independent repository API consumed by the React workspace.
 * To introduce another backend, implement PathwayStore and select its
 * adapter here after its authentication and ownership policies are verified.
 */
const pathwayRepository = createPathwayRepository(firebasePathwayStore)

export const listCloudPathways = pathwayRepository.list
export const saveCloudPathway = pathwayRepository.save
export const deleteCloudPathway = pathwayRepository.remove
