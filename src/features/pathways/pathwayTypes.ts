export type LearningLevel = 'Beginner' | 'Intermediate' | 'Advanced'

export type LearningModuleDraft = {
  id: string
  title: string
  learningObjective: string
  description: string
  estimatedMinutes: number
  position: number
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
