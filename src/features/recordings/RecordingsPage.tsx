import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { MoonIcon, PlayIcon, TrashIcon } from '../../app/icons'
import { Card, PageHeader } from '../../app/ui'
import { setMediaSession } from '../../lib/audio'
import {
  deleteRecording,
  formatDuration,
  KIND_INFO,
  loadAllRecordings,
  RECORDING_KINDS,
  recordingBlob,
  type Recording,
  type RecordingKind,
} from '../../lib/recordings'

const date = (t: number) =>
  new Date(t).toLocaleString([], { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })

export function RecordingsPage() {
  const [recs, setRecs] = useState<Partial<Record<RecordingKind, Recording>> | null>(null)
  const [playing, setPlaying] = useState<RecordingKind | null>(null)
  const audio = useRef<HTMLAudioElement>(null)
  const url = useRef<string | null>(null)

  useEffect(() => {
    loadAllRecordings().then(setRecs)
    const a = audio.current
    const urls = url
    return () => {
      a?.pause()
      if (urls.current) URL.revokeObjectURL(urls.current)
    }
  }, [])

  const stop = () => {
    audio.current?.pause()
    if (url.current) URL.revokeObjectURL(url.current)
    url.current = null
    setPlaying(null)
  }

  const play = (kind: RecordingKind) => {
    const rec = recs?.[kind]
    const a = audio.current
    if (!rec || !a) return
    stop()
    url.current = URL.createObjectURL(recordingBlob(rec))
    a.src = url.current
    a.loop = true
    void a.play()
    setPlaying(kind)
    setMediaSession(`${KIND_INFO[kind].title} affirmations`, { play: () => void a.play(), pause: () => a.pause() })
  }

  const remove = async (kind: RecordingKind) => {
    if (!confirm(`Delete your ${KIND_INFO[kind].title.toLowerCase()} recording?`)) return
    if (playing === kind) stop()
    await deleteRecording(kind)
    setRecs(await loadAllRecordings())
  }

  return (
    <>
      <PageHeader title="Recordings" subtitle="Hear yourself speaking fluently, in your own voice." />
      <audio ref={audio} onPause={() => setPlaying(null)} className="hidden" />
      <div className="space-y-4">
        <p className="text-sm text-slate-600 dark:text-slate-300">
          The book suggests recording your affirmation session twice: listen to the <b>Animated</b> version in idle
          moments (up to an hour a day), and play the <b>Monotone</b> version very softly while you sleep.
        </p>

        {RECORDING_KINDS.map((kind) => {
          const rec = recs?.[kind]
          const info = KIND_INFO[kind]
          return (
            <Card key={kind}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold">{info.title}</h2>
                  <p className="text-sm text-slate-500">{info.use}</p>
                </div>
                {rec && (
                  <button
                    type="button"
                    aria-label="Delete"
                    onClick={() => remove(kind)}
                    className="grid size-9 place-items-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-rose-600 dark:hover:bg-slate-800"
                  >
                    <TrashIcon className="size-5" />
                  </button>
                )}
              </div>
              <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">
                {recs === null
                  ? 'Loading…'
                  : rec
                    ? `Recorded ${date(rec.createdAt)} · ${formatDuration(rec.durationMs)}`
                    : 'Not recorded yet.'}
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {rec && (
                  <button
                    type="button"
                    onClick={() => (playing === kind ? stop() : play(kind))}
                    className="flex items-center gap-2 rounded-xl bg-teal-700 px-4 py-2.5 font-medium text-white hover:bg-teal-800"
                  >
                    {playing === kind ? (
                      <>
                        <span className="size-3 rounded-sm bg-white" /> Stop
                      </>
                    ) : (
                      <>
                        <PlayIcon className="size-4" /> Play on loop
                      </>
                    )}
                  </button>
                )}
                <Link
                  to={`/record/${kind}`}
                  className={`rounded-xl px-4 py-2.5 font-medium ${
                    rec
                      ? 'border border-slate-300 text-slate-600 dark:border-slate-700 dark:text-slate-300'
                      : 'bg-rose-600 text-white hover:bg-rose-700'
                  }`}
                >
                  {rec ? 'Re-record' : 'Record'}
                </Link>
              </div>
            </Card>
          )
        })}

        <Link
          to="/sleep"
          className="flex items-center gap-4 rounded-2xl bg-slate-900 p-5 text-slate-100 hover:bg-slate-800 dark:bg-slate-800"
        >
          <MoonIcon className="size-8 text-indigo-300" />
          <div className="flex-1">
            <p className="font-semibold">Sleep Playback</p>
            <p className="text-sm text-slate-400">Monotone recording, very softly, with a timer.</p>
          </div>
        </Link>
      </div>
    </>
  )
}
