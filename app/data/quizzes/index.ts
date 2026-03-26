import { japaneseN5Quiz } from "./japanese-n5"
import { japaneseN4Quiz } from "./japanese-n4"
import type { Quiz, JlptQuizType } from "@/app/data/types"

export const quizzes: Record<JlptQuizType, Quiz> = {
  "japanese-n5": japaneseN5Quiz,
  "japanese-n4": japaneseN4Quiz,
}
