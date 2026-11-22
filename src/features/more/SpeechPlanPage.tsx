import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { XIcon } from '../../app/icons'
import { Card, PageHeader } from '../../app/ui'
import { DEFAULT_SETTINGS, planOf } from '../../lib/settings'
import { keepAwake } from '../../lib/wakeLock'
import { useSettings } from '../settings/settingsContext'

const GENERAL_EXAMPLES = ['Joy – Smile – Stop', 'Animate Message – Smile – Stop', 'Pronounce Words – Smile – Stop']
const PRESSURE_EXAMPLES = [
  'Slow – Link – Stop',
  'Less – Link – Stop',
  'Pronunciation – Link – Stop',
  'Passion – Link – Stop',
  'Hum – Link – Stop',
  'Partial Singing – Link – Stop',
  'Writing – Whispering – Stop',
]

type PlanKey = 'generalPlan' | 'pressurePlan'

const PLANS: { key: PlanKey; title: string; when: string; examples: string[] }[] = [
  { key: 'generalPlan', title: 'General plan', when: 'When you feel little or no pressure.', examples: GENERAL_EXAMPLES },
  {
    key: 'pressurePlan',
    title: 'Pressure plan',
    when: 'With groups, authorities, strangers, on the phone.',
    examples: PRESSURE_EXAMPLES,
  },
]

function FullCard({ start, onClose }: { start: PlanKey; onClose: () => void }) {
  const { settings } = useSettings()
  const [key, setKey] = useState<PlanKey>(start)
  const plan = PLANS.find((p) => p.key === key)!
  useEffect(() => keepAwake(), [])

  return (
    <div
      role="button"
      tabIndex={-1}
      onClick={() => setKey(key === 'generalPlan' ? 'pressurePlan' : 'generalPlan')}
      className={`fixed inset-0 z-50 flex cursor-pointer flex-col pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)] text-white select-none ${
        key === 'generalPlan' ? 'bg-teal-700' : 'bg-indigo-800'
      }`}
    >
      <div className="flex justify-end p-4">
        <button
          type="button"
          aria-label="Close"
          onClick={(e) => {
            e.stopPropagation()
            onClose()
          }}
          className="text-white/70"
        >
          <XIcon className="size-7" />
        </button>
      </div>
      <div className="flex flex-1 flex-col items-center justify-center gap-6 px-8 text-center">
        <p className="text-sm font-semibold tracking-widest text-white/60 uppercase">{plan.title}</p>
        <p className="text-5xl leading-tight font-bold text-balance md:text-7xl">
          {planOf(settings, key).split(/\s*[–-]\s*/).map((part, i, all) => (
            <span key={i} className="block">
              {part}
              {i < all.length - 1 && <span className="sr-only"> – </span>}
            </span>
          ))}
        </p>
      </div>
      <p className="pb-6 text-center text-sm text-white/50">Tap to switch plans</p>
    </div>
  )
}

export function SpeechPlanPage() {
  const { settings, update } = useSettings()
  const [params, setParams] = useSearchParams()
  const showing = params.get('show') as PlanKey | null

  return (
    <>
      <Link to="/more" className="text-sm text-teal-700 dark:text-teal-300">
        ‹ More
      </Link>
      <PageHeader title="My Speech Plan" subtitle="What you think about while you speak. It fills the mind and blocks the stutter habit." />
      <div className="space-y-4">
        {PLANS.map((p) => (
          <Card key={p.key} className="space-y-3">
            <div>
              <h2 className="font-semibold">{p.title}</h2>
              <p className="text-sm text-slate-500">{p.when}</p>
            </div>
            <input
              aria-label={p.title}
              value={settings[p.key]}
              placeholder={DEFAULT_SETTINGS[p.key]}
              onChange={(e) => update({ [p.key]: e.target.value })}
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-lg font-medium outline-none focus:border-teal-600 dark:border-slate-700 dark:bg-slate-800"
            />
            <div className="flex flex-wrap gap-2">
              {p.examples.map((ex) => (
                <button
                  key={ex}
                  type="button"
                  onClick={() => update({ [p.key]: ex })}
                  className={`rounded-full border px-3 py-1 text-sm ${
                    settings[p.key] === ex
                      ? 'border-teal-700 bg-teal-700 text-white'
                      : 'border-slate-300 text-slate-600 dark:border-slate-700 dark:text-slate-300'
                  }`}
                >
                  {ex}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setParams({ show: p.key })}
              className="rounded-xl bg-teal-700 px-4 py-2.5 font-medium text-white hover:bg-teal-800"
            >
              Show as card
            </button>
          </Card>
        ))}

        <Card>
          <h2 className="font-semibold">Full stops</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-600 dark:text-slate-300">
            <li>A full stop is at least one second: “one thousand one”. Vary them between one and three seconds.</li>
            <li>Mild pressure: stop every 1 to 7 words. More pressure: every 1 to 5. Extreme pressure: every 1 to 3.</li>
            <li>Under pressure: say less, link every phrase, and stop.</li>
          </ul>
        </Card>
      </div>

      {showing && PLANS.some((p) => p.key === showing) && (
        <FullCard start={showing} onClose={() => setParams({}, { replace: true })} />
      )}
    </>
  )
}
