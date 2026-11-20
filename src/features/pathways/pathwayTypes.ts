export type LearningLevel = 'Beginner' | 'Intermediate' | 'Advanced'
export type LearningLessonFormat = 'text' | 'video' | 'pdf' | 'link'

export type LearningLessonDraft = {
  id: string
  title: string
  format: LearningLessonFormat
  content: string
  estimatedMinutes: number
  position: number
}

export type LearningModuleDraft = {
  id: string
  title: string
  learningObjective: string
  description: string
  estimatedMinutes: number
  position: number
  lessons: LearningLessonDraft[]
}

export type LearningPathDraft = {
  id: string
  title: string
  audience: string
  outcome: string
  level: LearningLevel
  durationHours: number
  createdAt: string
  modules: LearningModuleDraft[]
}
