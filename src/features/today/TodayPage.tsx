import { useState } from 'react'
import { Link } from 'react-router-dom'
import { CheckIcon, LockIcon, MoonIcon, PlayIcon } from '../../app/icons'
import { Card, PageHeader } from '../../app/ui'
import { CAPRIO_QUOTE, LOCKED_SLOTS } from '../../content/affirmations'
import { CRUTCHES } from '../../content/crutches'
import { drillPath } from '../../lib/crutches'
import { fillName } from '../../lib/library'
import { dayKey, lastDays, reviewDue, SLOTS, streak, suggestedSlot } from '../../lib/practice'
import { useCrutches } from '../crutches/crutchContext'
import { useLibrary } from '../library/libraryContext'
import { SLOT_INFO, usePractice } from '../practice/practiceContext'
import { useSettings } from '../settings/settingsContext'

function greeting(hour: number) {
  if (hour < 12) return 'Good morning'
  if (hour < 18) return 'Good afternoon'
  return 'Good evening'
}

const time = (t: number) => new Date(t).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })

export function TodayPage() {
  const { settings } = useSettings()
  const { data, cardById } = useLibrary()
  const { log, markReviewed } = usePractice()
  const { data: crutchData } = useCrutches()
  const [now] = useState(() => Date.now())
  const name = settings.name.trim()
  const today = log.days[dayKey(now)] ?? {}
  const suggested = suggestedSlot(now)
  const days = lastDays(log, now)
  const s = streak(log, now)
  const week = CRUTCHES.find((c) => c.n === crutchData.week)!

  return (
    <>
      <PageHeader
        title={`${greeting(new Date(now).getHours())}${name ? `, ${name}` : ''}`}
        subtitle="Every day, in every way, my speech grows better and better."
      />
      <div className="space-y-4">
        {reviewDue(log, now) && (
          <Card className="border-amber-300 bg-amber-50 dark:border-amber-800 dark:bg-amber-950">
            <p className="font-medium">Monthly review</p>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
              Look over your Today's 10. Keep what helps most and swap in cards that fit where you are now.
            </p>
            <div className="mt-3 flex gap-2">
              <Link to="/cards" className="rounded-lg bg-amber-500 px-3 py-1.5 text-sm font-medium text-white">
                Open Cards
              </Link>
              <button type="button" onClick={markReviewed} className="rounded-lg px-3 py-1.5 text-sm font-medium">
                Mark reviewed
              </button>
            </div>
          </Card>
        )}

        <Card className="p-0">
          <h2 className="px-5 pt-4 pb-2 font-semibold">Affirmation sessions</h2>
          <ul>
            {SLOTS.map((slot) => {
              const doneAt = today[slot]
              const highlight = slot === suggested && !doneAt
              return (
                <li key={slot} className="flex items-center gap-4 border-t border-slate-100 px-5 py-3.5 dark:border-slate-800">
                  <div
                    className={`grid size-9 shrink-0 place-items-center rounded-full ${
                      doneAt ? 'bg-teal-600 text-white' : 'border-2 border-slate-300 dark:border-slate-700'
                    }`}
                  >
                    {doneAt && <CheckIcon className="size-5" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium">{SLOT_INFO[slot].title}</p>
                    <p className="truncate text-sm text-slate-500">
                      {doneAt ? `Done at ${time(doneAt)}` : SLOT_INFO[slot].hint}
                    </p>
                  </div>
                  <Link
                    to={`/session/${slot}`}
                    className={`shrink-0 rounded-xl px-4 py-2 text-sm font-medium ${
                      highlight
                        ? 'bg-teal-700 text-white hover:bg-teal-800'
                        : 'border border-slate-300 text-slate-600 dark:border-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {doneAt ? 'Again' : 'Start'}
                  </Link>
                </li>
              )
            })}
          </ul>
          <p className="border-t border-slate-100 px-5 py-3 text-xs text-slate-500 dark:border-slate-800">
            About 20 minutes: breathe, Caprio's words, then Today's 10 × {settings.reps}.
          </p>
        </Card>

        <div className="grid grid-cols-2 gap-3">
          <Link
            to="/recordings"
            className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 font-medium shadow-sm hover:border-teal-600 dark:border-slate-800 dark:bg-slate-900"
          >
            <PlayIcon className="size-5 text-teal-700 dark:text-teal-300" /> My Recordings
          </Link>
          <Link
            to="/sleep"
            className="flex items-center gap-3 rounded-2xl bg-slate-900 p-4 font-medium text-slate-100 shadow-sm hover:bg-slate-800 dark:bg-slate-800"
          >
            <MoonIcon className="size-5 text-indigo-300" /> Sleep Playback
          </Link>
        </div>

        <Link
          to={drillPath(week.n)}
          className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm hover:border-teal-600 dark:border-slate-800 dark:bg-slate-900"
        >
          <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-teal-50 text-sm font-semibold text-teal-700 dark:bg-teal-950 dark:text-teal-300">
            C-{week.n}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-xs font-medium text-slate-500">Crutch of the week</span>
            <span className="block truncate font-medium">{week.name}</span>
          </span>
          <span className="text-sm font-medium text-teal-700 dark:text-teal-300">Drill</span>
        </Link>

        <Card>
          <div className="flex items-baseline justify-between">
            <h2 className="font-semibold">This week</h2>
            <p className="text-sm text-slate-500">
              {s > 0 ? (
                <span className="font-medium text-teal-700 dark:text-teal-300">{s}-day streak</span>
              ) : (
                '2 sessions a day build a streak'
              )}
            </p>
          </div>
          <div className="mt-4 grid grid-cols-7 gap-2 text-center">
            {days.map((d) => (
              <div key={d.key} className="flex flex-col items-center gap-1.5">
                <span
                  className={`size-7 rounded-full ${
                    d.sessions >= 2
                      ? 'bg-teal-600'
                      : d.sessions === 1
                        ? 'bg-teal-200 dark:bg-teal-800'
                        : 'border-2 border-slate-200 dark:border-slate-700'
                  }`}
                  title={`${d.key}: ${d.sessions} session(s)`}
                />
                <span className="text-xs text-slate-500">{d.weekday}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <div className="mb-3 flex items-baseline justify-between">
            <h2 className="font-semibold">Today's 10</h2>
            <Link to="/cards" className="text-sm font-medium text-teal-700 dark:text-teal-300">
              Change cards
            </Link>
          </div>
          <ol className="space-y-2">
            {data.todayTen.map((id, i) => (
              <li key={id} className="flex gap-3">
                <span className="w-5 shrink-0 text-right text-slate-400 tabular-nums">{i + 1}</span>
                <span className="flex-1">{fillName(cardById.get(id)?.text ?? '', settings.name)}</span>
                {LOCKED_SLOTS.includes(i) && <LockIcon className="mt-1 size-3.5 shrink-0 text-slate-300" />}
              </li>
            ))}
          </ol>
        </Card>

        <Card className="bg-teal-700 text-teal-50 dark:bg-teal-800">
          <blockquote className="leading-relaxed">“{CAPRIO_QUOTE}”</blockquote>
          <p className="mt-3 text-sm text-teal-200">— Frank S. Caprio, M.D.</p>
        </Card>
      </div>
    </>
  )
}
