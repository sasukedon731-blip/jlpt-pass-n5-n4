"use client"

import { useRouter } from "next/navigation"
import AppHeader from "@/app/components/AppHeader"
import styles from "./gameTop.module.css"

const games = [
  {
    kind: "tile-drop",
    title: "文字ブレイク",
    desc: "落ちてくる選択肢を正しく選んで崩す、反復重視の定番ゲーム。",
    tags: ["N5 / N4", "落ちゲー", "反復"],
  },
  {
    kind: "speed-choice",
    title: "スピード4択",
    desc: "テンポ良く4択を解いて、語彙と文法の判断を速くするゲーム。",
    tags: ["N5 / N4", "4択", "瞬発力"],
  },
  {
    kind: "flash-judge",
    title: "瞬間ジャッジ",
    desc: "短い文を見て正誤をすばやく判断する、試験対策向けゲーム。",
    tags: ["N5 / N4", "正誤判定", "試験感覚"],
  },
  {
    kind: "memory-burst",
    title: "フラッシュ記憶",
    desc: "見て覚えて答える流れで、語彙の保持と再現を鍛えるゲーム。",
    tags: ["N5 / N4", "記憶", "定着"],
  },
] as const

export default function GameTopClient() {
  const router = useRouter()

  return (
    <main className={styles.wrap}>
      <AppHeader />

      <section className={styles.head}>
        <h1 className={styles.h1}>ゲーム</h1>
        <p className={styles.lead}>この別アプリでは、N5 / N4 専用にゲームをまとめ直しています。</p>
      </section>

      <section className={styles.cards}>
        {games.map((game) => (
          <div key={game.kind} className={styles.card}>
            <div className={styles.cardTop}>
              <div className={styles.cardTitle}>{game.title}</div>
              <div className={styles.cardDesc}>{game.desc}</div>
              <div className={styles.tags}>
                {game.tags.map((tag) => (
                  <span key={tag} className={styles.tag}>{tag}</span>
                ))}
              </div>
            </div>
            <div className={styles.actions}>
              <button type="button" className={`${styles.btn} ${styles.btnMain}`} onClick={() => router.push(`/game/${game.kind}`)}>
                チャレンジ
              </button>
            </div>
          </div>
        ))}
      </section>
    </main>
  )
}
