// app/data/quizCatalog.ts

import type { JlptQuizType } from "./types"

export type QuizMode = "normal" | "exam" | "review"

export type QuizSectionDef = {
  id: string
  title: string
  description?: string
  enabled: boolean
  order: number
}

export type QuizDef = {
  id: JlptQuizType
  title: string
  description?: string
  enabled: boolean
  order: number
  modes: QuizMode[]
  sections: QuizSectionDef[]
}

export const quizCatalog: QuizDef[] = [
  {
    id: "japanese-n5",
    title: "日本語検定 N5",
    description: "ひらがな・カタカナ・基本語彙・やさしい文法・読解・聴解のN5専用教材。",
    enabled: true,
    order: 1,
    modes: ["normal", "exam", "review"],
    sections: [
      { id: "all", title: "すべて", enabled: true, order: 1 },
      { id: "moji-goi", title: "文字・語彙", enabled: true, order: 2 },
      { id: "bunpo", title: "文法", enabled: true, order: 3 },
      { id: "reading", title: "読解", enabled: true, order: 4 },
      { id: "listening", title: "聴解", enabled: true, order: 5 },
    ],
  },
  {
    id: "japanese-n4",
    title: "日本語検定 N4",
    description: "N4合格を目指すための語彙・文法・読解・聴解教材。",
    enabled: true,
    order: 2,
    modes: ["normal", "exam", "review"],
    sections: [
      { id: "all", title: "すべて", enabled: true, order: 1 },
      { id: "vocab", title: "文字・語彙", enabled: true, order: 2 },
      { id: "grammar", title: "文法", enabled: true, order: 3 },
      { id: "reading", title: "読解", enabled: true, order: 4 },
      { id: "listening", title: "聴解", enabled: true, order: 5 },
    ],
  },
]

export function getQuizDef(quizType: string) {
  return quizCatalog.find((q) => q.id === quizType) ?? null
}
