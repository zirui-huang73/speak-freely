import { Link } from 'react-router-dom'
import { ChevronIcon } from '../../app/icons'
import { Card, PageHeader } from '../../app/ui'
import { CRUTCH_GROUPS, CRUTCHES, FOUR_THINGS } from '../../content/crutches'
import { drillPath } from '../../lib/crutches'
import { useCrutches } from './crutchContext'

const DRILLS = [
  { to: '/drill/words', title: 'Feared words', tag: 'C-1 to C-8', text: 'A word appears with a crutch to use on it.' },
  { to: '/drill/linking', title: 'Link and stop', tag: 'C-9 to C-12', text: 'Short linked phrases with timed full stops.' },
  { to: '/drill/free', title: 'Free talk', tag: 'C-13', text: 'Talk for a minute on a topic, without planning words.' },
]

export function CrutchesPage() {
  const { data, setWeek } = useCrutches()
  const week = CRUTCHES.find((c) => c.n === data.week)!

  return (
    <>
      <PageHeader title="Crutches" subtitle="Temporary tools to stay fluent while the mind retrains." />
      <div className="space-y-4">
        <Card className="border-teal-600/40">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold tracking-wider text-teal-700 uppercase dark:text-teal-300">
                Crutch of the week
              </p>
              <h2 className="mt-1 text-xl font-semibold">
                C-{week.n} · {week.name}
              </h2>
            </div>
            <select
              aria-label="Change crutch of the week"
              value={week.n}
              onChange={(e) => setWeek(Number(e.target.value))}
              className="rounded-lg border border-slate-300 bg-white px-2 py-1 text-sm dark:border-slate-700 dark:bg-slate-900"
            >
              {CRUTCHES.map((c) => (
                <option key={c.n} value={c.n}>
                  C-{c.n}
                </option>
              ))}
            </select>
          </div>
          <p className="mt-2 text-slate-600 dark:text-slate-300">{week.summary}</p>
          <p className="mt-2 text-teal-800 italic dark:text-teal-200">{week.example}</p>
          <p className="mt-3 text-xs text-slate-500">
            Drill it until you can use it in a split second, even when you don't need it. One student practiced each
            crutch for a full week.
          </p>
          <Link
            to={drillPath(week.n)}
            className="mt-4 inline-block rounded-xl bg-teal-700 px-4 py-2.5 font-medium text-white hover:bg-teal-800"
          >
            Drill C-{week.n}
          </Link>
        </Card>

        <Card>
          <h2 className="font-semibold">It takes four things to stutter</h2>
          <ol className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {FOUR_THINGS.map((t, i) => (
              <li key={t} className="rounded-xl bg-slate-100 px-3 py-2 text-sm dark:bg-slate-800">
                <span className="mr-1.5 text-slate-400">{i + 1}</span>
                {t}
              </li>
            ))}
          </ol>
          <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">
            Take away any one of them and the stutter can't happen. Every crutch removes at least one.
          </p>
        </Card>

        <div className="grid gap-3 sm:grid-cols-3">
          {DRILLS.map((d) => (
            <Link
              key={d.to}
              to={d.to}
              className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm hover:border-teal-600 dark:border-slate-800 dark:bg-slate-900"
            >
              <p className="text-xs font-medium text-teal-700 dark:text-teal-300">{d.tag}</p>
              <p className="mt-0.5 font-semibold">{d.title}</p>
              <p className="mt-1 text-sm text-slate-500">{d.text}</p>
            </Link>
          ))}
        </div>

        {CRUTCH_GROUPS.map((g) => (
          <section key={g.id}>
            <h2 className="mt-6 font-semibold">{g.title}</h2>
            <p className="mb-2 text-sm text-slate-500">{g.blurb}</p>
            <ul className="space-y-2">
              {CRUTCHES.filter((c) => c.group === g.id).map((c) => (
                <li key={c.n}>
                  <details className="group rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
                    <summary className="flex cursor-pointer list-none items-center gap-3 p-4">
                      <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-teal-50 text-sm font-semibold text-teal-700 dark:bg-teal-950 dark:text-teal-300">
                        C-{c.n}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block font-medium">{c.name}</span>
                        <span className="block truncate text-sm text-slate-500">{c.summary}</span>
                      </span>
                      {!!data.counts[c.n] && <span className="text-xs text-slate-400">{data.counts[c.n]}×</span>}
                      <ChevronIcon className="size-5 shrink-0 text-slate-400 transition group-open:rotate-90" />
                    </summary>
                    <div className="space-y-3 border-t border-slate-100 p-4 dark:border-slate-800">
                      <ul className="list-disc space-y-1.5 pl-5 text-slate-700 dark:text-slate-300">
                        {c.how.map((h) => (
                          <li key={h}>{h}</li>
                        ))}
                      </ul>
                      <p className="rounded-xl bg-teal-50 px-3 py-2 text-teal-900 dark:bg-teal-950 dark:text-teal-100">
                        {c.example}
                      </p>
                      {data.week !== c.n && (
                        <button
                          type="button"
                          onClick={() => setWeek(c.n)}
                          className="text-sm font-medium text-teal-700 dark:text-teal-300"
                        >
                          Make this my crutch of the week
                        </button>
                      )}
                    </div>
                  </details>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </>
  )
}
