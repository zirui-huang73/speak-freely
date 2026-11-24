import { useEffect, useRef, useState } from 'react'
import { PencilIcon, TrashIcon } from '../../app/icons'
import { LINKED_SENTENCES, SCENES, type SceneId } from '../../content/crutches'
import { countSyllables, parseSentence, pickOther, type Phrase } from '../../lib/crutches'
import { fillName } from '../../lib/library'
import { PACE_RATES, planOf } from '../../lib/settings'
import { createTicker, type Ticker } from '../../lib/tick'
import { useSettings } from '../settings/settingsContext'
import { useCrutches } from './crutchContext'
import { DrillShell, primaryBtn, secondaryBtn } from './DrillShell'

type Phase = 'speak' | 'stop' | 'done'
type Filter = 'all' | 'mine' | SceneId

const chip = (active: boolean) =>
  `shrink-0 rounded-full border px-3 py-1 text-sm font-medium ${
    active
      ? 'border-teal-700 bg-teal-700 text-white'
      : 'border-slate-300 bg-white text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300'
  }`

function PhrasePreview({ phrases }: { phrases: Phrase[] }) {
  return (
    <span>
      {phrases.map((p, i) => (
        <span key={i}>
          {p.words.join('‿')}
          {p.stop > 0 && <span className="mx-1 text-teal-600">{'•'.repeat(p.stop)}</span>}{' '}
        </span>
      ))}
    </span>
  )
}

function MySentences() {
  const { data, addSentence, updateSentence, removeSentence } = useCrutches()
  const [text, setText] = useState('')
  const [editing, setEditing] = useState<{ old: string; text: string } | null>(null)
  const input = 'w-full rounded-xl border border-slate-300 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-800'

  return (
    <details className="mt-5 rounded-2xl bg-white p-4 dark:bg-slate-900">
      <summary className="cursor-pointer font-medium">My sentences ({data.mySentences.length})</summary>
      <p className="mt-2 text-sm text-slate-500">
        Write what you really say: your meeting opener, your intro. Use <b>|</b> for a 1-second stop and <b>||</b> for 2 seconds.
        Keep each part to 1–5 words.
      </p>
      <form
        className="mt-3 space-y-2"
        onSubmit={(e) => {
          e.preventDefault()
          if (!text.trim()) return
          addSentence(text)
          setText('')
        }}
      >
        <textarea rows={2} aria-label="New sentence" className={input} value={text} placeholder="Quick update || two things." onChange={(e) => setText(e.target.value)} />
        {text.trim() && (
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Preview: <PhrasePreview phrases={parseSentence(text)} />
          </p>
        )}
        <button type="submit" disabled={!text.trim()} className={`${primaryBtn} py-2 text-sm`}>
          Add sentence
        </button>
      </form>
      <ul className="mt-4 space-y-2">
        {data.mySentences.map((s) =>
          editing?.old === s ? (
            <li key={s} className="space-y-2">
              <textarea rows={2} aria-label="Edit sentence" className={input} value={editing.text} onChange={(e) => setEditing({ old: s, text: e.target.value })} />
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setEditing(null)} className={`${secondaryBtn} py-1.5 text-sm`}>
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={!editing.text.trim()}
                  onClick={() => {
                    updateSentence(s, editing.text)
                    setEditing(null)
                  }}
                  className={`${primaryBtn} py-1.5 text-sm`}
                >
                  Save
                </button>
              </div>
            </li>
          ) : (
            <li key={s} className="flex items-start gap-2 text-sm">
              <span className="flex-1">
                <PhrasePreview phrases={parseSentence(s)} />
              </span>
              <button type="button" aria-label="Edit" onClick={() => setEditing({ old: s, text: s })} className="text-slate-400">
                <PencilIcon className="size-5" />
              </button>
              <button type="button" aria-label="Delete" onClick={() => confirm('Delete this sentence?') && removeSentence(s)} className="text-slate-400">
                <TrashIcon className="size-5" />
              </button>
            </li>
          ),
        )}
      </ul>
    </details>
  )
}

export function LinkingDrillPage() {
  const { settings, update } = useSettings()
  const { data, addCount } = useCrutches()
  const name = settings.name.trim()
  const [filter, setFilter] = useState<Filter>('all')

  const poolFor = (f: Filter) => {
    const builtIn = f === 'mine' ? [] : LINKED_SENTENCES.filter((s) => (f === 'all' || s.scene === f) && (name || !s.text.includes('{name}')))
    const mine = f === 'all' || f === 'mine' ? data.mySentences : []
    return [...builtIn.map((s) => s.text), ...mine].map((s) => fillName(s, name))
  }
  const pool = poolFor(filter)

  const [sentence, setSentence] = useState<string | undefined>(() => pickOther(pool, undefined))
  const [index, setIndex] = useState(0)
  const [phase, setPhase] = useState<Phase>('speak')
  const [tick, setTick] = useState(0)
  const [plan, setPlan] = useState<'pressure' | 'general'>('pressure')
  const [count, setCount] = useState(0)
  const [pace, setPace] = useState(false)
  const [running, setRunning] = useState(false)
  const [syl, setSyl] = useState(0)
  const ticker = useRef<Ticker | null>(null)

  const phrases = sentence ? parseSentence(sentence) : []
  const current = phrases[index]
  const stop = current?.stop ?? 0
  const wordSyllables = current ? current.words.map(countSyllables).map((n) => Math.max(1, n)) : []
  const totalSyl = wordSyllables.reduce((a, b) => a + b, 0)
  let activeWord = 0
  for (let acc = 0, i = 0; i < wordSyllables.length; i++) {
    acc += wordSyllables[i]
    if (syl < acc) {
      activeWord = i
      break
    }
  }

  const advance = () => {
    if (index === phrases.length - 1) {
      setPhase('done')
      setRunning(false)
      addCount(10)
      setCount((c) => c + 1)
    } else if (stop) {
      setTick(0)
      setPhase('stop')
    } else {
      setIndex(index + 1)
      setSyl(0)
    }
  }

  useEffect(() => {
    if (phase !== 'stop') return
    if (tick >= stop) {
      const t = setTimeout(() => {
        setIndex((i) => i + 1)
        setTick(0)
        setSyl(0)
        setPhase('speak')
      }, 150)
      return () => clearTimeout(t)
    }
    const t = setTimeout(() => setTick((n) => n + 1), 1000)
    return () => clearTimeout(t)
  }, [phase, tick, stop])

  useEffect(() => {
    if (!pace || !running || phase !== 'speak' || !totalSyl) return
    ticker.current?.tick()
    const t = setTimeout(() => (syl + 1 < totalSyl ? setSyl(syl + 1) : advance()), 1000 / settings.paceRate)
    return () => clearTimeout(t)
  })

  useEffect(() => () => ticker.current?.close(), [])

  const reset = (next: string | undefined) => {
    setSentence(next)
    setIndex(0)
    setTick(0)
    setSyl(0)
    setRunning(false)
    setPhase('speak')
  }

  const chooseFilter = (f: Filter) => {
    setFilter(f)
    reset(pickOther(poolFor(f), undefined))
  }

  const startPace = () => {
    if (settings.paceTick && !ticker.current) ticker.current = createTicker()
    setRunning(true)
  }

  return (
    <DrillShell title="Link and stop" subtitle={count ? `${count} sentences this round` : 'C-9 to C-12 + Speech Plan'}>
      <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-2 [scrollbar-width:none]">
        <button type="button" className={chip(filter === 'all')} onClick={() => chooseFilter('all')}>
          All
        </button>
        {SCENES.map((s) => (
          <button key={s.id} type="button" className={chip(filter === s.id)} onClick={() => chooseFilter(s.id)}>
            {s.label}
          </button>
        ))}
        <button type="button" className={chip(filter === 'mine')} onClick={() => chooseFilter('mine')}>
          Mine
        </button>
      </div>

      <div className="mt-1 flex items-center gap-2">
        <div className="grid flex-1 grid-cols-2 gap-1 rounded-xl bg-white p-1 text-sm dark:bg-slate-900">
          {(['general', 'pressure'] as const).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPlan(p)}
              className={`rounded-lg py-1.5 font-medium ${plan === p ? 'bg-teal-700 text-white' : 'text-slate-500'}`}
            >
              {p === 'general' ? 'General plan' : 'Pressure plan'}
            </button>
          ))}
        </div>
        <button
          type="button"
          aria-pressed={pace}
          onClick={() => {
            setPace(!pace)
            setRunning(false)
            setSyl(0)
          }}
          className={`rounded-xl px-3 py-2 text-sm font-medium ${pace ? 'bg-teal-700 text-white' : 'bg-white text-slate-600 dark:bg-slate-900 dark:text-slate-300'}`}
        >
          Pace
        </button>
      </div>

      {pace && (
        <div className="mt-2 flex flex-wrap items-center gap-2 rounded-xl bg-white p-2 text-sm dark:bg-slate-900">
          <span className="text-slate-500">Syllables / second</span>
          {PACE_RATES.map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => update({ paceRate: r })}
              className={`rounded-lg px-2.5 py-1 font-medium ${settings.paceRate === r ? 'bg-teal-700 text-white' : 'text-slate-600 dark:text-slate-300'}`}
            >
              {r}
            </button>
          ))}
          <label className="ml-auto flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
            <input type="checkbox" checked={settings.paceTick} onChange={(e) => update({ paceTick: e.target.checked })} className="accent-teal-700" />
            Tick
          </label>
        </div>
      )}

      <p className="mt-2 text-center text-lg font-semibold tracking-wide text-teal-700 dark:text-teal-300">
        {planOf(settings, plan === 'general' ? 'generalPlan' : 'pressurePlan')}
      </p>

      <div
        role="button"
        tabIndex={-1}
        onClick={!pace && phase === 'speak' && sentence ? advance : undefined}
        className="my-3 flex flex-1 cursor-pointer flex-col items-center justify-center rounded-3xl bg-white p-6 text-center shadow-sm select-none dark:bg-slate-900"
      >
        {!sentence ? (
          <p className="text-slate-500">No sentences here yet. Add your own below.</p>
        ) : (
          <>
            <p className="text-2xl leading-relaxed md:text-3xl">
              {phrases.map((p, i) => (
                <span key={i}>
                  <span
                    className={`rounded-lg px-1.5 py-0.5 transition ${
                      phase === 'done' || i < index
                        ? 'text-slate-400'
                        : i === index && phase === 'speak'
                          ? 'bg-teal-100 font-semibold text-teal-900 dark:bg-teal-900 dark:text-teal-50'
                          : ''
                    }`}
                  >
                    {i === index && phase === 'speak' && pace && running
                      ? p.words.map((w, wi) => (
                          <span key={wi} className={wi === activeWord ? 'text-teal-600 underline decoration-4 underline-offset-8 dark:text-teal-300' : ''}>
                            {w}
                            {wi < p.words.length - 1 ? '‿' : ''}
                          </span>
                        ))
                      : p.words.join('‿')}
                  </span>
                  {p.stop > 0 && (
                    <span className="mx-1 inline-flex gap-1 align-middle">
                      {Array.from({ length: p.stop }, (_, d) => (
                        <span
                          key={d}
                          className={`inline-block size-2.5 rounded-full ${
                            (i === index && phase === 'stop' && d < tick) || i < index || phase === 'done'
                              ? 'bg-teal-600'
                              : i === index && phase === 'stop'
                                ? 'animate-pulse bg-teal-300'
                                : 'bg-slate-300 dark:bg-slate-600'
                          }`}
                        />
                      ))}
                    </span>
                  )}{' '}
                </span>
              ))}
            </p>
            {pace && phase === 'speak' && (
              <div className="mt-6 flex flex-wrap justify-center gap-1.5" aria-label="Syllable pace">
                {Array.from({ length: totalSyl }, (_, k) => (
                  <span
                    key={k}
                    className={`size-3 rounded-full transition ${running && k <= syl ? 'bg-teal-600' : 'bg-slate-200 dark:bg-slate-700'}`}
                  />
                ))}
              </div>
            )}
            <p className="mt-6 text-sm text-slate-400">
              {phase === 'stop'
                ? `Full stop… one thousand ${['one', 'two', 'three'][Math.min(tick, 2)]}`
                : phase === 'done'
                  ? 'Lovely. Smile.'
                  : pace
                    ? running
                      ? 'One syllable per dot. Keep the sound flowing between words.'
                      : `Press Start, then speak with the dots (${settings.paceRate} per second).`
                    : 'Say the highlighted words as one long word, then tap.'}
            </p>
          </>
        )}
      </div>

      <div className="flex justify-center gap-3">
        {phase === 'done' ? (
          <button type="button" onClick={() => reset(pickOther(pool, sentence))} className={primaryBtn}>
            Next sentence
          </button>
        ) : (
          <>
            <button type="button" disabled={!sentence} onClick={() => reset(pickOther(pool, sentence))} className={secondaryBtn}>
              Skip
            </button>
            {pace ? (
              <button type="button" disabled={!sentence} onClick={running ? () => setRunning(false) : startPace} className={primaryBtn}>
                {running ? 'Pause' : 'Start'}
              </button>
            ) : (
              <button type="button" onClick={advance} disabled={phase !== 'speak' || !sentence} className={primaryBtn}>
                Said it
              </button>
            )}
          </>
        )}
      </div>
      <p className="mt-4 text-center text-xs text-slate-500">‿ link the words · each dot is a one-second full stop</p>

      <MySentences />
    </DrillShell>
  )
}
