"use client"

import { useRouter } from "next/navigation"
import AppHeader from "@/app/components/AppHeader"
import Button from "@/app/components/Button"

const cards = [
  {
    id: "japanese-n5",
    badge: "N5",
    title: "日本語検定 N5",
    description: "N5問題はあとからどんどん追加できるように、文字・語彙・文法・読解・聴解の箱を先に用意しています。",
  },
  {
    id: "japanese-n4",
    badge: "N4",
    title: "日本語検定 N4",
    description: "N4の既存問題をそのまま活かしつつ、通常学習・模擬試験・復習・ゲームで横断的に学べます。",
  },
] as const

const gameCards = [
  { kind: "tile-drop", title: "文字ブレイク", desc: "落ちてくる選択肢を崩しながら反復" },
  { kind: "speed-choice", title: "スピード4択", desc: "短時間で語彙と文法を判断" },
  { kind: "flash-judge", title: "瞬間ジャッジ", desc: "正誤判断をテンポ良く鍛える" },
  { kind: "memory-burst", title: "フラッシュ記憶", desc: "記憶してから答える反復ゲーム" },
] as const

export default function HomePage() {
  const router = useRouter()

  return (
    <main style={styles.page}>
      <div style={styles.shell}>
        <AppHeader title="日本語検定合格学習アプリ" />

        <section style={styles.hero}>
          <div style={styles.heroBadge}>JLPT PASS</div>
          <h1 style={styles.h1}>日本語検定合格学習アプリ</h1>
          <p style={styles.lead}>
            N5 / N4 に特化した学習プラットフォームです。業種選択をなくし、
            合格に必要な学習だけをすぐ始められる構成に整理しました。
            通常学習・模擬試験・復習・ゲームを1つの導線にまとめています。
          </p>

          <div style={styles.heroActions}>
            <Button variant="main" onClick={() => router.push("/select-mode?type=japanese-n5")}>N5を始める</Button>
            <Button variant="success" onClick={() => router.push("/select-mode?type=japanese-n4")}>N4を始める</Button>
            <Button variant="accent" onClick={() => router.push("/game")}>ゲーム一覧</Button>
          </div>
        </section>

        <section style={styles.grid}>
          {cards.map((card) => (
            <div key={card.id} style={styles.card}>
              <div style={styles.cardBadge}>{card.badge}</div>
              <div style={styles.cardTitle}>{card.title}</div>
              <div style={styles.cardDesc}>{card.description}</div>
              <div style={styles.cardActions}>
                <Button variant="main" onClick={() => router.push(`/select-mode?type=${card.id}`)}>学習モードへ</Button>
                <Button variant="sub" onClick={() => router.push(`/contents/${card.id}`)}>教材詳細</Button>
              </div>
            </div>
          ))}
        </section>

        <section style={styles.gameWrap}>
          <div style={styles.sectionHead}>
            <div>
              <div style={styles.sectionBadge}>GAME</div>
              <h2 style={styles.sectionTitle}>ゲームで定着</h2>
            </div>
            <Button variant="accent" onClick={() => router.push("/game")}>ゲームTOPへ</Button>
          </div>

          <div style={styles.gameGrid}>
            {gameCards.map((game) => (
              <div key={game.kind} style={styles.gameCard}>
                <div style={styles.gameTitle}>{game.title}</div>
                <div style={styles.gameDesc}>{game.desc}</div>
                <Button variant="sub" onClick={() => router.push(`/game/${game.kind}`)}>このゲームを見る</Button>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  )
}

const styles: Record<string, React.CSSProperties> = {
  page: { minHeight: "100vh", background: "#f7f8fc", padding: 20 },
  shell: { maxWidth: 1100, margin: "0 auto", display: "grid", gap: 18 },
  hero: {
    background: "linear-gradient(135deg, #ffffff 0%, #eef2ff 100%)",
    border: "1px solid #dbe4ff",
    borderRadius: 24,
    padding: 24,
    boxShadow: "0 12px 30px rgba(37, 99, 235, 0.08)",
  },
  heroBadge: {
    display: "inline-block",
    padding: "6px 10px",
    borderRadius: 999,
    background: "#111827",
    color: "#fff",
    fontSize: 12,
    fontWeight: 800,
    marginBottom: 12,
  },
  h1: { margin: 0, fontSize: 34, lineHeight: 1.2 },
  lead: { marginTop: 12, fontSize: 15, lineHeight: 1.8, color: "#475569", maxWidth: 780 },
  heroActions: { display: "flex", gap: 10, flexWrap: "wrap", marginTop: 16 },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 14 },
  card: { background: "#fff", border: "1px solid #e5e7eb", borderRadius: 20, padding: 18, boxShadow: "0 10px 24px rgba(0,0,0,0.05)", display: "grid", gap: 10 },
  cardBadge: { display: "inline-block", width: "fit-content", padding: "5px 10px", borderRadius: 999, background: "#eff6ff", color: "#1d4ed8", fontWeight: 800, fontSize: 12 },
  cardTitle: { fontSize: 22, fontWeight: 900 },
  cardDesc: { fontSize: 14, lineHeight: 1.7, color: "#475569" },
  cardActions: { display: "flex", gap: 10, flexWrap: "wrap" },
  gameWrap: { background: "#fff", border: "1px solid #e5e7eb", borderRadius: 24, padding: 18, boxShadow: "0 10px 24px rgba(0,0,0,0.04)", display: "grid", gap: 14 },
  sectionHead: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" },
  sectionBadge: { display: "inline-block", width: "fit-content", padding: "5px 10px", borderRadius: 999, background: "#fff7ed", color: "#c2410c", fontWeight: 800, fontSize: 12 },
  sectionTitle: { margin: "8px 0 0", fontSize: 24 },
  gameGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12 },
  gameCard: { background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 18, padding: 16, display: "grid", gap: 10 },
  gameTitle: { fontSize: 18, fontWeight: 900 },
  gameDesc: { color: "#475569", lineHeight: 1.7, minHeight: 48 },
}
