"use client"

import React, { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { collection, getDocs } from "firebase/firestore"

import { useAuth } from "@/app/lib/useAuth"
import { db } from "@/app/lib/firebase"
import { getUserRole } from "@/app/lib/firestore"
import { quizCatalog } from "@/app/data/quizCatalog"

type Row = {
  uid: string
  email: string | null
  displayName: string | null
  role: string | null
}

export default function AdminPage() {
  const router = useRouter()
  const { user, loading } = useAuth()
  const [rows, setRows] = useState<Row[]>([])
  const [ready, setReady] = useState(false)
  const [keyword, setKeyword] = useState("")

  useEffect(() => {
    if (loading) return
    if (!user) {
      router.replace("/login")
      return
    }

    ;(async () => {
      const role = await getUserRole(user.uid)
      if (role !== "admin") {
        router.replace("/")
        return
      }

      const snap = await getDocs(collection(db, "users"))
      const next = snap.docs.map((d) => {
        const data = d.data() as any
        return {
          uid: d.id,
          email: data.email ?? null,
          displayName: data.displayName ?? null,
          role: data.role ?? null,
        }
      })
      setRows(next)
      setReady(true)
    })()
  }, [user, loading, router])

  const filtered = useMemo(() => {
    const q = keyword.trim().toLowerCase()
    if (!q) return rows
    return rows.filter((row) =>
      [row.displayName, row.email, row.uid].some((v) => (v ?? "").toLowerCase().includes(q))
    )
  }, [rows, keyword])

  if (loading || !ready) {
    return <p style={{ textAlign: "center", padding: 24 }}>読み込み中…</p>
  }

  return (
    <main style={styles.page}>
      <div style={styles.shell}>
        <section style={styles.hero}>
          <div>
            <div style={styles.eyebrow}>ADMIN</div>
            <h1 style={styles.h1}>企業用 管理ダッシュボード</h1>
            <p style={styles.lead}>N5 / N4 特化アプリ向けに、見る場所を絞ったシンプルな管理画面です。</p>
          </div>
          <Link href="/" style={styles.linkBtn}>TOPへ戻る</Link>
        </section>

        <section style={styles.kpiGrid}>
          <div style={styles.kpiCard}><div style={styles.kpiLabel}>登録ユーザー</div><div style={styles.kpiValue}>{rows.length}</div></div>
          <div style={styles.kpiCard}><div style={styles.kpiLabel}>教材数</div><div style={styles.kpiValue}>{quizCatalog.length}</div></div>
          <div style={styles.kpiCard}><div style={styles.kpiLabel}>対象レベル</div><div style={styles.kpiValue}>N5 / N4</div></div>
        </section>

        <section style={styles.panel}>
          <div style={styles.panelHead}>
            <div>
              <div style={styles.panelTitle}>ユーザー一覧</div>
              <div style={styles.panelSub}>名前・メール・UID で検索できます。</div>
            </div>
            <input value={keyword} onChange={(e) => setKeyword(e.target.value)} placeholder="検索" style={styles.search} />
          </div>

          <div style={styles.tableWrap}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>名前</th>
                  <th style={styles.th}>メール</th>
                  <th style={styles.th}>権限</th>
                  <th style={styles.th}>詳細</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((row) => (
                  <tr key={row.uid}>
                    <td style={styles.td}>{row.displayName ?? "-"}</td>
                    <td style={styles.td}>{row.email ?? "-"}</td>
                    <td style={styles.td}>{row.role ?? "user"}</td>
                    <td style={styles.td}><Link href={`/admin/${row.uid}`} style={styles.inlineLink}>見る</Link></td>
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
  hero: { background: "linear-gradient(135deg, #ffffff 0%, #eef2ff 100%)", border: "1px solid #dbe4ff", borderRadius: 24, padding: 24, display: "flex", justifyContent: "space-between", gap: 12, alignItems: "flex-start", flexWrap: "wrap" },
  eyebrow: { fontSize: 12, fontWeight: 800, color: "#4338ca" },
  h1: { margin: "8px 0 0", fontSize: 30 },
  lead: { marginTop: 10, color: "#475569", lineHeight: 1.7 },
  linkBtn: { border: "1px solid #cbd5e1", background: "white", borderRadius: 12, padding: "10px 14px", textDecoration: "none", color: "#0f172a", fontWeight: 800 },
  kpiGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12 },
  kpiCard: { background: "white", border: "1px solid #e2e8f0", borderRadius: 18, padding: 18 },
  kpiLabel: { color: "#64748b", fontSize: 13 },
  kpiValue: { marginTop: 10, fontWeight: 900, fontSize: 28 },
  panel: { background: "white", border: "1px solid #e2e8f0", borderRadius: 22, padding: 18 },
  panelHead: { display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", alignItems: "center", marginBottom: 14 },
  panelTitle: { fontSize: 20, fontWeight: 900 },
  panelSub: { marginTop: 4, color: "#64748b" },
  search: { minWidth: 260, border: "1px solid #cbd5e1", borderRadius: 12, padding: "10px 12px" },
  tableWrap: { overflowX: "auto" },
  table: { width: "100%", borderCollapse: "collapse" },
  th: { textAlign: "left", padding: "12px 10px", borderBottom: "1px solid #e2e8f0", color: "#475569", fontSize: 13 },
  td: { padding: "14px 10px", borderBottom: "1px solid #f1f5f9" },
  inlineLink: { color: "#1d4ed8", fontWeight: 800, textDecoration: "none" },
}
