import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { XIcon } from '../../app/icons'

export function DrillShell({
  title,
  subtitle,
  children,
}: {
  title: string
  subtitle?: string
  children: ReactNode
}) {
  return (
    <div className="flex min-h-dvh flex-col bg-slate-100 pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)] dark:bg-slate-950">
      <header className="flex items-center gap-3 px-4 py-3">
        <Link to="/crutches" aria-label="Close" className="text-slate-500">
          <XIcon />
        </Link>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">{title}</p>
          {subtitle && <p className="truncate text-xs text-slate-500">{subtitle}</p>}
        </div>
      </header>
      <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col px-4 pb-5">{children}</div>
    </div>
  )
}

export const primaryBtn =
  'rounded-xl bg-teal-700 px-6 py-3 font-medium text-white hover:bg-teal-800 active:scale-[0.98] disabled:opacity-40'
export const secondaryBtn =
  'rounded-xl border border-slate-300 px-5 py-3 font-medium text-slate-600 dark:border-slate-700 dark:text-slate-300'
