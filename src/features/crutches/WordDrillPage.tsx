import { useState, type ReactNode } from 'react'
import { useSearchParams } from 'react-router-dom'
import { XIcon } from '../../app/icons'
import { CRUTCHES, EXAMPLE_WORDS } from '../../content/crutches'
import { pickOther, spellInto, splitFirstSound, splitSyllable } from '../../lib/crutches'
import { useSettings } from '../settings/settingsContext'
import { useCrutches } from './crutchContext'
import { DrillShell, primaryBtn, secondaryBtn } from './DrillShell'

const STARTERS = ['Well', 'So', 'And', 'Ahh', 'Mmm']
const LEADS = ['Glad you asked', 'Let me see, it is', 'You know, it is', 'Oh, that is']

interface Round {
  word: string
  crutch: number
  variant: number
}

function Hint({ round }: { round: Round }) {
  const { word, crutch, variant } = round
  const big = (node: ReactNode) => <p className="text-4xl font-semibold text-balance md:text-5xl">{node}</p>
  switch (crutch) {
    case 1: {
      const [first, rest] = splitFirstSound(word)
      return big(
        <>
          <span className="text-slate-300 line-through dark:text-slate-600">{first}</span>
          {rest}
        </>,
      )
    }
    case 3:
      return big(spellInto(word))
    case 4:
      return big(`${STARTERS[variant % STARTERS.length]}‿${word}`)
    case 5:
      return big(`${LEADS[variant % LEADS.length]}‿${word}`)
    case 6:
      return big(<span className="text-slate-400 line-through decoration-2">{word}</span>)
    case 7:
      return big(<span className="font-light text-slate-400 italic">{word}</span>)
    case 8: {
      const parts = splitSyllable(word)
      if (!parts) return big(<>↗ {word.toUpperCase()}</>)
      const [a, b] = parts
      return big(variant % 2 ? `${a.toUpperCase()}-${b.toLowerCase()}` : `${a.toLowerCase()}-${b.toUpperCase()}`)
    }
    default:
      return big(word)
  }
}

const INSTRUCTION: Record<number, string> = {
  1: 'Drop the first sound and say the rest.',
  2: 'Say a synonym or short phrase instead.',
  3: 'Spell it, then glide straight into the word.',
  4: 'Run the starter straight into the word, with no gap.',
  5: 'Say the lead-in and link it into the word.',
  6: 'Say the idea another way, without this word.',
  7: 'Whisper it at medium volume.',
  8: 'Capitals high or loud, lower case low or soft. Go all the way.',
}

export function WordDrillPage() {
  const [params, setParams] = useSearchParams()
  const { data, addCount, addWord, removeWord } = useCrutches()
  const { settings } = useSettings()
  const param = params.get('c')
  const fixed = param && Number(param) >= 1 && Number(param) <= 8 ? Number(param) : null
  const [onlyMine, setOnlyMine] = useState(data.myWords.length > 0)
  const [newWord, setNewWord] = useState('')
  const [done, setDone] = useState(0)

  const pool = onlyMine && data.myWords.length ? data.myWords : [...new Set([...data.myWords, ...EXAMPLE_WORDS])]
  const named = settings.name.trim()
  const words = named && !pool.includes(named) && !onlyMine ? [named, ...pool] : pool

  const makeRound = (prev?: Round): Round => ({
    word: pickOther(words, prev?.word),
    crutch: fixed ?? Math.ceil(Math.random() * 8),
    variant: Math.floor(Math.random() * 100),
  })
  const [round, setRound] = useState<Round>(() => makeRound())
  const current = fixed && round.crutch !== fixed ? { ...round, crutch: fixed } : round
  const crutch = CRUTCHES.find((c) => c.n === current.crutch)!

  const next = (counted: boolean) => {
    if (counted) {
      addCount(current.crutch)
      setDone((d) => d + 1)
    }
    setRound(makeRound(current))
  }

  return (
    <DrillShell title="Feared words" subtitle={done ? `${done} done this round` : 'C-1 to C-8'}>
      <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-2 [scrollbar-width:none]">
        {[null, 1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
          <button
            key={n ?? 'mix'}
            type="button"
            onClick={() => setParams(n ? { c: String(n) } : {}, { replace: true })}
            className={`shrink-0 rounded-full border px-3 py-1 text-sm font-medium ${
              fixed === n
                ? 'border-teal-700 bg-teal-700 text-white'
                : 'border-slate-300 bg-white text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300'
            }`}
          >
            {n ? `C-${n}` : 'Mix'}
          </button>
        ))}
      </div>

      <div className="my-3 flex flex-1 flex-col items-center justify-center rounded-3xl bg-white p-8 text-center shadow-sm dark:bg-slate-900">
        <p className="mb-6 text-xs font-semibold tracking-wider text-teal-700 uppercase dark:text-teal-300">
          C-{crutch.n} · {crutch.name}
        </p>
        <Hint round={current} />
        <p className="mt-6 max-w-sm text-slate-500">{INSTRUCTION[crutch.n]}</p>
      </div>

      <div className="flex justify-center gap-3">
        <button type="button" onClick={() => next(false)} className={secondaryBtn}>
          Skip
        </button>
        <button type="button" onClick={() => next(true)} className={primaryBtn}>
          Done, next
        </button>
      </div>

      <details className="mt-5 rounded-2xl bg-white p-4 dark:bg-slate-900">
        <summary className="cursor-pointer font-medium">My words ({data.myWords.length})</summary>
        <p className="mt-2 text-sm text-slate-500">
          Add the words you find hardest: names, places, foods, numbers, phrases you use at work.
        </p>
        <form
          className="mt-3 flex gap-2"
          onSubmit={(e) => {
            e.preventDefault()
            if (!newWord.trim()) return
            addWord(newWord)
            setNewWord('')
          }}
        >
          <input
            value={newWord}
            onChange={(e) => setNewWord(e.target.value)}
            placeholder="Add a word or phrase"
            className="min-w-0 flex-1 rounded-xl border border-slate-300 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-800"
          />
          <button type="submit" className="rounded-xl bg-teal-700 px-4 py-2 font-medium text-white">
            Add
          </button>
        </form>
        {data.myWords.length > 0 && (
          <>
            <div className="mt-3 flex flex-wrap gap-2">
              {data.myWords.map((w) => (
                <span key={w} className="flex items-center gap-1 rounded-full bg-slate-100 py-1 pr-1 pl-3 text-sm dark:bg-slate-800">
                  {w}
                  <button type="button" aria-label={`Remove ${w}`} onClick={() => removeWord(w)} className="text-slate-400">
                    <XIcon className="size-4" />
                  </button>
                </span>
              ))}
            </div>
            <label className="mt-3 flex items-center gap-2 text-sm">
              <input type="checkbox" checked={onlyMine} onChange={(e) => setOnlyMine(e.target.checked)} className="accent-teal-700" />
              Only practice my words
            </label>
          </>
        )}
      </details>
    </DrillShell>
  )
}
