import type { LearningPathDraft } from '../features/pathways/pathwayTypes'

/**
 * Storage contract used by the Learning Studio.
 *
 * Implementations must scope every operation to the supplied authenticated
 * owner ID. UI components should depend on this contract, not a database SDK.
 */
export interface PathwayStore {
  list(ownerId: string): Promise<LearningPathDraft[]>
  save(ownerId: string, pathway: LearningPathDraft): Promise<void>
  remove(ownerId: string, pathwayId: string): Promise<void>
}
