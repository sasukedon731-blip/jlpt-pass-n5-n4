"use client"

import { useRouter, useSearchParams } from "next/navigation"
import QuizLayout from "@/app/components/QuizLayout"
import Button from "@/app/components/Button"
import type { QuizType } from "@/app/data/types"

function getMeta(type: string) {
  if (type === "japanese-n5") {
    return {
      title: "日本語検定 N5",
      badge: "N5",
      color: "#0f766e",
      note: "N5はプレースホルダー問題入り。あとから本番問題を追加しやすい構成です。",
    }
  }
  return {
    title: "日本語検定 N4",
    badge: "N4",
    color: "#4338ca",
    note: "N4は既存問題をベースに、そのまま学習・模擬・復習・ゲームへ進めます。",
  }
}

const games = [
  { kind: "tile-drop", label: "文字ブレイク" },
  { kind: "speed-choice", label: "スピード4択" },
  { kind: "flash-judge", label: "瞬間ジャッジ" },
  { kind: "memory-burst", label: "フラッシュ記憶" },
] as const

export default function SelectModeClient() {
  const router = useRouter()
  const params = useSearchParams()
  const raw = params.get("type")
  const type: QuizType = raw === "japanese-n5" ? "japanese-n5" : "japanese-n4"
  const meta = getMeta(type)

  return (
    <QuizLayout title="モード選択" subtitle={meta.title}>
      <div style={{ marginBottom: 12 }}>
        <span style={{ display: "inline-block", padding: "6px 10px", borderRadius: 999, border: "1px solid var(--border)", background: "white", fontWeight: 900 }}>
          <span style={{ color: meta.color }}>●</span> {meta.badge}
        </span>
      </div>

      <p style={{ marginTop: 0, lineHeight: 1.7, color: "#475569" }}>{meta.note}</p>

      <div style={{ display: "grid", gap: 10 }}>
        <Button variant="main" onClick={() => router.push(`/normal?type=${encodeURIComponent(type)}`)}>標準問題（Normal）</Button>
        <Button variant="accent" onClick={() => router.push(`/exam?type=${encodeURIComponent(type)}`)}>模擬試験（Exam）</Button>
        <Button variant="success" onClick={() => router.push(`/review?type=${encodeURIComponent(type)}`)}>復習（Review）</Button>
      </div>

      <div style={{ marginTop: 18, padding: 14, borderRadius: 16, border: "1px solid #e5e7eb", background: "#f8fafc" }}>
        <div style={{ fontWeight: 900, marginBottom: 10 }}>ゲーム</div>
        <div style={{ display: "grid", gap: 8 }}>
          {games.map((game) => (
            <Button key={game.kind} variant="sub" onClick={() => router.push(`/game/${game.kind}?type=${encodeURIComponent(type)}`)}>
              {game.label}
            </Button>
          ))}
        </div>
      </div>

      <div style={{ marginTop: 16, display: "grid", gap: 10 }}>
        <Button variant="sub" onClick={() => router.push(`/contents/${encodeURIComponent(type)}`)}>教材詳細</Button>
        <Button variant="main" onClick={() => router.push("/")}>TOPへ戻る</Button>
      </div>
    </QuizLayout>
  )
}
