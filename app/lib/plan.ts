import type { QuizType } from "@/app/data/types"

export type PlanId = "trial" | "free" | "7"
export type SelectLimit = number

export const JLPT_QUIZ_TYPES = ["japanese-n5", "japanese-n4"] as const satisfies readonly QuizType[]

export function getSelectLimit(plan: PlanId): SelectLimit {
  if (plan === "7") return 2
  return 1
}

export function buildEntitledQuizTypes(_plan: PlanId): QuizType[] {
  return [...JLPT_QUIZ_TYPES]
}

export function normalizeSelectedForPlan(
  selected: QuizType[],
  entitled: QuizType[],
  plan: PlanId
): QuizType[] {
  const uniq = Array.from(new Set(selected)).filter((q): q is QuizType => entitled.includes(q))
  const limit = Math.min(getSelectLimit(plan), entitled.length)
  return uniq.slice(0, limit)
}

export type BillingStatus = "pending" | "active" | "past_due" | "canceled"
export type BillingMethod = "convenience" | "card" | "bank_transfer"
export type AccountType = "personal" | "company"

export function getBillingStatus(userDoc: any): BillingStatus {
  const s = userDoc?.billing?.status
  if (s === "pending" || s === "active" || s === "past_due" || s === "canceled") return s
  return "active"
}

export function isAccessActive(userDoc: any): boolean {
  if (getBillingStatus(userDoc) !== "active") return false

  const end = userDoc?.billing?.currentPeriodEnd
  if (!end) return true

  try {
    const endDate = typeof end?.toDate === "function" ? end.toDate() : new Date(end)
    return endDate.getTime() > Date.now()
  } catch {
    return false
  }
}

export function getEffectivePlanId(userDoc: any): PlanId {
  const p = userDoc?.billing?.currentPlan ?? userDoc?.plan
  return p === "trial" || p === "free" || p === "7"
    ? p
    : "trial"
}
