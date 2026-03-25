// app/data/quizCatalog.ts

export type QuizMode = "normal" | "exam" | "review"

export type QuizSectionDef = {
  id: string
  title: string
  description?: string
  enabled: boolean
  order: number
}

export type QuizDef = {
  id: string
  title: string
  description?: string
  enabled: boolean
  order: number
  modes: QuizMode[]
  sections: QuizSectionDef[]
}

/**
 * JLPT N5 / N4 特化版カタログ
 * - 業種概念は撤去
 * - N3 / N2 は別アプリへ切り離し
 */
export const quizCatalog: QuizDef[] = [
  {
    id: "japanese-n5",
    title: "日本語検定 N5",
    description: "ひらがな・カタカナ・基本語彙・やさしい文法・読解・聴解の箱を先に用意したN5専用教材。",
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
    description: "N4合格を目指すための文法・語彙・読解・聴解教材。既存資産をそのまま活用。",
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
// 仮の互換関数（旧コード対応）
export function getQuizDef(quizType: string) {
  const found = quizCatalog.find((q) => q.id === quizType)
  return found ?? null
}