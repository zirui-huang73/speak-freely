import { useEffect, useRef, useState, type ReactNode } from 'react'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import { XIcon } from '../../app/icons'
import { CAPRIO_QUOTE } from '../../content/affirmations'
import { fillName } from '../../lib/library'
import {
  formatDuration,
  KIND_INFO,
  pickMimeType,
  RECORDING_KINDS,
  recordingBlob,
  saveRecording,
  type Recording,
  type RecordingKind,
} from '../../lib/recordings'
import { keepAwake } from '../../lib/wakeLock'
import { useLibrary } from '../library/libraryContext'
import { useSettings } from '../settings/settingsContext'

type Phase = 'intro' | 'recording' | 'saving' | 'done' | 'error'

export function RecorderPage() {
  const { kind } = useParams()
  if (!RECORDING_KINDS.includes(kind as RecordingKind)) return <Navigate to="/recordings" replace />
  return <Recorder kind={kind as RecordingKind} />
}

function Recorder({ kind }: { kind: RecordingKind }) {
  const navigate = useNavigate()
  const { data, cardById } = useLibrary()
  const { settings } = useSettings()
  const [phase, setPhase] = useState<Phase>('intro')
  const [error, setError] = useState('')
  const [times, setTimes] = useState(3)
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  const [elapsed, setElapsed] = useState(0)
  const [saved, setSaved] = useState<{ url: string; durationMs: number } | null>(null)

  const recorder = useRef<MediaRecorder | null>(null)
  const stream = useRef<MediaStream | null>(null)
  const chunks = useRef<Blob[]>([])
  const activeMs = useRef(0)
  const activeSince = useRef<number | null>(null)
  const meter = useRef<HTMLDivElement>(null)
  const cleanup = useRef<() => void>(() => {})

  const items = [CAPRIO_QUOTE, ...data.todayTen.map((id) => fillName(cardById.get(id)?.text ?? '', settings.name))]
  const info = KIND_INFO[kind]
  const totalMs = () => activeMs.current + (activeSince.current ? Date.now() - activeSince.current : 0)

  useEffect(() => () => cleanup.current(), [])
  useEffect(() => () => {
    if (saved) URL.revokeObjectURL(saved.url)
  }, [saved])

  useEffect(() => {
    if (phase !== 'recording') return
    const t = setInterval(() => setElapsed(totalMs()), 500)
    return () => clearInterval(t)
  }, [phase])

  const start = async () => {
    const mimeType = pickMimeType((t) => MediaRecorder.isTypeSupported(t))
    try {
      const s = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true } })
      stream.current = s
      const rec = new MediaRecorder(s, mimeType ? { mimeType } : undefined)
      recorder.current = rec
      chunks.current = []
      rec.ondataavailable = (e) => e.data.size && chunks.current.push(e.data)
      rec.start(1000)
      activeMs.current = 0
      activeSince.current = Date.now()

      const ctx = new AudioContext()
      const analyser = ctx.createAnalyser()
      analyser.fftSize = 512
      ctx.createMediaStreamSource(s).connect(analyser)
      const buf = new Uint8Array(analyser.fftSize)
      let raf = 0
      const draw = () => {
        analyser.getByteTimeDomainData(buf)
        let peak = 0
        for (const b of buf) peak = Math.max(peak, Math.abs(b - 128))
        if (meter.current) meter.current.style.width = `${Math.min(100, (peak / 128) * 160)}%`
        raf = requestAnimationFrame(draw)
      }
      draw()
      const release = keepAwake()
      cleanup.current = () => {
        cancelAnimationFrame(raf)
        void ctx.close()
        release()
        s.getTracks().forEach((t) => t.stop())
        if (rec.state !== 'inactive') {
          rec.ondataavailable = null
          rec.onstop = null
          rec.stop()
        }
      }
      setIndex(0)
      setPaused(false)
      setPhase('recording')
    } catch (e) {
      setError(
        e instanceof DOMException && e.name === 'NotAllowedError'
          ? 'Microphone access was blocked. Allow it in your browser settings and try again.'
          : `Could not start recording (${e instanceof Error ? e.message : String(e)}).`,
      )
      setPhase('error')
    }
  }

  const togglePause = () => {
    const rec = recorder.current
    if (!rec) return
    if (paused) {
      rec.resume()
      activeSince.current = Date.now()
    } else {
      rec.pause()
      activeMs.current = totalMs()
      activeSince.current = null
    }
    setPaused(!paused)
  }

  const finish = () => {
    const rec = recorder.current
    if (!rec) return
    const durationMs = totalMs()
    activeSince.current = null
    setPhase('saving')
    rec.onstop = async () => {
      const blob = new Blob(chunks.current, { type: rec.mimeType || 'audio/mp4' })
      const recording: Recording = {
        kind,
        data: await blob.arrayBuffer(),
        mimeType: blob.type,
        createdAt: Date.now(),
        durationMs,
      }
      await saveRecording(recording)
      cleanup.current()
      setSaved({ url: URL.createObjectURL(recordingBlob(recording)), durationMs })
      setPhase('done')
    }
    rec.stop()
  }

  const cancel = () => {
    if (phase === 'recording' && !confirm('Discard this recording?')) return
    cleanup.current()
    navigate('/recordings')
  }

  const shell = (body: ReactNode) => (
    <div className="flex min-h-dvh flex-col bg-slate-100 pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)] dark:bg-slate-950">
      <header className="flex items-center gap-3 px-4 py-3">
        <button type="button" onClick={cancel} aria-label="Close" className="text-slate-500">
          <XIcon />
        </button>
        <div className="flex-1">
          <p className="text-sm font-medium">Record: {info.title}</p>
          {phase === 'recording' && (
            <p className="text-xs text-slate-500">
              {index === 0 ? "Caprio's words" : `Affirmation ${index} of ${items.length - 1}`}
            </p>
          )}
        </div>
        {phase === 'recording' && (
          <span className="flex items-center gap-2 font-mono text-sm tabular-nums">
            <span className={`size-2.5 rounded-full ${paused ? 'bg-slate-400' : 'animate-pulse bg-rose-500'}`} />
            {formatDuration(elapsed)}
          </span>
        )}
      </header>
      {body}
    </div>
  )

  if (phase === 'intro' || phase === 'error') {
    return shell(
      <div className="mx-auto flex w-full max-w-lg flex-1 flex-col justify-center gap-5 p-6">
        <h1 className="text-3xl font-bold">{info.title} recording</h1>
        <p className="text-lg">{info.how}</p>
        <p className="text-slate-500">{info.use}</p>
        <ul className="list-disc space-y-1 pl-5 text-sm text-slate-600 dark:text-slate-300">
          <li>You will read Caprio's words, then your Today's 10, one screen at a time.</li>
          <li>Find a quiet place. Hold the phone about 20 cm from your mouth.</li>
          <li>This replaces your previous {info.title.toLowerCase()} recording.</li>
        </ul>
        <div>
          <p className="mb-2 text-sm font-medium text-slate-600 dark:text-slate-300">Times to say each affirmation</p>
          <div className="grid grid-cols-3 gap-1 rounded-xl bg-white p-1 dark:bg-slate-800">
            {[1, 3, 5].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setTimes(n)}
                className={`rounded-lg py-2 font-medium ${times === n ? 'bg-teal-700 text-white' : 'text-slate-500'}`}
              >
                {n}×
              </button>
            ))}
          </div>
        </div>
        {error && <p className="rounded-xl bg-rose-50 p-3 text-sm text-rose-700 dark:bg-rose-950 dark:text-rose-200">{error}</p>}
        <button type="button" onClick={start} className="rounded-xl bg-rose-600 py-3.5 text-lg font-medium text-white hover:bg-rose-700">
          Start recording
        </button>
      </div>,
    )
  }

  if (phase === 'saving') return shell(<p className="flex flex-1 items-center justify-center text-slate-500">Saving…</p>)

  if (phase === 'done' && saved) {
    return shell(
      <div className="mx-auto flex w-full max-w-lg flex-1 flex-col justify-center gap-5 p-6 text-center">
        <h1 className="text-3xl font-bold">Saved</h1>
        <p className="text-slate-500">
          {info.title} recording · {formatDuration(saved.durationMs)}
        </p>
        <audio controls src={saved.url} className="w-full" />
        <div className="flex justify-center gap-3">
          <Link to="/recordings" className="rounded-xl bg-teal-700 px-5 py-3 font-medium text-white">
            Done
          </Link>
          <button type="button" onClick={() => setPhase('intro')} className="rounded-xl border border-slate-300 px-5 py-3 font-medium dark:border-slate-700">
            Record again
          </button>
        </div>
      </div>,
    )
  }

  const last = index === items.length - 1
  return shell(
    <>
      <div className="mx-4 my-5 flex flex-1 flex-col items-center justify-center rounded-3xl bg-white p-8 text-center shadow-sm dark:bg-slate-900">
        <p className={`leading-snug font-medium text-balance ${index === 0 ? 'text-xl md:text-2xl' : 'text-2xl md:text-4xl'}`}>
          {index === 0 ? `“${items[0]}”` : items[index]}
        </p>
        <p className="mt-6 text-sm text-slate-400">
          {paused ? 'Paused' : index === 0 ? 'Read it once, then tap Next' : `Say it ${times}× ${kind === 'monotone' ? 'calmly and evenly' : 'with feeling'}, then tap Next`}
        </p>
        <div className="mt-8 h-1.5 w-40 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
          <div ref={meter} className="h-full w-0 bg-teal-500 transition-[width] duration-75" />
        </div>
      </div>
      <footer className="flex items-center justify-center gap-3 px-4 pb-5">
        <button type="button" onClick={togglePause} className="rounded-xl border border-slate-300 px-5 py-3 font-medium dark:border-slate-700">
          {paused ? 'Resume' : 'Pause'}
        </button>
        <button
          type="button"
          disabled={paused}
          onClick={() => (last ? finish() : setIndex(index + 1))}
          className="rounded-xl bg-teal-700 px-8 py-3 font-medium text-white disabled:opacity-40"
        >
          {last ? 'Finish' : 'Next'}
        </button>
      </footer>
    </>,
  )
}
