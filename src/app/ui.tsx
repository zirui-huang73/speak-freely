import type { ReactNode } from 'react'

export function PageHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <header className="mb-6">
      <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
      {subtitle && <p className="mt-1 text-slate-500 dark:text-slate-400">{subtitle}</p>}
    </header>
  )
}

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <section
      className={`rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 ${className}`}
    >
      {children}
    </section>
  )
}

export function ComingSoon({ step, children }: { step: number; children: ReactNode }) {
  return (
    <Card className="border-dashed">
      <p className="text-xs font-semibold tracking-wider text-teal-700 uppercase dark:text-teal-300">
        Coming in step {step}
      </p>
      <div className="mt-2 text-slate-600 dark:text-slate-300">{children}</div>
    </Card>
  )
}
