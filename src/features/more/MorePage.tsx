import { Link } from 'react-router-dom'
import { ChevronIcon } from '../../app/icons'
import { PageHeader } from '../../app/ui'

const ITEMS = [
  { to: '/recordings', label: 'My Recordings', hint: 'Monotone and Animated versions, sleep playback' },
  { to: '/more/settings', label: 'Settings', hint: 'Name, voice, repetitions, theme' },
  { label: 'My Speech Plan Card', hint: 'Coming in step 7' },
  { label: 'Export / Import', hint: 'Coming in step 7' },
]

export function MorePage() {
  return (
    <>
      <PageHeader title="More" />
      <ul className="divide-y divide-slate-200 overflow-hidden rounded-2xl border border-slate-200 bg-white dark:divide-slate-800 dark:border-slate-800 dark:bg-slate-900">
        {ITEMS.map(({ to, label, hint }) => {
          const body = (
            <>
              <div>
                <p className="font-medium">{label}</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">{hint}</p>
              </div>
              {to && <ChevronIcon />}
            </>
          )
          return (
            <li key={label}>
              {to ? (
                <Link to={to} className="flex items-center justify-between px-5 py-4 hover:bg-slate-50 dark:hover:bg-slate-800">
                  {body}
                </Link>
              ) : (
                <div className="flex items-center justify-between px-5 py-4 opacity-50">{body}</div>
              )}
            </li>
          )
        })}
      </ul>
    </>
  )
}
