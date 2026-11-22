import { useEffect, useState } from 'react'
import { LINKED_SENTENCES } from '../../content/crutches'
import { fillName } from '../../lib/library'
import { parseSentence, pickOther } from '../../lib/crutches'
import { planOf } from '../../lib/settings'
import { useSettings } from '../settings/settingsContext'
import { useCrutches } from './crutchContext'
import { DrillShell, primaryBtn, secondaryBtn } from './DrillShell'

type Phase = 'speak' | 'stop' | 'done'

export function LinkingDrillPage() {
  const { settings } = useSettings()
  const { addCount } = useCrutches()
  const name = settings.name.trim()
  const sentences = LINKED_SENTENCES.filter((s) => name || !s.includes('{name}')).map((s) => fillName(s, name))

  const [sentence, setSentence] = useState(() => pickOther(sentences, undefined))
  const [index, setIndex] = useState(0)
  const [phase, setPhase] = useState<Phase>('speak')
  const [tick, setTick] = useState(0)
  const [plan, setPlan] = useState<'pressure' | 'general'>('pressure')
  const [count, setCount] = useState(0)
  const phrases = parseSentence(sentence)
  const stop = phrases[index]?.stop ?? 0

  useEffect(() => {
    if (phase !== 'stop') return
    if (tick >= stop) {
      const t = setTimeout(() => {
        setIndex((i) => i + 1)
        setTick(0)
        setPhase('speak')
      }, 150)
      return () => clearTimeout(t)
    }
    const t = setTimeout(() => setTick((n) => n + 1), 1000)
    return () => clearTimeout(t)
  }, [phase, tick, stop])

  const said = () => {
    if (phase !== 'speak') return
    if (index === phrases.length - 1) {
      setPhase('done')
      addCount(10)
      setCount((c) => c + 1)
    } else if (stop) {
      setTick(0)
      setPhase('stop')
    } else setIndex(index + 1)
  }

  const nextSentence = () => {
    setSentence(pickOther(sentences, sentence))
    setIndex(0)
    setTick(0)
    setPhase('speak')
  }

  return (
    <DrillShell title="Link and stop" subtitle={count ? `${count} sentences this round` : 'C-9 to C-12 + Speech Plan'}>
      <div className="flex items-center gap-2">
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
      </div>
      <p className="mt-2 text-center text-lg font-semibold tracking-wide text-teal-700 dark:text-teal-300">
        {planOf(settings, plan === 'general' ? 'generalPlan' : 'pressurePlan')}
      </p>

      <div
        role="button"
        tabIndex={-1}
        onClick={phase === 'speak' ? said : undefined}
        className="my-3 flex flex-1 cursor-pointer flex-col items-center justify-center rounded-3xl bg-white p-6 text-center shadow-sm select-none dark:bg-slate-900"
      >
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
                {p.words.join('‿')}
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
        <p className="mt-8 text-sm text-slate-400">
          {phase === 'stop'
            ? `Full stop… one thousand ${['one', 'two', 'three'][Math.min(tick, 2)]}`
            : phase === 'done'
              ? 'Lovely. Smile.'
              : 'Say the highlighted words as one long word, then tap.'}
        </p>
      </div>

      <div className="flex justify-center gap-3">
        {phase === 'done' ? (
          <button type="button" onClick={nextSentence} className={primaryBtn}>
            Next sentence
          </button>
        ) : (
          <>
            <button type="button" onClick={nextSentence} className={secondaryBtn}>
              Skip
            </button>
            <button type="button" onClick={said} disabled={phase !== 'speak'} className={primaryBtn}>
              Said it
            </button>
          </>
        )}
      </div>
      <p className="mt-4 text-center text-xs text-slate-500">‿ link the words · each dot is a one-second full stop</p>
    </DrillShell>
  )
}
