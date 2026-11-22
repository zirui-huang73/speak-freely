import { useEffect, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { ChevronIcon, ChevronLeftIcon, HeartIcon, SpeakerIcon, XIcon } from '../../app/icons'
import { CATEGORIES } from '../../content/affirmations'
import { fillName, filterCards, shuffle, type CardFilter } from '../../lib/library'
import { speak, stopSpeaking } from '../../lib/speech'
import { useLibrary } from '../library/libraryContext'
import { useSettings } from '../settings/settingsContext'

const vibrate = (ms: number) => 'vibrate' in navigator && navigator.vibrate(ms)

const roundBtn =
  'grid size-12 place-items-center rounded-full bg-white text-slate-600 shadow-sm hover:text-slate-900 disabled:opacity-30 dark:bg-slate-800 dark:text-slate-300'

export function DeckPage() {
  const [params] = useSearchParams()
  const filter = (params.get('f') ?? 'all') as CardFilter
  const { cards, data, addReps, toggleFavorite } = useLibrary()
  const { settings, update } = useSettings()

  const build = () => shuffle(filterCards(cards, filter, data.favorites))
  const [deck, setDeck] = useState(build)
  const [index, setIndex] = useState(0)
  const [reps, setReps] = useState(0)
  const [total, setTotal] = useState(0)
  const [finished, setFinished] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined)
  const pointer = useRef<{ x: number; y: number } | null>(null)

  const target = settings.deckReps
  const card = deck[index]
  const text = card ? fillName(card.text, settings.name) : ''
  const title =
    filter === 'all'
      ? 'All cards'
      : filter === 'favorites'
        ? 'Favorites'
        : filter === 'mine'
          ? 'My Cards'
          : CATEGORIES.find((c) => c.id === filter)?.title

  const go = (delta: number) => {
    clearTimeout(timer.current)
    stopSpeaking()
    const next = index + delta
    if (next < 0) return
    if (next >= deck.length) setFinished(true)
    else {
      setIndex(next)
      setReps(0)
    }
  }

  const count = () => {
    if (!card || reps >= target) return
    const r = reps + 1
    setReps(r)
    setTotal((t) => t + 1)
    addReps(card.id)
    vibrate(r >= target ? 40 : 10)
    if (r >= target) timer.current = setTimeout(() => go(1), 450)
  }

  const restart = () => {
    setDeck(build())
    setIndex(0)
    setReps(0)
    setTotal(0)
    setFinished(false)
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (finished) return
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault()
        count()
      } else if (e.key === 'ArrowRight') go(1)
      else if (e.key === 'ArrowLeft') go(-1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  useEffect(() => () => clearTimeout(timer.current), [])

  if (!deck.length) {
    return (
      <div className="grid min-h-dvh place-items-center p-6 text-center">
        <div>
          <p className="mb-4 text-slate-500">This deck has no cards yet.</p>
          <Link to="/cards" className="font-medium text-teal-700 dark:text-teal-300">
            ‹ Back to Cards
          </Link>
        </div>
      </div>
    )
  }

  if (finished) {
    return (
      <div className="grid min-h-dvh place-items-center p-6 text-center">
        <div>
          <p className="text-5xl">🎉</p>
          <h1 className="mt-4 text-3xl font-bold">Deck complete</h1>
          <p className="mt-2 text-slate-500">
            {deck.length} cards · {total} repetitions out loud
          </p>
          <p className="mx-auto mt-6 max-w-sm text-lg text-teal-700 italic dark:text-teal-300">
            “Every day, in every way, my speech grows better and better.”
          </p>
          <div className="mt-8 flex justify-center gap-3">
            <button type="button" onClick={restart} className="rounded-xl bg-teal-700 px-5 py-3 font-medium text-white">
              Shuffle again
            </button>
            <Link to={`/cards${filter === 'all' ? '' : `?f=${filter}`}`} className="rounded-xl border border-slate-300 px-5 py-3 font-medium dark:border-slate-700">
              Back to Cards
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const fav = data.favorites.includes(card.id)

  return (
    <div className="flex min-h-dvh flex-col bg-slate-100 pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)] dark:bg-slate-950">
      <header className="flex items-center gap-3 px-4 py-3">
        <Link to={`/cards${filter === 'all' ? '' : `?f=${filter}`}`} aria-label="Close" className="text-slate-500">
          <XIcon />
        </Link>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">{title}</p>
          <p className="text-xs text-slate-500">
            {index + 1} / {deck.length}
          </p>
        </div>
        <div className="flex items-center gap-1 rounded-full bg-white px-1 py-0.5 text-sm dark:bg-slate-800">
          <button type="button" className="size-7 rounded-full" onClick={() => update({ deckReps: target - 1 })}>
            −
          </button>
          <span className="w-8 text-center font-medium">×{target}</span>
          <button type="button" className="size-7 rounded-full" onClick={() => update({ deckReps: target + 1 })}>
            +
          </button>
        </div>
      </header>
      <div className="mx-4 h-1 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
        <div className="h-full bg-teal-600 transition-all" style={{ width: `${((index + 1) / deck.length) * 100}%` }} />
      </div>

      <div
        role="button"
        tabIndex={-1}
        className="mx-4 my-5 flex flex-1 cursor-pointer touch-none flex-col items-center justify-center rounded-3xl bg-white p-8 text-center shadow-sm select-none dark:bg-slate-900"
        onPointerDown={(e) => (pointer.current = { x: e.clientX, y: e.clientY })}
        onPointerUp={(e) => {
          const s = pointer.current
          pointer.current = null
          if (!s) return
          const dx = e.clientX - s.x
          const dy = e.clientY - s.y
          if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy)) go(dx < 0 ? 1 : -1)
          else if (Math.abs(dx) < 12 && Math.abs(dy) < 12) count()
        }}
      >
        <p className="text-2xl leading-snug font-medium text-balance md:text-4xl">{text}</p>
        <div className="mt-10 flex flex-wrap justify-center gap-2">
          {Array.from({ length: target }, (_, i) => (
            <span
              key={i}
              className={`size-3 rounded-full transition ${i < reps ? 'scale-110 bg-teal-600' : 'bg-slate-200 dark:bg-slate-700'}`}
            />
          ))}
        </div>
        <p className="mt-4 text-sm text-slate-400">
          {reps >= target ? 'Well done!' : 'Say it out loud, then tap'}
        </p>
      </div>

      <footer className="flex items-center justify-center gap-5 px-4 pb-5">
        <button type="button" className={roundBtn} aria-label="Previous" disabled={index === 0} onClick={() => go(-1)}>
          <ChevronLeftIcon />
        </button>
        <button type="button" className={roundBtn} aria-label="Listen" onClick={() => speak(text, settings)}>
          <SpeakerIcon />
        </button>
        <button
          type="button"
          className={`${roundBtn} ${fav ? 'text-rose-500' : ''}`}
          aria-label="Favorite"
          onClick={() => toggleFavorite(card.id)}
        >
          <HeartIcon filled={fav} />
        </button>
        <button type="button" className={roundBtn} aria-label="Next" onClick={() => go(1)}>
          <ChevronIcon />
        </button>
      </footer>
    </div>
  )
}
