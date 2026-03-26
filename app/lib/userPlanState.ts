"use client"

import { db } from "@/app/lib/firebase"
import type { QuizType } from "@/app/data/types"
import {
  buildEntitledQuizTypes,
  normalizeSelectedForPlan,
  type PlanId,
} from "@/app/lib/plan"
import {
  Timestamp,
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
} from "firebase/firestore"

const TEST_ALWAYS_UNLOCK_ALL = true

export type UserPlanState = {
  devUnlockAll?: boolean
  plan: PlanId
  entitledQuizTypes: QuizType[]
  selectedQuizTypes: QuizType[]
  nextChangeAllowedAt: Date | null
  displayName: string
  schemaVersion: number
}

function isPlanId(v: unknown): v is PlanId {
  return v === "trial" || v === "free" || v === "7"
}

function inferPlan(data: any): PlanId {
  if (isPlanId(data?.plan)) return data.plan
  if (data?.plan === 7 || data?.plan === "7" || data?.plan === 3 || data?.plan === "3" || data?.plan === 5 || data?.plan === "5") return "7"
  return "trial"
}

function toDateOrNull(v: any): Date | null {
  if (!v) return null
  if (v instanceof Date) return v
  if (typeof v?.toDate === "function") return v.toDate()
  const d = new Date(v)
  return Number.isNaN(d.getTime()) ? null : d
}

function addMonths(date: Date, months: number): Date {
  const d = new Date(date)
  d.setMonth(d.getMonth() + months)
  return d
}

function defaultBilling(plan: PlanId) {
  return {
    accountType: "personal",
    method: "convenience",
    status: "active",
    currentPlan: plan,
    currentPeriodEnd: null,
    aiConversationEnabled: false,
  }
}

export async function loadAndRepairUserPlanState(uid: string): Promise<UserPlanState> {
  const ref = doc(db, "users", uid)
  const snap = await getDoc(ref)
  const data = snap.exists() ? (snap.data() as any) : {}

  const plan = inferPlan(data)
  const entitledQuizTypes = buildEntitledQuizTypes(plan)
  const rawSelected = Array.isArray(data?.selectedQuizTypes)
    ? (data.selectedQuizTypes as QuizType[])
    : []
  const normalizedSelected = normalizeSelectedForPlan(rawSelected, entitledQuizTypes, plan)
  const selectedQuizTypes = TEST_ALWAYS_UNLOCK_ALL
    ? entitledQuizTypes
    : normalizedSelected
  const nextChangeAllowedAt = TEST_ALWAYS_UNLOCK_ALL ? null : toDateOrNull(data?.nextChangeAllowedAt)
  const displayName = typeof data?.displayName === "string" ? data.displayName : ""
  const devUnlockAll = TEST_ALWAYS_UNLOCK_ALL || data?.devUnlockAll === true

  const patch: Record<string, unknown> = {}
  let needUpdate = false

  if (!snap.exists()) {
    needUpdate = true
  }
  if (data?.schemaVersion !== 4) {
    patch.schemaVersion = 4
    needUpdate = true
  }
  if (!isPlanId(data?.plan) || data.plan !== plan) {
    patch.plan = plan
    needUpdate = true
  }
  if (TEST_ALWAYS_UNLOCK_ALL || JSON.stringify(rawSelected) !== JSON.stringify(selectedQuizTypes)) {
    patch.selectedQuizTypes = selectedQuizTypes
    needUpdate = true
  }
  if (!data?.billing || data?.billing?.currentPlan !== plan) {
    patch.billing = data?.billing ? { ...data.billing, currentPlan: plan } : defaultBilling(plan)
    needUpdate = true
  }
  if (typeof data?.entitledQuizTypes !== "undefined") {
    patch.entitledQuizTypes = entitledQuizTypes
    needUpdate = true
  }

  if (needUpdate) {
    patch.updatedAt = serverTimestamp()
    await setDoc(ref, patch, { merge: true })
  }

  return {
    plan,
    entitledQuizTypes,
    selectedQuizTypes,
    nextChangeAllowedAt,
    displayName,
    schemaVersion: 4,
    devUnlockAll,
  }
}

export async function saveSelectedQuizTypesWithLock(params: {
  uid: string
  selectedQuizTypes: QuizType[]
}): Promise<{ saved: QuizType[]; nextChangeAllowedAt: Date | null }> {
  const state = await loadAndRepairUserPlanState(params.uid)
  const normalized = normalizeSelectedForPlan(
    params.selectedQuizTypes,
    state.entitledQuizTypes,
    state.plan
  )

  const saved = normalized.length > 0 ? normalized : state.selectedQuizTypes
  const now = new Date()
  const isLocked = state.nextChangeAllowedAt ? now < state.nextChangeAllowedAt : false
  const next = isLocked ? state.nextChangeAllowedAt : addMonths(now, 1)

  const ref = doc(db, "users", params.uid)
  await setDoc(
    ref,
    {
      selectedQuizTypes: saved,
      nextChangeAllowedAt: next ? Timestamp.fromDate(next) : null,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  )

  return { saved, nextChangeAllowedAt: next }
}

export async function saveIndustryWithLock(params: {
  uid: string
  industry: string
}): Promise<{ saved: string; nextChangeAllowedAt: Date | null; locked: boolean }> {
  const state = await loadAndRepairUserPlanState(params.uid)
  const now = new Date()
  const isLocked = state.nextChangeAllowedAt ? now < state.nextChangeAllowedAt : false
  const next = isLocked ? state.nextChangeAllowedAt : addMonths(now, 1)

  const ref = doc(db, "users", params.uid)
  await setDoc(
    ref,
    {
      industry: params.industry,
      nextChangeAllowedAt: next ? Timestamp.fromDate(next) : null,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  )

  return { saved: params.industry, nextChangeAllowedAt: next, locked: isLocked }
}

export async function savePlanAndNormalizeSelected(params: {
  uid: string
  plan: PlanId
}): Promise<UserPlanState> {
  const ref = doc(db, "users", params.uid)
  const snap = await getDoc(ref)
  const data = snap.exists() ? (snap.data() as any) : {}

  const entitledQuizTypes = buildEntitledQuizTypes(params.plan)
  const rawSelected = Array.isArray(data?.selectedQuizTypes)
    ? (data.selectedQuizTypes as QuizType[])
    : []
  const selectedQuizTypes = normalizeSelectedForPlan(rawSelected, entitledQuizTypes, params.plan)

  await setDoc(
    ref,
    {
      plan: params.plan,
      schemaVersion: 4,
      selectedQuizTypes,
      entitledQuizTypes,
      billing: data?.billing
        ? { ...data.billing, currentPlan: params.plan }
        : defaultBilling(params.plan),
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  )

  return {
    plan: params.plan,
    entitledQuizTypes,
    selectedQuizTypes,
    nextChangeAllowedAt: toDateOrNull(data?.nextChangeAllowedAt),
    displayName: typeof data?.displayName === "string" ? data.displayName : "",
    schemaVersion: 4,
    devUnlockAll: data?.devUnlockAll === true,
  }
}
