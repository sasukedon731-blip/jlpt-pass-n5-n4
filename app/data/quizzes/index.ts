import { japaneseN5Quiz } from "./japanese-n5"
import { japaneseN4Quiz } from "./japanese-n4"

export const quizzes = {
  "japanese-n5": japaneseN5Quiz,
  "japanese-n4": japaneseN4Quiz,
} as const
