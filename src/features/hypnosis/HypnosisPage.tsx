import { useState } from 'react'
import { Link } from 'react-router-dom'
import { MoonIcon, SunIcon } from '../../app/icons'
import { Card, PageHeader } from '../../app/ui'
import { HYPNOSIS_LENGTHS, type HypnosisMode } from '../../content/hypnosis'
import { hypnosisSession } from '../../lib/hypnosis'
import { fillName } from '../../lib/library'
import { startNoise } from '../../lib/noise'
import { NOISE_TYPES } from '../../lib/settings'
import { speak, unlockSpeech } from '../../lib/speech'
import { useLibrary } from '../library/libraryContext'
import { useSettings } from '../settings/settingsContext'
import { HypnosisPlayer, type HypnosisSession } from './HypnosisPlayer'

const MODES: { id: HypnosisMode; title: string; text: string; icon: typeof MoonIcon }[] = [
  { id: 'bedtime', title: 'Bedtime', text: 'Ends by drifting into sleep. Counts as your Bedtime session.', icon: MoonIcon },
  { id: 'daytime', title: 'Daytime', text: 'Counts you back up, refreshed. Counts as a Morning or Midday session.', icon: SunIcon },
]

const segment = (active: boolean) =>
  `flex-1 rounded-lg py-2 text-sm font-medium capitalize ${active ? 'bg-white shadow-sm dark:bg-slate-700' : 'text-slate-500 dark:text-slate-400'}`

export function HypnosisPage() {
  const { settings, update } = useSettings()
  const { data, cardById } = useLibrary()
  const [session, setSession] = useState<HypnosisSession | null>(null)
  const mode = settings.hypnosisMode
  const minutes = settings.hypnosisMinutes

  const start = () => {
    unlockSpeech()
    const affirmations = data.todayTen.map((id) => fillName(cardById.get(id)?.text ?? '', settings.name))
    setSession({
      mode,
      minutes,
      lines: hypnosisSession(mode, minutes, affirmations, settings.hypnosisRate),
      noise: settings.noise === 'off' ? null : startNoise(settings.noise, settings.noiseVolume),
    })
  }

  return (
    <>
      <PageHeader title="Self-Hypnosis" subtitle="Deep relaxation, then your affirmations." />
      <div className="space-y-4">
        <p className="rounded-2xl bg-amber-50 p-4 text-sm text-amber-900 dark:bg-amber-950 dark:text-amber-200">
          The book explains why self-hypnosis works better than affirmations alone, but gives no script. This guided
          session follows a common structure: settle, relax, deepen, your Today's 10, visualize, then wake up or sleep.
        </p>

        <div className="grid gap-3 sm:grid-cols-2">
          {MODES.map(({ id, title, text, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => update({ hypnosisMode: id })}
              className={`rounded-2xl border-2 bg-white p-4 text-left dark:bg-slate-900 ${
                mode === id ? 'border-teal-600' : 'border-transparent shadow-sm'
              }`}
            >
              <Icon className={`size-6 ${id === 'bedtime' ? 'text-indigo-500' : 'text-amber-500'}`} />
              <p className="mt-2 font-semibold">{title}</p>
              <p className="mt-1 text-sm text-slate-500">{text}</p>
            </button>
          ))}
        </div>

        <Card className="space-y-5">
          <div>
            <p className="mb-2 text-sm font-medium text-slate-600 dark:text-slate-300">Length</p>
            <div className="flex gap-1 rounded-xl bg-slate-100 p-1 dark:bg-slate-800">
              {HYPNOSIS_LENGTHS.map((m) => (
                <button key={m} type="button" onClick={() => update({ hypnosisMinutes: m })} className={segment(minutes === m)}>
                  {m} minutes
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <label htmlFor="hrate" className="text-sm font-medium text-slate-600 dark:text-slate-300">
                Speaking speed: {settings.hypnosisRate.toFixed(2)}×
              </label>
              <button
                type="button"
                onClick={() =>
                  speak('Take a slow, deep breath in. And let it go.', {
                    voiceURI: settings.voiceURI,
                    rate: settings.hypnosisRate,
                  })
                }
                className="text-sm font-medium text-teal-700 dark:text-teal-300"
              >
                Preview
              </button>
            </div>
            <input
              id="hrate"
              type="range"
              min={0.5}
              max={1.2}
              step={0.05}
              value={settings.hypnosisRate}
              onChange={(e) => update({ hypnosisRate: Number(e.target.value) })}
              className="mt-2 w-full accent-teal-700"
            />
            <p className="text-xs text-slate-500">
              Voice is chosen in{' '}
              <Link to="/more/settings" className="underline">
                Settings
              </Link>
              .
            </p>
          </div>

          <div>
            <p className="mb-2 text-sm font-medium text-slate-600 dark:text-slate-300">Background sound</p>
            <div className="flex gap-1 rounded-xl bg-slate-100 p-1 dark:bg-slate-800">
              {NOISE_TYPES.map((n) => (
                <button key={n} type="button" onClick={() => update({ noise: n })} className={segment(settings.noise === n)}>
                  {n === 'off' ? 'Off' : `${n} noise`}
                </button>
              ))}
            </div>
            {settings.noise !== 'off' && (
              <input
                type="range"
                aria-label="Background volume"
                min={0.02}
                max={1}
                step={0.02}
                value={settings.noiseVolume}
                onChange={(e) => update({ noiseVolume: Number(e.target.value) })}
                className="mt-3 w-full accent-teal-700"
              />
            )}
          </div>
        </Card>

        <ul className="space-y-1 px-1 text-sm text-slate-500">
          <li>Lie down or sit comfortably. Headphones help.</li>
          <li>The screen stays on and turns almost black; the voice stops if the phone locks.</li>
          <li>Do not listen while driving or doing anything that needs your attention.</li>
        </ul>

        <button
          type="button"
          onClick={start}
          className="w-full rounded-2xl bg-indigo-700 py-4 text-lg font-medium text-white hover:bg-indigo-800 active:scale-[0.99]"
        >
          Start {minutes}-minute {mode} session
        </button>
      </div>

      {session && <HypnosisPlayer session={session} onClose={() => setSession(null)} />}
    </>
  )
}
