import { useEffect, useState } from 'react'
import { FREE_TALK_TOPICS } from '../../content/crutches'
import { pickOther } from '../../lib/crutches'
import { keepAwake } from '../../lib/wakeLock'
import { useCrutches } from './crutchContext'
import { DrillShell, primaryBtn, secondaryBtn } from './DrillShell'

const DURATIONS = [30, 60, 120]

export function FreeTalkPage() {
  const { addCount } = useCrutches()
  const [topic, setTopic] = useState(() => pickOther(FREE_TALK_TOPICS, undefined))
  const [seconds, setSeconds] = useState(60)
  const [left, setLeft] = useState<number | null>(null)
  const finished = left === 0
  const running = left !== null && left > 0

  useEffect(() => (running ? keepAwake() : undefined), [running])

  useEffect(() => {
    if (!running) return
    const t = setTimeout(() => {
      if (left === 1) addCount(13)
      setLeft(left - 1)
    }, 1000)
    return () => clearTimeout(t)
  }, [running, left, addCount])

  const nextTopic = () => {
    setTopic(pickOther(FREE_TALK_TOPICS, topic))
    setLeft(null)
  }

  const r = 52
  const c = 2 * Math.PI * r
  const progress = left === null ? 0 : 1 - left / seconds

  return (
    <DrillShell title="Free talk" subtitle="C-13 · No crutch at all">
      <div className="my-3 flex flex-1 flex-col items-center justify-center rounded-3xl bg-white p-8 text-center shadow-sm dark:bg-slate-900">
        <p className="text-2xl leading-snug font-medium text-balance md:text-3xl">{topic}</p>
        <div className="relative mt-10 grid size-32 place-items-center">
          <svg viewBox="0 0 120 120" className="absolute inset-0 -rotate-90">
            <circle cx="60" cy="60" r={r} fill="none" strokeWidth="8" className="stroke-slate-200 dark:stroke-slate-800" />
            <circle
              cx="60"
              cy="60"
              r={r}
              fill="none"
              strokeWidth="8"
              strokeLinecap="round"
              className="stroke-teal-600 transition-[stroke-dashoffset] duration-1000 ease-linear"
              strokeDasharray={c}
              strokeDashoffset={c * (1 - progress)}
            />
          </svg>
          <span className="text-3xl font-semibold tabular-nums">{left ?? seconds}s</span>
        </div>
        <p className="mt-6 max-w-sm text-sm text-slate-500">
          {finished
            ? 'Time! Grade it Pass unless a fluent listener would clearly have noticed a problem. Small slips are a Pass.'
            : 'Think the message, not the words. Smile, and let your brain choose the words.'}
        </p>
      </div>

      {left === null && (
        <div className="mb-3 flex justify-center gap-1 rounded-xl bg-white p-1 dark:bg-slate-900">
          {DURATIONS.map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => setSeconds(d)}
              className={`flex-1 rounded-lg py-1.5 text-sm font-medium ${seconds === d ? 'bg-teal-700 text-white' : 'text-slate-500'}`}
            >
              {d < 60 ? `${d} s` : `${d / 60} min`}
            </button>
          ))}
        </div>
      )}

      <div className="flex justify-center gap-3">
        <button type="button" onClick={nextTopic} className={secondaryBtn}>
          {finished ? 'Next topic' : 'Other topic'}
        </button>
        {!finished && (
          <button
            type="button"
            onClick={() => setLeft(running ? null : seconds)}
            className={primaryBtn}
          >
            {running ? 'Stop' : 'Start'}
          </button>
        )}
      </div>
    </DrillShell>
  )
}
