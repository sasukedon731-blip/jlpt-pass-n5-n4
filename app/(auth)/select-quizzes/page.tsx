"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { onAuthStateChanged } from "firebase/auth"

import { auth } from "@/app/lib/firebase"
import { quizzes } from "@/app/data/quizzes"
import type { QuizType } from "@/app/data/types"
import { getSelectLimit, type PlanId } from "@/app/lib/plan"
import {
  loadAndRepairUserPlanState,
  saveSelectedQuizTypesWithLock,
} from "@/app/lib/userPlanState"
import AppHeader from "@/app/components/AppHeader"

function canChange(now: Date, nextAllowedAt?: Date | null) {
  if (!nextAllowedAt) return true
  return now.getTime() >= nextAllowedAt.getTime()
}

function formatDate(d: Date) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")
  return `${y}/${m}/${day}`
}

const JLPT_IDS: QuizType[] = ["japanese-n5", "japanese-n4"]

export default function SelectQuizzesPage() {
  const router = useRouter()

  const [uid, setUid] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  const [plan, setPlan] = useState<PlanId>("trial")
  const [selected, setSelected] = useState<QuizType[]>([])
  const [entitled, setEntitled] = useState<QuizType[]>(JLPT_IDS)
  const [nextAllowedAt, setNextAllowedAt] = useState<Date | null>(null)
  const [devUnlockAll, setDevUnlockAll] = useState(false)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      if (!u) {
        router.replace("/login")
        return
      }
      setUid(u.uid)
    })
    return () => unsub()
  }, [router])

  useEffect(() => {
    ;(async () => {
      if (!uid) return
      setLoading(true)
      setError("")
      try {
        const state = await loadAndRepairUserPlanState(uid)
        setPlan(state.plan)
        setSelected(state.selectedQuizTypes)
        setEntitled(
          state.entitledQuizTypes.filter((id) => JLPT_IDS.includes(id)) as QuizType[]
        )
        setNextAllowedAt(state.nextChangeAllowedAt)
        setDevUnlockAll(state.devUnlockAll === true)
      } catch (e) {
        console.error(e)
        setError("読み込みに失敗しました")
      } finally {
        setLoading(false)
      }
    })()
  }, [uid])

  const now = new Date()
  const changeOk = devUnlockAll ? true : canChange(now, nextAllowedAt)
  const limit = useMemo(() => (devUnlockAll ? entitled.length : getSelectLimit(plan)), [devUnlockAll, entitled.length, plan])
  const maxCount = Math.min(limit, entitled.length)
  const editable = changeOk || selected.length === 0
  const remaining = Math.max(0, maxCount - selected.length)

  const entitledList = useMemo(() => {
    const ids = entitled.length > 0 ? entitled : JLPT_IDS
    return ids
      .filter((id) => id in quizzes)
      .map((id) => ({
        id,
        title: quizzes[id as keyof typeof quizzes].title,
        description: quizzes[id as keyof typeof quizzes].description ?? "",
      }))
  }, [entitled])

  const toggle = (quizType: QuizType) => {
    if (!editable) return
    setSelected((prev) => {
      if (prev.includes(quizType)) return prev.filter((id) => id !== quizType)
      if (prev.length >= maxCount) return [...prev.slice(1), quizType]
      return [...prev, quizType]
    })
  }

  const handleSave = async () => {
    if (!uid) return
    if (selected.length === 0) {
      setError("N5 か N4 を1つ以上選んでください")
      return
    }
    setSaving(true)
    setError("")
    try {
      await saveSelectedQuizTypesWithLock({ uid, selectedQuizTypes: selected })
      router.replace("/select-mode")
    } catch (e) {
      console.error(e)
      setError("保存に失敗しました")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <main style={styles.page}>
        <div style={styles.shell}>
          <div style={styles.card}>読み込み中...</div>
        </div>
      </main>
    )
  }

  return (
    <main style={styles.page}>
      <div style={styles.shell}>
        <AppHeader title="教材を選択" />

        <section style={styles.summaryCard}>
          <div style={{ fontWeight: 900 }}>
            プラン：{plan} ・ 選択上限：{maxCount} ・ 選択中：{selected.length} ・ 残り：{remaining}
          </div>
          <div style={{ marginTop: 6, fontSize: 12, opacity: 0.75 }}>
            JLPT専用版なので、教材は N5 / N4 のみです。
          </div>
        </section>

        <section style={styles.infoCard}>
          {!changeOk && nextAllowedAt && selected.length > 0 ? (
            <div style={{ ...styles.notice, ...styles.noticeWarn }}>
              変更ロック中：次に変更できる日 <b>{formatDate(nextAllowedAt)}</b>
            </div>
          ) : null}

          {!changeOk && selected.length === 0 ? (
            <div style={{ ...styles.notice, ...styles.noticeOk }}>
              初回の教材確定前なので、今だけ選択できます。
            </div>
          ) : null}

          <div style={styles.mini}>推奨：まずは N5 か N4 を選んで進む</div>
        </section>

        {error ? <div style={styles.alert}>{error}</div> : null}

        <section style={{ marginTop: 12 }}>
          <div style={styles.grid}>
            {entitledList.map((q) => {
              const checked = selected.includes(q.id)
              const disabled = !editable
              return (
                <button
                  key={q.id}
                  type="button"
                  onClick={() => toggle(q.id)}
                  disabled={disabled}
                  style={{
                    ...styles.quizCard,
                    ...(checked ? styles.quizCardChecked : null),
                    ...(disabled ? styles.quizCardDisabled : null),
                  }}
                >
                  <div style={styles.quizHead}>
                    <div style={styles.quizTitle}>{q.title}</div>
                    <div style={{ ...styles.pill, ...(checked ? styles.pillChecked : styles.pillEmpty) }}>
                      {checked ? "選択中" : "未選択"}
                    </div>
                  </div>

                  <div style={q.description ? styles.quizDesc : styles.quizDescMuted}>
                    {q.description || "（説明なし）"}
                  </div>

                  <div style={styles.quizActions}>
                    <div style={styles.ctaRow}>
                      <span style={styles.ctaLabel}>ここを押して</span>
                      <span style={styles.ctaStrong}>{checked ? "解除" : "追加"}</span>
                    </div>
                    <div style={styles.ctaNote}>
                      {editable ? "タップで切替" : "ロック中のため編集できません"}
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        </section>

        <footer style={styles.footer}>
          <button
            type="button"
            onClick={handleSave}
            disabled={!editable || saving || selected.length === 0}
            style={{
              ...styles.saveBtn,
              ...(editable && selected.length > 0 ? styles.saveBtnOn : styles.saveBtnOff),
              ...(saving ? styles.saveBtnSaving : null),
            }}
          >
            {saving ? "保存中..." : "この内容で保存して進む"}
          </button>
        </footer>
      </div>
    </main>
  )
}

const styles: any = {
  page: { padding: 18 },
  shell: { maxWidth: 980, margin: "0 auto" },
  card: {
    border: "1px solid var(--border)",
    borderRadius: 16,
    background: "white",
    padding: 14,
  },
  summaryCard: {
    marginTop: 12,
    border: "1px solid var(--border)",
    borderRadius: 16,
    background: "white",
    padding: "12px 12px",
  },
  infoCard: { marginTop: 12 },
  notice: {
    borderRadius: 14,
    padding: "10px 12px",
    border: "1px solid var(--border)",
    background: "white",
    marginBottom: 8,
  },
  noticeWarn: { background: "#fff7ed", borderColor: "#fed7aa" },
  noticeOk: { background: "#ecfdf5", borderColor: "#a7f3d0" },
  mini: { fontSize: 12, opacity: 0.75, marginTop: 8 },
  alert: {
    marginTop: 12,
    border: "1px solid #fecaca",
    background: "#fef2f2",
    borderRadius: 14,
    padding: "10px 12px",
    fontWeight: 800,
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
    gap: 12,
  },
  quizCard: {
    textAlign: "left",
    border: "1px solid var(--border)",
    background: "white",
    borderRadius: 16,
    padding: 14,
    cursor: "pointer",
    boxShadow: "0 6px 16px rgba(0,0,0,0.05)",
  },
  quizCardChecked: { borderColor: "#4f46e5", boxShadow: "0 10px 24px rgba(79,70,229,0.12)" },
  quizCardDisabled: { opacity: 0.55, cursor: "not-allowed" },
  quizHead: { display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10 },
  quizTitle: { fontWeight: 900 },
  pill: { borderRadius: 999, padding: "6px 10px", fontSize: 12, fontWeight: 900 },
  pillChecked: { background: "#4f46e5", color: "white" },
  pillEmpty: { background: "#f3f4f6", color: "#111827" },
  quizDesc: { marginTop: 8, opacity: 0.8, lineHeight: 1.6, fontSize: 13, minHeight: 42 },
  quizDescMuted: { marginTop: 8, opacity: 0.5, lineHeight: 1.6, fontSize: 13, minHeight: 42 },
  quizActions: { marginTop: 12, borderTop: "1px solid var(--border)", paddingTop: 10 },
  ctaRow: { display: "flex", gap: 8, alignItems: "baseline" },
  ctaLabel: { fontSize: 12, opacity: 0.7 },
  ctaStrong: { fontSize: 14, fontWeight: 900 },
  ctaNote: { marginTop: 6, fontSize: 12, opacity: 0.7 },
  footer: { marginTop: 16, paddingBottom: 24, display: "flex", justifyContent: "center" },
  saveBtn: {
    width: "min(520px, 100%)",
    border: "none",
    borderRadius: 16,
    padding: "14px 14px",
    fontWeight: 900,
    cursor: "pointer",
    boxShadow: "0 10px 26px rgba(0,0,0,0.10)",
  },
  saveBtnOn: { background: "#111827", color: "white" },
  saveBtnOff: { background: "#e5e7eb", color: "#6b7280", cursor: "not-allowed" },
  saveBtnSaving: { opacity: 0.8 },
}
