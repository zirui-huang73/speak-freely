import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Card, PageHeader } from '../../app/ui'
import { THEMES } from '../../lib/settings'
import { englishVoices, onVoicesChanged, speak, speechSupported } from '../../lib/speech'
import { useSettings } from '../settings/settingsContext'

function useEnglishVoices() {
  const [voices, setVoices] = useState(englishVoices)
  useEffect(() => onVoicesChanged(() => setVoices(englishVoices())), [])
  return voices
}

const label = 'block text-sm font-medium text-slate-600 dark:text-slate-300'
const input =
  'mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-base outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20 dark:border-slate-700 dark:bg-slate-800'

export function SettingsPage() {
  const { settings, update } = useSettings()
  const voices = useEnglishVoices()

  return (
    <>
      <Link to="/more" className="text-sm text-teal-700 dark:text-teal-300">
        ‹ More
      </Link>
      <PageHeader title="Settings" />
      <div className="space-y-4">
        <Card className="space-y-4">
          <div>
            <label htmlFor="name" className={label}>
              Your name
            </label>
            <input
              id="name"
              className={input}
              value={settings.name}
              placeholder="Used in “I love to say my name, …”"
              onChange={(e) => update({ name: e.target.value })}
            />
          </div>
          <div>
            <label htmlFor="reps" className={label}>
              Repetitions per affirmation
            </label>
            <input
              id="reps"
              type="number"
              inputMode="numeric"
              min={1}
              max={100}
              className={input}
              value={settings.reps}
              onChange={(e) => e.target.value && update({ reps: Number(e.target.value) })}
            />
            <p className="mt-1 text-xs text-slate-500">The book recommends at least 20.</p>
          </div>
        </Card>

        <Card className="space-y-4">
          <h2 className="font-semibold">Voice</h2>
          {speechSupported ? (
            <>
              <div>
                <label htmlFor="voice" className={label}>
                  Reading voice
                </label>
                <select
                  id="voice"
                  className={input}
                  value={settings.voiceURI ?? ''}
                  onChange={(e) => update({ voiceURI: e.target.value || null })}
                >
                  <option value="">System default</option>
                  {voices.map((v) => (
                    <option key={v.voiceURI} value={v.voiceURI}>
                      {v.name} ({v.lang})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="rate" className={label}>
                  Speed: {settings.rate.toFixed(2)}×
                </label>
                <input
                  id="rate"
                  type="range"
                  min={0.5}
                  max={1.5}
                  step={0.05}
                  value={settings.rate}
                  onChange={(e) => update({ rate: Number(e.target.value) })}
                  className="mt-2 w-full accent-teal-700"
                />
              </div>
              <button
                type="button"
                onClick={() =>
                  speak(`I love to speak. I love to say my name${settings.name ? `, ${settings.name}` : ''}.`, settings)
                }
                className="rounded-xl bg-teal-700 px-4 py-2.5 font-medium text-white hover:bg-teal-800 active:scale-[0.98]"
              >
                Test voice
              </button>
            </>
          ) : (
            <p className="text-slate-500">This browser does not support speech synthesis.</p>
          )}
        </Card>

        <Card className="space-y-3">
          <h2 className="font-semibold">Theme</h2>
          <div className="grid grid-cols-3 gap-1 rounded-xl bg-slate-100 p-1 dark:bg-slate-800">
            {THEMES.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => update({ theme: t })}
                className={`rounded-lg py-2 text-sm font-medium capitalize ${
                  settings.theme === t ? 'bg-white shadow-sm dark:bg-slate-700' : 'text-slate-500 dark:text-slate-400'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </Card>
      </div>
    </>
  )
}
