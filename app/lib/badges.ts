import { quizCatalog } from "@/app/data/quizCatalog"

export type BadgeRarity = "common" | "rare" | "epic" | "legend"
export type BadgeGroup = "battle" | "study" | "streak" | "score"

export type BadgeDef = {
  id: string
  icon: string
  label: string
  description: string
  howToUnlock: string
  rarity: BadgeRarity
  group: BadgeGroup
  hidden?: boolean
  image?: string
  order: number
}

type UnlockState = {
  totalAnswers?: number
  gamePlays?: number
  attackPlays?: number
  tileDropClears?: number
  flashJudgeClears?: number
  memoryBurstClears?: number
  examClears?: number
  reviewPlays?: number
  maxScore?: number
  streak?: number
}

export function getPerfectBadgeId(quizType: string) {
  return `perfect-${quizType}`
}

function quizTitle(quizType: string) {
  return quizCatalog.find((q) => q.id === quizType)?.title ?? quizType
}

function buildImagePath(group: BadgeGroup, id: string) {
  return `/badges/generated/${group}-${id}.svg`
}

export const BADGES: BadgeDef[] = [
  {
    id: "study-first-answer",
    icon: "📘",
    image: buildImagePath("study", "study-first-answer"),
    label: "はじめの1問",
    description: "最初の1問に挑戦",
    howToUnlock: "通常学習か模擬試験で1問解く",
    rarity: "common",
    group: "study",
    order: 1,
  },
  {
    id: "exam-first-clear",
    icon: "✅",
    image: buildImagePath("study", "exam-first-clear"),
    label: "模擬デビュー",
    description: "模擬試験を初完了",
    howToUnlock: "模擬試験を1回完了する",
    rarity: "common",
    group: "study",
    order: 2,
  },
  {
    id: "review-first-play",
    icon: "🔁",
    image: buildImagePath("study", "review-first-play"),
    label: "復習スタート",
    description: "復習モードに初挑戦",
    howToUnlock: "復習モードを1回プレイ",
    rarity: "common",
    group: "study",
    order: 3,
  },
  {
    id: "battle-first-play",
    icon: "🎮",
    image: buildImagePath("battle", "battle-first-play"),
    label: "ゲーム挑戦者",
    description: "どれかのゲームを初プレイ",
    howToUnlock: "ゲームを1回プレイする",
    rarity: "common",
    group: "battle",
    order: 10,
  },
  {
    id: "battle-attack-first",
    icon: "🏁",
    image: buildImagePath("battle", "battle-attack-first"),
    label: "アタック開始",
    description: "アタックモードに初挑戦",
    howToUnlock: "アタックを1回プレイする",
    rarity: "common",
    group: "battle",
    order: 11,
  },
  {
    id: "battle-regular",
    icon: "🔥",
    image: buildImagePath("battle", "battle-regular"),
    label: "ゲーム継続中",
    description: "ゲームをしっかり継続",
    howToUnlock: "ゲームを合計10回プレイする",
    rarity: "rare",
    group: "battle",
    order: 12,
  },
  {
    id: "study-streak-7",
    icon: "📅",
    image: buildImagePath("streak", "study-streak-7"),
    label: "7日継続",
    description: "学習を1週間続けた",
    howToUnlock: "連続学習日数7日を達成する",
    rarity: "rare",
    group: "streak",
    order: 20,
  },
  {
    id: "study-streak-30",
    icon: "🏆",
    image: buildImagePath("streak", "study-streak-30"),
    label: "30日継続",
    description: "学習を30日続けた",
    howToUnlock: "連続学習日数30日を達成する",
    rarity: "epic",
    group: "streak",
    order: 21,
  },
  {
    id: "score-90",
    icon: "⭐",
    image: buildImagePath("score", "score-90"),
    label: "高得点",
    description: "高得点を達成",
    howToUnlock: "模擬試験または学習で90点以上を達成する",
    rarity: "rare",
    group: "score",
    order: 30,
  },
]

const perfectBadges: BadgeDef[] = quizCatalog.map((quiz, index) => ({
  id: getPerfectBadgeId(quiz.id),
  icon: "👑",
  image: buildImagePath("score", getPerfectBadgeId(quiz.id)),
  label: `${quiz.title} 満点`,
  description: `${quiz.title} で満点を達成`,
  howToUnlock: `${quizTitle(quiz.id)}で100%を達成する`,
  rarity: "legend",
  group: "score",
  order: 100 + index,
}))

export const BADGE_MAP: Record<string, BadgeDef> = Object.fromEntries([...BADGES, ...perfectBadges].map((badge) => [badge.id, badge]))

export function getBadgeMeta(id: string) {
  return BADGE_MAP[id] ?? null
}

export function listBadgeDefs() {
  return [...BADGES, ...perfectBadges].sort((a, b) => a.order - b.order)
}

export function evaluateBadgeUnlocks(state: UnlockState) {
  const unlocked = new Set<string>()

  if ((state.totalAnswers ?? 0) >= 1) unlocked.add("study-first-answer")
  if ((state.examClears ?? 0) >= 1) unlocked.add("exam-first-clear")
  if ((state.reviewPlays ?? 0) >= 1) unlocked.add("review-first-play")
  if ((state.gamePlays ?? 0) >= 1) unlocked.add("battle-first-play")
  if ((state.attackPlays ?? 0) >= 1) unlocked.add("battle-attack-first")
  if ((state.gamePlays ?? 0) >= 10) unlocked.add("battle-regular")
  if ((state.streak ?? 0) >= 7) unlocked.add("study-streak-7")
  if ((state.streak ?? 0) >= 30) unlocked.add("study-streak-30")
  if ((state.maxScore ?? 0) >= 90) unlocked.add("score-90")

  return Array.from(unlocked)
}


export function getTotalBadgeCount() {
  return listBadgeDefs().length
}

export function getUnlockedBadgeCount(ids: string[]) {
  const set = new Set(ids)
  return listBadgeDefs().filter((b) => set.has(b.id)).length
}

export function getPreviewBadgeMeta(ids: string[], limit = 6) {
  const defs = listBadgeDefs()
  const set = new Set(ids)
  return defs.filter((b) => set.has(b.id)).slice(0, limit)
}

export function getRarityColors(rarity: BadgeRarity): {
  bg: string
  fg: string
  border: string
  glow: string
} {
  switch (rarity) {
    case "legend":
      return {
        bg: "linear-gradient(135deg, #fef3c7 0%, #fff7ed 100%)",
        fg: "#9a3412",
        border: "#fdba74",
        glow: "rgba(245, 158, 11, 0.28)",
      }
    case "epic":
      return {
        bg: "linear-gradient(135deg, #f3e8ff 0%, #faf5ff 100%)",
        fg: "#7e22ce",
        border: "#d8b4fe",
        glow: "rgba(147, 51, 234, 0.24)",
      }
    case "rare":
      return {
        bg: "linear-gradient(135deg, #dbeafe 0%, #eff6ff 100%)",
        fg: "#1d4ed8",
        border: "#93c5fd",
        glow: "rgba(59, 130, 246, 0.22)",
      }
    default:
      return {
        bg: "linear-gradient(135deg, #eef2f7 0%, #f8fafc 100%)",
        fg: "#334155",
        border: "#cbd5e1",
        glow: "rgba(100, 116, 139, 0.18)",
      }
  }
}
// =========================
// 追加（不足関数の補完）
// =========================

// achievementUnlock.ts 用
export function computeUnlockedBadges(
  currentBadges: string[],
  state: any
) {
  const unlocked = evaluateBadgeUnlocks(state)
  return unlocked.filter((id) => !currentBadges.includes(id))
}

// 実績ページ用
export function getAllBadgeMeta(unlockedIds: string[]) {
  const set = new Set(unlockedIds)
  return listBadgeDefs().map((b) => ({
    ...b,
    unlocked: set.has(b.id),
  }))
}

// グループ表示名
export function getBadgeGroupLabel(group: string) {
  switch (group) {
    case "battle":
      return "ゲーム"
    case "study":
      return "学習"
    case "streak":
      return "継続"
    case "score":
      return "スコア"
    default:
      return group
  }
}
// ラベル取得（Exam用）
export function getBadgeLabelFromBadgeId(id: string) {
  const def = listBadgeDefs().find((b) => b.id === id)
  return def?.label ?? id
}