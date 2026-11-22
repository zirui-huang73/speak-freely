import { useEffect, useState } from 'react'
import type { HypnosisMode } from '../../content/hypnosis'
import { speechMs, type TimedLine } from '../../lib/hypnosis'
import type { NoiseHandle } from '../../lib/noise'
import { suggestedSlot } from '../../lib/practice'
import { speak, stopSpeaking } from '../../lib/speech'
import { keepAwake } from '../../lib/wakeLock'
import { usePractice } from '../practice/practiceContext'
import { useSettings } from '../settings/settingsContext'

export interface HypnosisSession {
  mode: HypnosisMode
  minutes: number
  lines: TimedLine[]
  noise: NoiseHandle | null
}

type Status = 'running' | 'paused'

const dimBtn = 'rounded-full border border-slate-800 px-5 py-2.5 text-sm text-slate-500 hover:text-slate-300'

export function HypnosisPlayer({ session, onClose }: { session: HypnosisSession; onClose: () => void }) {
  const { settings } = useSettings()
  const { markSession } = usePractice()
  const [index, setIndex] = useState(0)
  const [status, setStatus] = useState<Status>('running')
  const [showText, setShowText] = useState(true)
  const { lines, noise, mode } = session
  const rate = settings.hypnosisRate
  const done = index >= lines.length

  useEffect(() => {
    if (status !== 'running' || index >= lines.length) return
    let cancelled = false
    let timer: ReturnType<typeof setTimeout> | undefined
    const line = lines[index]
    const finish = () => {
      const slot = mode === 'bedtime' ? 'bedtime' : suggestedSlot(Date.now()) === 'morning' ? 'morning' : 'midday'
      markSession(slot)
      noise?.fadeOut(mode === 'bedtime' ? 60_000 : 4000)
    }
    speak(line.text, { voiceURI: settings.voiceURI, rate, volume: line.volume ?? 1 }).then(() => {
      if (cancelled) return
      timer = setTimeout(() => {
        if (index + 1 >= lines.length) finish()
        setIndex(index + 1)
      }, line.pauseMs)
    })
    return () => {
      cancelled = true
      clearTimeout(timer)
      stopSpeaking()
    }
  }, [index, status, lines, mode, noise, markSession, rate, settings.voiceURI])

  useEffect(() => {
    if ((status === 'running' && !done) || (done && mode === 'daytime')) return keepAwake()
  }, [status, done, mode])

  useEffect(() => () => noise?.stop(), [noise])

  const togglePause = () => {
    if (status === 'running') {
      setStatus('paused')
      noise?.pause()
    } else {
      setStatus('running')
      noise?.resume()
    }
  }

  const end = () => {
    if (!done && !confirm('End this session?')) return
    stopSpeaking()
    onClose()
  }

  const remainingMin = Math.max(
    1,
    Math.round(lines.slice(index).reduce((s, l) => s + speechMs(l.text, rate) + l.pauseMs, 0) / 60_000),
  )

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)] text-slate-500 select-none">
      <div className="h-0.5 bg-slate-900">
        <div className="h-full bg-indigo-900 transition-all duration-1000" style={{ width: `${(index / lines.length) * 100}%` }} />
      </div>

      <div className="flex flex-1 flex-col items-center justify-center gap-10 px-8 text-center">
        {done ? (
          mode === 'daytime' ? (
            <div className="space-y-4">
              <p className="text-3xl font-light text-slate-300">Welcome back</p>
              <p className="text-sm">Session complete. Carry this calm with you.</p>
            </div>
          ) : (
            <p className="text-xl font-light text-slate-700">Sleep well</p>
          )
        ) : (
          <>
            <div className={`size-40 rounded-full bg-indigo-950/40 ${status === 'running' ? 'animate-[pulse_8s_ease-in-out_infinite]' : ''}`} />
            <p className={`max-w-md text-lg leading-relaxed text-slate-600 transition-opacity ${showText ? 'opacity-100' : 'opacity-0'}`}>
              {status === 'paused' ? 'Paused' : lines[Math.min(index, lines.length - 1)].text}
            </p>
          </>
        )}
      </div>

      <div className="flex items-center justify-center gap-3 px-6 pb-6">
        {!done && (
          <>
            <button type="button" onClick={() => setShowText(!showText)} className={dimBtn}>
              {showText ? 'Hide text' : 'Show text'}
            </button>
            <button type="button" onClick={togglePause} className={dimBtn}>
              {status === 'paused' ? 'Resume' : 'Pause'}
            </button>
          </>
        )}
        <button type="button" onClick={end} className={dimBtn}>
          {done ? 'Close' : 'End'}
        </button>
      </div>
      {!done && <p className="pb-4 text-center text-xs text-slate-700">about {remainingMin} min left</p>}
    </div>
  )
}
