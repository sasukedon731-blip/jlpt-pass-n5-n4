"use client"

import { useMemo } from "react"
import { useRouter } from "next/navigation"
import Button from "@/app/components/Button"
import { quizCatalog } from "@/app/data/quizCatalog"

export default function ContentsPage() {
  const router = useRouter()
  const quizzes = useMemo(() => quizCatalog.filter((q) => q.enabled).sort((a, b) => (a.order ?? 999) - (b.order ?? 999)), [])

  return (
    <main style={styles.page}>
      <div style={styles.shell}>
        <header style={styles.header}>
          <div>
            <h1 style={styles.h1}>教材一覧</h1>
            <p style={styles.sub}>このアプリでは N5 / N4 の教材だけを表示しています。</p>
          </div>
          <div style={styles.actions}>
            <Button variant="sub" onClick={() => router.push("/")}>TOPへ</Button>
            <Button variant="accent" onClick={() => router.push("/game")}>ゲーム一覧</Button>
          </div>
        </header>
        <section style={styles.grid}>
          {quizzes.map((q) => (
            <div key={q.id} style={styles.card} onClick={() => router.push(`/contents/${q.id}`)} role="button" tabIndex={0}>
              <div style={styles.title}>{q.title}</div>
              <div style={styles.desc}>{q.description ?? ""}</div>
              <div style={styles.meta}>詳しく見る →</div>
            </div>
          ))}
        </section>
      </div>
    </main>
  )
}

const styles: Record<string, React.CSSProperties> = {
  page: { minHeight: "100vh", background: "#f8fafc", padding: 18 },
  shell: { maxWidth: 960, margin: "0 auto" },
  header: { display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, flexWrap: "wrap", marginBottom: 18 },
  h1: { margin: 0, fontSize: 28 },
  sub: { marginTop: 8, lineHeight: 1.7, color: "#64748b" },
  actions: { display: "flex", gap: 10, flexWrap: "wrap" },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 14 },
  card: { background: "white", border: "1px solid #e5e7eb", borderRadius: 18, padding: 16, boxShadow: "0 8px 20px rgba(0,0,0,0.04)", cursor: "pointer" },
  title: { fontSize: 20, fontWeight: 900 },
  desc: { marginTop: 8, lineHeight: 1.7, color: "#475569", minHeight: 70 },
  meta: { marginTop: 10, fontWeight: 800, color: "#1d4ed8" },
}
