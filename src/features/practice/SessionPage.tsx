import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import { CheckIcon, SpeakerIcon, XIcon } from '../../app/icons'
import { CAPRIO_QUOTE } from '../../content/affirmations'
import { fillName } from '../../lib/library'
import { SLOTS, streak, type SessionSlot } from '../../lib/practice'
import { speak, stopSpeaking } from '../../lib/speech'
import { useLibrary } from '../library/libraryContext'
import { useSettings } from '../settings/settingsContext'
import { Breathe } from './Breathe'
import { SLOT_INFO, usePractice } from './practiceContext'

const BREATHE = -2
const QUOTE = -1
const vibrate = (ms: number) => 'vibrate' in navigator && navigator.vibrate(ms)

function ProgressRing({ value, max }: { value: number; max: number }) {
  const r = 52
  const c = 2 * Math.PI * r
  return (
    <div className="relative grid size-32 place-items-center">
      <svg viewBox="0 0 120 120" className="absolute inset-0 -rotate-90">
        <circle cx="60" cy="60" r={r} fill="none" strokeWidth="8" className="stroke-slate-200 dark:stroke-slate-800" />
        <circle
          cx="60"
          cy="60"
          r={r}
          fill="none"
          strokeWidth="8"
          strokeLinecap="round"
          className="stroke-teal-600 transition-[stroke-dashoffset] duration-200"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - value / max)}
        />
      </svg>
      <span className="text-3xl font-semibold tabular-nums">
        {value}
        <span className="text-base text-slate-400">/{max}</span>
      </span>
    </div>
  )
}

export function SessionPage() {
  const { slot } = useParams()
  if (!SLOTS.includes(slot as SessionSlot)) return <Navigate to="/" replace />
  return <Session slot={slot as SessionSlot} />
}

function Session({ slot }: { slot: SessionSlot }) {
  const navigate = useNavigate()
  const { data, cardById, addReps } = useLibrary()
  const { settings } = useSettings()
  const { log, markSession } = usePractice()
  const [step, setStep] = useState(BREATHE)
  const [reps, setReps] = useState(0)
  const [total, setTotal] = useState(0)
  const [startedAt] = useState(() => Date.now())
  const [minutes, setMinutes] = useState(0)
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined)

  const ten = data.todayTen.map((id) => fillName(cardById.get(id)?.text ?? '', settings.name))
  const target = settings.reps
  const done = step >= ten.length

  const finishBreathing = useCallback(() => setStep(QUOTE), [])

  const goTo = (next: number) => {
    clearTimeout(timer.current)
    stopSpeaking()
    setReps(0)
    setStep(next)
    if (next >= ten.length) {
      markSession(slot)
      setMinutes(Math.max(1, Math.round((Date.now() - startedAt) / 60000)))
      vibrate(80)
    }
  }

  useEffect(() => () => clearTimeout(timer.current), [])

  const count = () => {
    if (step < 0 || done || reps >= target) return
    const r = reps + 1
    setReps(r)
    setTotal((t) => t + 1)
    addReps(data.todayTen[step])
    vibrate(r >= target ? 40 : 10)
    if (r >= target) timer.current = setTimeout(() => goTo(step + 1), 500)
  }

  const exit = () => {
    if (step < 0 || done || confirm('Leave this session? Progress in this session will not be saved.')) {
      stopSpeaking()
      navigate('/')
    }
  }

  if (done) {
    const s = streak(log, startedAt)
    return (
      <div className="grid min-h-dvh place-items-center p-6 text-center">
        <div>
          <div className="mx-auto grid size-20 place-items-center rounded-full bg-teal-600 text-white">
            <CheckIcon className="size-10" />
          </div>
          <h1 className="mt-5 text-3xl font-bold">{SLOT_INFO[slot].title} session complete</h1>
          <p className="mt-2 text-slate-500">
            {ten.length} affirmations · {total} repetitions · {minutes} min
          </p>
          {s > 0 && <p className="mt-1 font-medium text-teal-700 dark:text-teal-300">{s}-day streak</p>}
          <p className="mx-auto mt-6 max-w-sm text-lg text-teal-700 italic dark:text-teal-300">“{ten[ten.length - 1]}”</p>
          <Link to="/" className="mt-8 inline-block rounded-xl bg-teal-700 px-6 py-3 font-medium text-white">
            Back to Today
          </Link>
        </div>
      </div>
    )
  }

  const isCard = step >= 0
  const text = isCard ? ten[step] : CAPRIO_QUOTE

  return (
    <div className="flex min-h-dvh flex-col bg-slate-100 pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)] dark:bg-slate-950">
      <header className="flex items-center gap-3 px-4 py-3">
        <button type="button" onClick={exit} aria-label="Close" className="text-slate-500">
          <XIcon />
        </button>
        <div className="flex-1">
          <p className="text-sm font-medium">{SLOT_INFO[slot].title} session</p>
          <p className="text-xs text-slate-500">
            {step === BREATHE ? 'Relax' : step === QUOTE ? 'Set your mind' : `Affirmation ${step + 1} of ${ten.length}`}
          </p>
        </div>
      </header>
      <div className="mx-4 flex gap-1">
        {ten.map((_, i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full ${i < step ? 'bg-teal-600' : i === step ? 'bg-teal-400' : 'bg-slate-200 dark:bg-slate-800'}`}
          />
        ))}
      </div>

      {step === BREATHE ? (
        <Breathe onDone={finishBreathing} />
      ) : (
        <>
          <div
            role="button"
            tabIndex={-1}
            onClick={count}
            className={`mx-4 my-5 flex flex-1 flex-col items-center justify-center rounded-3xl bg-white p-8 text-center shadow-sm select-none dark:bg-slate-900 ${
              isCard ? 'cursor-pointer' : ''
            }`}
          >
            {!isCard && (
              <p className="mb-4 text-xs font-semibold tracking-wider text-teal-700 uppercase dark:text-teal-300">
                Say this out loud first
              </p>
            )}
            <p className={`leading-snug font-medium text-balance ${isCard ? 'text-2xl md:text-4xl' : 'text-xl md:text-2xl'}`}>
              {isCard ? text : `“${text}”`}
            </p>
            {isCard ? (
              <>
                <div className="mt-10">
                  <ProgressRing value={reps} max={target} />
                </div>
                <p className="mt-4 text-sm text-slate-400">
                  {reps >= target ? 'Well done!' : 'Visualize yourself speaking easily. Say it, then tap.'}
                </p>
              </>
            ) : (
              <p className="mt-4 text-sm text-slate-400">— Frank S. Caprio, M.D.</p>
            )}
          </div>
          <footer className="flex items-center justify-center gap-4 px-4 pb-5">
            <button
              type="button"
              aria-label="Listen"
              onClick={() => speak(text, settings)}
              className="grid size-12 place-items-center rounded-full bg-white text-slate-600 shadow-sm dark:bg-slate-800 dark:text-slate-300"
            >
              <SpeakerIcon />
            </button>
            {isCard ? (
              <button type="button" onClick={() => goTo(step + 1)} className="px-4 py-2 text-sm text-slate-500">
                Skip
              </button>
            ) : (
              <button
                type="button"
                onClick={() => goTo(0)}
                className="rounded-xl bg-teal-700 px-6 py-3 font-medium text-white hover:bg-teal-800"
              >
                I said it
              </button>
            )}
          </footer>
        </>
      )}
    </div>
  )
}
