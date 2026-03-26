// app/components/QuizLayout.tsx
import React from "react"
import AppHeader from "@/app/components/AppHeader"

export default function QuizLayout({
  title,
  children,
  subtitle,
}: {
  title: string
  subtitle?: string
  children: React.ReactNode
}) {
  return (
    <main className="container">
      <AppHeader title={title} />
      <section className="card">
        <div className="card-header">
          <div className="stackSm">
            <h1 className="card-title">{title}</h1>
            {subtitle ? <p className="card-subtitle">{subtitle}</p> : null}
          </div>
        </div>
        <div className="card-body">{children}</div>
      </section>
    </main>
  )
}
