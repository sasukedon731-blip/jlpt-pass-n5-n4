"use client"

import Link from "next/link"
import { useMemo, useState } from "react"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import styles from "./gameKind.module.css"
import type { JlptQuizType } from "@/app/data/types"

const levels: JlptQuizType[] = ["japanese-n5", "japanese-n4"]

type Mode = "normal" | "attack"

type Meta = {
  title: string
  desc: string
  rules: string[]
}

const META_BY_KIND: Record<string, Meta> = {
  "tile-drop": {
    title: "文字ブレイク",
    desc: "落ちてくる選択肢をテンポ良く選んで、日本語を反復する専用モードです。",
    rules: ["3ミスで終了", "N5 / N4 を切り替えてプレイ可能", "語彙と文法の定着に向いています"],
  },
  "speed-choice": {
    title: "スピード4択",
    desc: "素早く正解を選び続けることで、試験で迷わない判断力を鍛えます。",
    rules: ["制限時間内に連続回答", "N5 / N4 を切り替えてプレイ可能", "短い反復学習に向いています"],
  },
  "flash-judge": {
    title: "瞬間ジャッジ",
    desc: "短文の正誤をすばやく判定し、文法感覚を磨くゲームです。",
    rules: ["テンポ重視の正誤判定", "N5 / N4 を切り替えてプレイ可能", "模擬試験前のウォームアップに最適"],
  },
  "memory-burst": {
    title: "フラッシュ記憶",
    desc: "一瞬見た内容を覚えて答えることで、語彙の保持と再現力を鍛えます。",
    rules: ["記憶してから4択に回答", "N5 / N4 を切り替えてプレイ可能", "語彙の定着に向いています"],
  },
}

export default function GameKindClient() {
  const router = useRouter()
  const params = useParams<{ kind: string }>()
  const searchParams = useSearchParams()
  const rawType = searchParams.get("type")
  const rawMode = searchParams.get("mode")

  const kind = typeof params?.kind === "string" ? params.kind : "tile-drop"
  const meta = META_BY_KIND[kind] ?? META_BY_KIND["tile-drop"]

  const [quizType, setQuizType] = useState<JlptQuizType>(rawType === "japanese-n5" ? "japanese-n5" : "japanese-n4")
  const [mode, setMode] = useState<Mode>(rawMode === "attack" ? "attack" : "normal")

  const title = useMemo(() => (quizType === "japanese-n5" ? "N5" : "N4"), [quizType])

  function goPlay() {
    const qs = new URLSearchParams({ kind, type: quizType, mode, autostart: "1" })
    router.push(`/game/play?${qs.toString()}`)
  }

  return (
    <main className={styles.wrap}>
      <div className={styles.topRow}>
        <Link href="/game" className={styles.back}>← ゲームTOP</Link>
      </div>

      <div className={styles.title}>{meta.title}</div>
      <div className={styles.desc}>{meta.desc}</div>

      <ul className={styles.ruleList}>
        {meta.rules.map((rule) => <li key={rule}>{rule}</li>)}
      </ul>

      <section className={styles.card}>
        <div className={styles.label}>モード</div>
        <div className={styles.seg}>
          <button type="button" className={`${styles.segBtn} ${mode === "normal" ? styles.segBtnActive : ""}`} onClick={() => setMode("normal")}>ノーマル</button>
          <button type="button" className={`${styles.segBtn} ${mode === "attack" ? styles.segBtnActive : ""}`} onClick={() => setMode("attack")}>アタック</button>
        </div>

        <div style={{ marginTop: 12 }}>
          <div className={styles.label}>レベル</div>
          <div className={styles.seg}>
            {levels.map((lv) => (
              <button key={lv} type="button" className={`${styles.segBtn} ${quizType === lv ? styles.segBtnActive : ""}`} onClick={() => setQuizType(lv)}>
                {lv === "japanese-n5" ? "N5" : "N4"}
              </button>
            ))}
          </div>
          <div className={styles.help}>現在の選択: {title}</div>
        </div>

        <div className={styles.actions}>
          <button type="button" className={`${styles.btn} ${styles.btnMain}`} onClick={goPlay}>プレイ開始</button>
        </div>
      </section>
    </main>
  )
}
