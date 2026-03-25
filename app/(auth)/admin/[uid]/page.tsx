"use client"

import { useEffect, useMemo, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { collection, doc, getDoc, getDocs, limit, orderBy, query } from "firebase/firestore"

import { useAuth } from "@/app/lib/useAuth"
import { db } from "@/app/lib/firebase"
import { getUserRole } from "@/app/lib/firestore"
import { quizCatalog } from "@/app/data/quizCatalog"

type QuizResult = {
  score: number
  total: number
  accuracy?: number
  mode?: string
  quizType?: string
  createdAt?: { seconds: number } | null
}

type StudyProgress = {
  totalSessions: number
  todaySessions: number
  lastStudyDate: string
  streak: number
  bestStreak: number
}

type UserProfile = {
  email?: string | null
  displayName?: string | null
  role?: "admin" | "user"
}

const QUIZ_TYPES = quizCatalog.map((q) => q.id)

function label(t?: string) {
  if (t === "japanese-n5") return "N5"
  if (t === "japanese-n4") return "N4"
  return "-"
}

function formatDateSeconds(seconds?: number) {
  if (!seconds) return "-"
  return new Date(seconds * 1000).toLocaleString()
}

function safeProgress(p: any): StudyProgress {
  return {
    totalSessions: typeof p?.totalSessions === "number" ? p.totalSessions : 0,
    todaySessions: typeof p?.todaySessions === "number" ? p.todaySessions : 0,
    lastStudyDate: typeof p?.lastStudyDate === "string" ? p.lastStudyDate : "-",
    streak: typeof p?.streak === "number" ? p.streak : 0,
    bestStreak: typeof p?.bestStreak === "number" ? p.bestStreak : 0,
  }
}

export default function AdminUserPage() {
  const router = useRouter()
  const params = useParams<{ uid: string }>()
  const uid = params?.uid
  const { user, loading } = useAuth()

  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [progress, setProgress] = useState<Record<string, StudyProgress | null>>({})
  const [results, setResults] = useState<QuizResult[]>([])
  const [ready, setReady] = useState(false)

  useEffect(() => {
    if (loading) return
    if (!user) {
      router.replace("/login")
      return
    }
    if (!uid) return

    ;(async () => {
      const role = await getUserRole(user.uid)
      if (role !== "admin") {
        router.replace("/")
        return
      }

      const profileSnap = await getDoc(doc(db, "users", uid))
      setProfile(profileSnap.exists() ? (profileSnap.data() as UserProfile) : null)

      const nextProgress: Record<string, StudyProgress | null> = {}
      await Promise.all(
        QUIZ_TYPES.map(async (t) => {
          const snap = await getDoc(doc(db, "users", uid, "progress", t))
          nextProgress[t] = snap.exists() ? safeProgress(snap.data()) : null
        })
      )
      setProgress(nextProgress)

      const resSnap = await getDocs(query(collection(db, "users", uid, "results"), orderBy("createdAt", "desc"), limit(50)))
      setResults(resSnap.docs.map((d) => d.data() as QuizResult))
      setReady(true)
    })()
  }, [user, loading, uid, router])

  const summary = useMemo(() => {
    const total = results.length
    if (total === 0) return { attempts: 0, avg: 0 }
    const avg = results.reduce((sum, r) => sum + (typeof r.score === "number" ? r.score : 0), 0) / total
    return { attempts: total, avg }
  }, [results])

  if (loading || !ready) {
    return <p style={{ textAlign: "center", padding: 24 }}>読み込み中…</p>
  }

  return (
    <main style={styles.page}>
      <div style={styles.shell}>
        <button onClick={() => router.push("/admin")} style={styles.backBtn}>← 管理画面へ戻る</button>

        <section style={styles.hero}>
          <div>
            <h1 style={styles.h1}>{profile?.displayName ?? "ユーザー詳細"}</h1>
            <div style={styles.meta}>メール: {profile?.email ?? "-"}</div>
            <div style={styles.meta}>権限: {profile?.role ?? "user"}</div>
            <div style={styles.meta}>UID: {uid}</div>
          </div>
          <div style={styles.kpiBox}>
            <div style={styles.kpi}><span>直近結果数</span><strong>{summary.attempts}</strong></div>
            <div style={styles.kpi}><span>平均スコア</span><strong>{summary.avg.toFixed(1)}</strong></div>
          </div>
        </section>

        <section style={styles.grid}>
          {quizCatalog.map((quiz) => {
            const p = progress[quiz.id]
            return (
              <div key={quiz.id} style={styles.card}>
                <div style={styles.cardTitle}>{quiz.title}</div>
                <div style={styles.cardRow}>総学習回数: {p?.totalSessions ?? 0}</div>
                <div style={styles.cardRow}>今日の回数: {p?.todaySessions ?? 0}</div>
                <div style={styles.cardRow}>連続日数: {p?.streak ?? 0}</div>
                <div style={styles.cardRow}>最長連続: {p?.bestStreak ?? 0}</div>
                <div style={styles.cardRow}>最終学習日: {p?.lastStudyDate ?? "-"}</div>
              </div>
            )
          })}
        </section>

        <section style={styles.panel}>
          <div style={styles.panelTitle}>直近の学習結果</div>
          <div style={styles.tableWrap}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>教材</th>
                  <th style={styles.th}>モード</th>
                  <th style={styles.th}>点数</th>
                  <th style={styles.th}>日時</th>
                </tr>
              </thead>
              <tbody>
                {results.map((r, i) => (
                  <tr key={`${r.quizType}-${i}`}>
                    <td style={styles.td}>{label(r.quizType)}</td>
                    <td style={styles.td}>{r.mode ?? "-"}</td>
                    <td style={styles.td}>{typeof r.score === "number" ? `${r.score}/${r.total ?? 0}` : "-"}</td>
                    <td style={styles.td}>{formatDateSeconds(r.createdAt?.seconds)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  )
}

const styles: Record<string, React.CSSProperties> = {
  page: { minHeight: "100vh", background: "#f8fafc", padding: 20 },
  shell: { maxWidth: 1180, margin: "0 auto", display: "grid", gap: 16 },
  backBtn: { width: "fit-content", padding: "10px 14px", borderRadius: 12, border: "1px solid #cbd5e1", background: "white", cursor: "pointer", fontWeight: 800 },
  hero: { background: "white", border: "1px solid #e2e8f0", borderRadius: 24, padding: 24, display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap" },
  h1: { margin: 0, fontSize: 28 },
  meta: { marginTop: 8, color: "#475569" },
  kpiBox: { display: "grid", gap: 10, minWidth: 220 },
  kpi: { background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 16, padding: 14, display: "flex", justifyContent: "space-between", alignItems: "center" },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 12 },
  card: { background: "white", border: "1px solid #e2e8f0", borderRadius: 18, padding: 16, display: "grid", gap: 8 },
  cardTitle: { fontWeight: 900, fontSize: 18, marginBottom: 4 },
  cardRow: { color: "#475569" },
  panel: { background: "white", border: "1px solid #e2e8f0", borderRadius: 22, padding: 18 },
  panelTitle: { fontSize: 20, fontWeight: 900, marginBottom: 12 },
  tableWrap: { overflowX: "auto" },
  table: { width: "100%", borderCollapse: "collapse" },
  th: { textAlign: "left", padding: "12px 10px", borderBottom: "1px solid #e2e8f0", color: "#475569", fontSize: 13 },
  td: { padding: "14px 10px", borderBottom: "1px solid #f1f5f9" },
}
