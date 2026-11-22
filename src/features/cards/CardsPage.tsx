import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { PlayIcon } from '../../app/icons'
import { PageHeader } from '../../app/ui'
import { CATEGORIES } from '../../content/affirmations'
import { filterCards, type CardFilter } from '../../lib/library'
import { useLibrary } from '../library/libraryContext'
import { CardRow } from './CardRow'
import { TodayPicker } from './TodayPicker'

type Sort = 'default' | 'most' | 'least'

function AddCardForm() {
  const { addCustom } = useLibrary()
  const [text, setText] = useState('')
  return (
    <form
      className="mb-4 rounded-2xl border border-dashed border-teal-600/60 bg-white p-4 dark:bg-slate-900"
      onSubmit={(e) => {
        e.preventDefault()
        if (!text.trim()) return
        addCustom(text)
        setText('')
      }}
    >
      <textarea
        rows={2}
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Write your own affirmation…"
        className="w-full resize-none bg-transparent text-lg outline-none placeholder:text-slate-400"
      />
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs text-slate-500">Present tense · positive · short</p>
        <button
          type="submit"
          disabled={!text.trim()}
          className="rounded-xl bg-teal-700 px-4 py-2 text-sm font-medium text-white disabled:opacity-40"
        >
          Add card
        </button>
      </div>
    </form>
  )
}

export function CardsPage() {
  const { cards, data } = useLibrary()
  const [params, setParams] = useSearchParams()
  const filter = (params.get('f') ?? 'all') as CardFilter
  const [sort, setSort] = useState<Sort>('default')
  const [picking, setPicking] = useState<string | null>(null)

  const chips: { id: CardFilter; label: string }[] = [
    { id: 'all', label: 'All' },
    { id: 'favorites', label: '♥ Favorites' },
    ...CATEGORIES.map((c) => ({ id: c.id, label: c.title })),
    { id: 'mine', label: 'My Cards' },
  ]
  const count = (f: CardFilter) => filterCards(cards, f, data.favorites).length
  const list = filterCards(cards, filter, data.favorites)
  const sorted =
    sort === 'default'
      ? list
      : [...list].sort((a, b) => ((data.counts[b.id] ?? 0) - (data.counts[a.id] ?? 0)) * (sort === 'most' ? 1 : -1))
  const blurb = CATEGORIES.find((c) => c.id === filter)?.blurb

  return (
    <>
      <div className="flex items-start justify-between gap-4">
        <PageHeader title="Cards" subtitle="Positive affirmations. Say them out loud." />
        <Link
          to={`/deck?f=${filter}`}
          aria-disabled={!list.length}
          className={`mt-1 flex shrink-0 items-center gap-1.5 rounded-xl bg-teal-700 px-4 py-2.5 font-medium text-white hover:bg-teal-800 ${
            list.length ? '' : 'pointer-events-none opacity-40'
          }`}
        >
          <PlayIcon className="size-4" /> Deck
        </Link>
      </div>

      <div className="-mx-5 mb-3 flex gap-2 overflow-x-auto px-5 pb-1 [scrollbar-width:none]">
        {chips.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => setParams(c.id === 'all' ? {} : { f: c.id }, { replace: true })}
            className={`shrink-0 rounded-full border px-3.5 py-1.5 text-sm font-medium whitespace-nowrap ${
              filter === c.id
                ? 'border-teal-700 bg-teal-700 text-white'
                : 'border-slate-300 bg-white text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300'
            }`}
          >
            {c.label} <span className="opacity-60">{count(c.id)}</span>
          </button>
        ))}
      </div>

      <div className="mb-4 flex items-center justify-between gap-4">
        <p className="text-sm text-slate-500">{blurb}</p>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as Sort)}
          className="shrink-0 rounded-lg border border-slate-300 bg-white px-2 py-1 text-sm dark:border-slate-700 dark:bg-slate-900"
        >
          <option value="default">Default order</option>
          <option value="most">Most said</option>
          <option value="least">Least said</option>
        </select>
      </div>

      {filter === 'mine' && <AddCardForm />}

      {sorted.length ? (
        <ul className="space-y-3">
          {sorted.map((card) => (
            <CardRow key={card.id} card={card} onAddToday={setPicking} />
          ))}
        </ul>
      ) : (
        <p className="py-10 text-center text-slate-500">
          {filter === 'favorites' ? 'Tap ♡ on any card to collect your favorites here.' : 'No cards yet.'}
        </p>
      )}

      {picking && <TodayPicker cardId={picking} onClose={() => setPicking(null)} />}
    </>
  )
}
