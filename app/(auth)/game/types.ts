// app/(auth)/game/types.ts
import type { QuizType } from "@/app/data/types"

export type GameMode = "normal" | "attack"

/**
 * 旧問題資産との互換のため N3/N2/N1 も残す。
 * ただし現行導線の主戦場は N5 / N4。
 */
export type GameDifficulty = "N5" | "N4" | "N3" | "N2" | "N1"

export type GameKind =
  | "tile-drop"
  | "speed-choice"
  | "flash-judge"
  | "memory-burst"
  | "sentence-build"

export type GameQuestionType = "reading" | "fill" | "particle"

export type GameQuestion = {
  id: string
  kind: GameKind
  type: GameQuestionType
  prompt: string
  answer: string[]
  choices: string[]
  difficulty: GameDifficulty
  enabled: boolean
  quizType?: QuizType
  sectionId?: string
}

export type FlashJudgeQuestion = {
  id: string
  kind: "flash-judge"
  prompt: string
  answer: boolean
  explanation?: string
  difficulty: GameDifficulty
  enabled: boolean
  quizType?: QuizType
  sectionId?: string
}

export type MemoryBurstQuestion = {
  id: string
  kind: "memory-burst"
  displayText: string
  question: string
  choices: string[]
  correctIndex: number
  explanation?: string
  difficulty: GameDifficulty
  enabled: boolean
  quizType?: QuizType
  sectionId?: string
}

export type LeaderboardBestLevel = "N5" | "N4" | "N3" | "N2" | "N1"

export type LeaderboardEntry = {
  uid: string
  displayName: string
  bestScore: number
  bestLevel?: LeaderboardBestLevel
  bestStage?: number
  updatedAt?: unknown
}
