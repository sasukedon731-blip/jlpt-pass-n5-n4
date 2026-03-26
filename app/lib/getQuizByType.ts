import { quizzes } from "@/app/data/quizzes"
import { isJlptQuizType, type Quiz, type QuizType, type QuizSection } from "@/app/data/types"
import { getQuizDef } from "@/app/data/quizCatalog"
import { attachAudioUrls } from "@/app/lib/audio"

export function getQuizByType(type: QuizType): Quiz | null {
  if (!isJlptQuizType(type)) return null

  const raw = quizzes[type] ?? null
  if (!raw) return null

  const base = attachAudioUrls(raw)

  if (Array.isArray((base as any).sections) && (base as any).sections.length > 0) {
    return base
  }

  const def = getQuizDef(type)

  const injected: QuizSection[] =
    def?.sections
      ?.filter((s) => s.enabled && s.id !== "all")
      ?.sort((a, b) => a.order - b.order)
      ?.map((s) => ({ id: s.id, label: s.title })) ?? []

  return {
    ...base,
    sections: injected.length ? injected : undefined,
  }
}
