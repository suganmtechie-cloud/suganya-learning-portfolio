import type { LearningLessonDraft, LearningLessonFormat } from './pathwayTypes'

export const MAX_LESSONS_PER_MODULE: number
export function isHttpsUrl(value: string): boolean
export function isLessonContentValid(format: LearningLessonFormat, content: string): boolean
export function normalizeLessons(value: unknown): LearningLessonDraft[]
export function reorderLessons(
  lessons: LearningLessonDraft[],
  index: number,
  direction: -1 | 1,
): LearningLessonDraft[]
