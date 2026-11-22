import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { MoonIcon, PlayIcon, XIcon } from '../../app/icons'
import { renderAtVolume, setMediaSession } from '../../lib/audio'
import { formatDuration, loadAllRecordings, type Recording } from '../../lib/recordings'
import { SLEEP_MINUTES } from '../../lib/settings'
import { useSettings } from '../settings/settingsContext'

const VOLUMES = [
  { label: 'Whisper', value: 0.06 },
  { label: 'Very soft', value: 0.15 },
  { label: 'Soft', value: 0.3 },
  { label: 'Medium', value: 0.6 },
]

const timerLabel = (m: number) => (m === 0 ? 'All night' : m === 60 ? '1 hour' : `${m} min`)
const clock = (t: number) => new Date(t).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })

const segment = (active: boolean) =>
  `rounded-lg py-2 text-sm font-medium transition ${active ? 'bg-slate-700 text-white' : 'text-slate-400'}`

export function SleepPage() {
  const { settings, update } = useSettings()
  const [rec, setRec] = useState<Recording | null | undefined>(undefined)
  const [prepared, setPrepared] = useState<{ key: string; url?: string; error?: string } | null>(null)
  const [playing, setPlaying] = useState(false)
  const [endAt, setEndAt] = useState<number | null>(null)
  const audio = useRef<HTMLAudioElement>(null)

  const volume = VOLUMES.reduce((best, v) =>
    Math.abs(v.value - settings.sleepVolume) < Math.abs(best.value - settings.sleepVolume) ? v : best,
  )

  useEffect(() => {
    loadAllRecordings().then((all) => setRec(all.monotone ?? all.animated ?? null))
  }, [])

  const key = rec ? `${rec.createdAt}:${volume.value}` : ''
  const srcUrl = prepared?.key === key ? (prepared.url ?? null) : null
  const error = prepared?.key === key ? (prepared.error ?? '') : ''

  useEffect(() => {
    if (!rec) return
    let cancelled = false
    let url: string | null = null
    renderAtVolume(rec.data, volume.value)
      .then((blob) => {
        if (cancelled) return
        url = URL.createObjectURL(blob)
        setPrepared({ key, url })
      })
      .catch(
        (e: unknown) =>
          !cancelled && setPrepared({ key, error: `Could not prepare audio (${e instanceof Error ? e.message : e}).` }),
      )
    return () => {
      cancelled = true
      if (url) URL.revokeObjectURL(url)
    }
  }, [rec, volume.value, key])

  useEffect(() => {
    const a = audio.current
    return () => a?.pause()
  }, [])

  const stop = () => {
    audio.current?.pause()
    setPlaying(false)
    setEndAt(null)
  }

  const play = () => {
    const a = audio.current
    if (!a || !srcUrl) return
    if (a.src !== srcUrl) a.src = srcUrl
    a.loop = true
    void a.play()
    setPlaying(true)
    setEndAt(settings.sleepMinutes ? Date.now() + settings.sleepMinutes * 60_000 : null)
    setMediaSession('Sleep affirmations', { play: () => void a.play(), pause: () => a.pause() })
  }

  const checkTimer = () => {
    if (endAt && Date.now() >= endAt) stop()
  }

  useEffect(() => {
    if (!endAt) return
    const t = setInterval(checkTimer, 5000)
    return () => clearInterval(t)
  })

  return (
    <div className="flex min-h-dvh flex-col bg-slate-950 pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)] text-slate-200">
      <audio ref={audio} onTimeUpdate={checkTimer} onPause={() => setPlaying(false)} className="hidden" />
      <header className="px-4 py-3">
        <Link to="/recordings" aria-label="Close" className="inline-block text-slate-500">
          <XIcon />
        </Link>
      </header>

      <div className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center gap-8 px-6 text-center">
        <MoonIcon className="size-12 text-indigo-300" />
        <div>
          <h1 className="text-2xl font-semibold">Sleep Playback</h1>
          <p className="mt-1 text-sm text-slate-500">
            {rec === undefined
              ? 'Loading…'
              : rec
                ? `${rec.kind === 'monotone' ? 'Monotone' : 'Animated (no Monotone yet)'} recording · ${formatDuration(rec.durationMs)}`
                : 'No recording yet.'}
          </p>
        </div>

        {rec === null ? (
          <Link to="/record/monotone" className="rounded-xl bg-rose-600 px-5 py-3 font-medium text-white">
            Record your Monotone version
          </Link>
        ) : (
          <>
            <div className="w-full space-y-3">
              <div className="grid grid-cols-4 gap-1 rounded-xl bg-slate-900 p-1">
                {VOLUMES.map((v) => (
                  <button
                    key={v.label}
                    type="button"
                    disabled={playing}
                    onClick={() => update({ sleepVolume: v.value })}
                    className={segment(v === volume)}
                  >
                    {v.label}
                  </button>
                ))}
              </div>
              <div className="grid grid-cols-3 gap-1 rounded-xl bg-slate-900 p-1">
                {SLEEP_MINUTES.map((m) => (
                  <button
                    key={m}
                    type="button"
                    disabled={playing}
                    onClick={() => update({ sleepMinutes: m })}
                    className={segment(m === settings.sleepMinutes)}
                  >
                    {timerLabel(m)}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="button"
              disabled={!srcUrl}
              onClick={playing ? stop : play}
              aria-label={playing ? 'Stop' : 'Play'}
              className="grid size-28 place-items-center rounded-full bg-indigo-500/20 text-indigo-200 ring-1 ring-indigo-400/30 hover:bg-indigo-500/30 disabled:opacity-40"
            >
              {playing ? <span className="size-8 rounded-md bg-indigo-200" /> : <PlayIcon className="size-12" />}
            </button>

            <p className="min-h-6 text-sm text-slate-400">
              {error ||
                (!srcUrl
                  ? 'Preparing…'
                  : playing
                    ? endAt
                      ? `Playing · stops at ${clock(endAt)}`
                      : 'Playing all night'
                    : 'Tap play, then lock your phone.')}
            </p>
          </>
        )}

        <p className="text-xs leading-relaxed text-slate-600">
          Playback continues with the screen locked. Use the side buttons to fine-tune the volume. Keep this page open
          (leaving it stops playback).
        </p>
      </div>
    </div>
  )
}
