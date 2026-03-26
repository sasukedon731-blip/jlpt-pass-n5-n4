import {
  collection,
  doc,
  getDoc,
  getDocs,
  getCountFromServer,
  limit,
  orderBy,
  query,
  setDoc,
  where,
  serverTimestamp,
} from "firebase/firestore"

import { db } from "@/app/lib/firebase"
import { isJlptQuizType, type QuizType } from "@/app/data/types"
import type { GameDifficulty, GameMode, GameQuestion, LeaderboardEntry } from "./types"

const GAME_DIFFICULTIES = ["N5", "N4", "N3", "N2", "N1"] as const
const GAME_TYPES = ["reading", "fill", "particle"] as const
const GAME_KINDS = ["tile-drop", "speed-choice", "flash-judge", "memory-burst", "sentence-build"] as const
const BEST_LEVELS = ["N5", "N4", "N3", "N2"] as const

function isGameDifficulty(value: unknown): value is GameDifficulty {
  return typeof value === "string" && (GAME_DIFFICULTIES as readonly string[]).includes(value)
}

function isGameQuestionType(value: unknown): value is GameQuestion["type"] {
  return typeof value === "string" && (GAME_TYPES as readonly string[]).includes(value)
}

function isGameKind(value: unknown): value is GameQuestion["kind"] {
  return typeof value === "string" && (GAME_KINDS as readonly string[]).includes(value)
}

function isBestLevel(value: unknown): value is NonNullable<LeaderboardEntry["bestLevel"]> {
  return typeof value === "string" && (BEST_LEVELS as readonly string[]).includes(value)
}

function inferKindFromPrompt(prompt: string): GameQuestion["kind"] {
  return /漢字|読み|よみ|ひらがな|カタカナ/.test(prompt) ? "speed-choice" : "tile-drop"
}

function toQuizType(value: unknown): QuizType | undefined {
  return isJlptQuizType(value) ? value : undefined
}

export async function fetchGameQuestions(params: {
  difficulty?: GameDifficulty
  mode: GameMode
  take?: number
}): Promise<GameQuestion[]> {
  const take = params.take ?? 60
  const col = collection(db, "gameQuestions")

  const q =
    params.mode === "normal" && params.difficulty
      ? query(col, where("enabled", "==", true), where("difficulty", "==", params.difficulty), limit(take))
      : query(col, where("enabled", "==", true), limit(take))

  const snap = await getDocs(q)
  const items: GameQuestion[] = []
  snap.forEach((d) => {
    const v = d.data() as Record<string, unknown> | undefined
    if (!v) return
    if (typeof v.prompt !== "string") return
    if (!Array.isArray(v.answer) || !Array.isArray(v.choices)) return
    if (!isGameDifficulty(v.difficulty) || !isGameQuestionType(v.type)) return

    items.push({
      id: d.id,
      kind: isGameKind(v.kind) ? v.kind : inferKindFromPrompt(v.prompt),
      type: v.type,
      prompt: v.prompt,
      answer: v.answer.map((x) => String(x)),
      choices: v.choices.map((x) => String(x)),
      difficulty: v.difficulty,
      enabled: Boolean(v.enabled),
      quizType: toQuizType(v.quizType),
      sectionId: typeof v.sectionId === "string" ? v.sectionId : undefined,
    })
  })
  return items
}

export async function submitAttackScore(params: {
  gameId: "tile-drop" | "flash-judge" | "memory-burst" | "speed-choice" | "sentence-build"
  uid: string
  displayName: string
  score: number
  bestLevel?: "N5" | "N4" | "N3" | "N2"
  bestStage?: number
}): Promise<{ bestScore: number }> {
  const ref = doc(db, "attackLeaderboards", params.gameId, "entries", params.uid)

  let prevBest = 0
  try {
    const snap = await getDoc(ref)
    if (snap.exists()) {
      const v = snap.data() as Record<string, unknown>
      prevBest = Number(v?.bestScore ?? 0) || 0
    }
  } catch {}

  const score = Number(params.score ?? 0) || 0
  const bestScore = Math.max(prevBest, score)

  try {
    await setDoc(
      ref,
      {
        uid: params.uid,
        displayName: params.displayName || "匿名",
        bestScore,
        lastScore: score,
        bestLevel: params.bestLevel ?? "N5",
        bestStage: params.bestStage ?? 0,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    )
  } catch (e: any) {
    const msg = String(e?.code || e?.message || e)
    if (msg.includes("permission") || msg.includes("PERMISSION_DENIED")) {
      throw new Error("PERMISSION_DENIED")
    }
    throw e
  }

  return { bestScore }
}

export async function fetchAttackLeaderboard(params: {
  gameId: "tile-drop" | "flash-judge" | "memory-burst" | "speed-choice" | "sentence-build"
  take?: number
}): Promise<LeaderboardEntry[]> {
  const take = params.take ?? 50
  const col = collection(db, "attackLeaderboards", params.gameId, "entries")
  const q = query(col, orderBy("bestScore", "desc"), limit(take))
  const snap = await getDocs(q)
  const items: LeaderboardEntry[] = []
  snap.forEach((d) => {
    const v = d.data() as Record<string, unknown> | undefined
    if (!v) return
    items.push({
      uid: typeof v.uid === "string" ? v.uid : d.id,
      displayName: typeof v.displayName === "string" ? v.displayName : "匿名",
      bestScore: Number(v.bestScore ?? 0),
      bestLevel: isBestLevel(v.bestLevel) ? v.bestLevel : "N5",
      bestStage: Number(v.bestStage ?? 0),
      updatedAt: v.updatedAt,
    })
  })
  return items
}

export async function fetchMyAttackRank(params: {
  gameId: "tile-drop" | "flash-judge" | "memory-burst" | "speed-choice" | "sentence-build"
  uid: string
}): Promise<{ rank: number | null; entry: LeaderboardEntry | null; bestScore: number }> {
  const ref = doc(db, "attackLeaderboards", params.gameId, "entries", params.uid)
  const snap = await getDoc(ref)
  if (!snap.exists()) return { rank: null, entry: null, bestScore: 0 }

  const v = snap.data() as Record<string, unknown>
  const bestScore = Number(v?.bestScore ?? 0) || 0

  const col = collection(db, "attackLeaderboards", params.gameId, "entries")
  const q = query(col, where("bestScore", ">", bestScore))
  const cnt = await getCountFromServer(q)

  const entry: LeaderboardEntry = {
    uid: typeof v?.uid === "string" ? v.uid : params.uid,
    displayName: typeof v?.displayName === "string" ? v.displayName : "匿名",
    bestScore,
    bestLevel: isBestLevel(v?.bestLevel) ? v.bestLevel : "N5",
    bestStage: Number(v?.bestStage ?? 0),
    updatedAt: v?.updatedAt ?? null,
  }

  return { rank: Number(cnt.data().count) + 1, entry, bestScore }
}
