export type ResourceDraft = {
  id: string
  title: string
  description: string
  category: string
  format: string
  url: string
  createdAt: string
}

export const RESOURCE_STORAGE_KEY: string
export const RESOURCE_CATEGORIES: readonly string[]
export const RESOURCE_FORMATS: readonly string[]
export function isSafeResourceUrl(value: unknown): boolean
export function normalizeResources(value: unknown): ResourceDraft[]
export function filterResources(resources: ResourceDraft[], search: string, category: string): ResourceDraft[]
