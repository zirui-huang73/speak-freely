import { useState } from 'react'
import { CheckIcon, HeartIcon, PencilIcon, PlusIcon, SpeakerIcon, TrashIcon } from '../../app/icons'
import type { Affirmation } from '../../content/affirmations'
import { fillName } from '../../lib/library'
import { speak } from '../../lib/speech'
import { useLibrary } from '../library/libraryContext'
import { useSettings } from '../settings/settingsContext'

const iconBtn =
  'grid size-9 place-items-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200'

export function CardRow({ card, onAddToday }: { card: Affirmation; onAddToday: (id: string) => void }) {
  const { data, toggleFavorite, editCustom, deleteCustom } = useLibrary()
  const { settings } = useSettings()
  const [editing, setEditing] = useState<string | null>(null)
  const text = fillName(card.text, settings.name)
  const fav = data.favorites.includes(card.id)
  const inToday = data.todayTen.includes(card.id)
  const count = data.counts[card.id] ?? 0
  const mine = card.category === 'mine'

  if (editing !== null) {
    return (
      <li className="rounded-2xl border border-teal-600 bg-white p-3 dark:bg-slate-900">
        <textarea
          autoFocus
          rows={2}
          value={editing}
          onChange={(e) => setEditing(e.target.value)}
          className="w-full resize-none bg-transparent text-lg outline-none"
        />
        <div className="flex justify-end gap-2">
          <button type="button" onClick={() => setEditing(null)} className="rounded-lg px-3 py-1.5 text-sm text-slate-500">
            Cancel
          </button>
          <button
            type="button"
            disabled={!editing.trim()}
            onClick={() => {
              editCustom(card.id, editing)
              setEditing(null)
            }}
            className="rounded-lg bg-teal-700 px-3 py-1.5 text-sm font-medium text-white disabled:opacity-40"
          >
            Save
          </button>
        </div>
      </li>
    )
  }

  return (
    <li className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
      <p className="text-lg leading-snug">{text}</p>
      <div className="mt-2 flex items-center gap-1">
        <span className="mr-auto text-xs text-slate-400">{count ? `Said ${count}×` : 'New'}</span>
        <button type="button" className={iconBtn} aria-label="Listen" onClick={() => speak(text, settings)}>
          <SpeakerIcon className="size-5" />
        </button>
        {mine && (
          <>
            <button type="button" className={iconBtn} aria-label="Edit" onClick={() => setEditing(card.text)}>
              <PencilIcon className="size-5" />
            </button>
            <button
              type="button"
              className={iconBtn}
              aria-label="Delete"
              onClick={() => confirm('Delete this card?') && deleteCustom(card.id)}
            >
              <TrashIcon className="size-5" />
            </button>
          </>
        )}
        <button
          type="button"
          className={`${iconBtn} ${fav ? 'text-rose-500 hover:text-rose-600' : ''}`}
          aria-label={fav ? 'Remove from favorites' : 'Add to favorites'}
          onClick={() => toggleFavorite(card.id)}
        >
          <HeartIcon filled={fav} className="size-5" />
        </button>
        {inToday ? (
          <span className="ml-1 flex items-center gap-1 rounded-full bg-teal-50 px-3 py-1.5 text-xs font-medium text-teal-700 dark:bg-teal-950 dark:text-teal-300">
            <CheckIcon className="size-4" /> Today
          </span>
        ) : (
          <button
            type="button"
            onClick={() => onAddToday(card.id)}
            className="ml-1 flex items-center gap-1 rounded-full border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-600 hover:border-teal-600 hover:text-teal-700 dark:border-slate-700 dark:text-slate-300"
          >
            <PlusIcon className="size-4" /> Today
          </button>
        )}
      </div>
    </li>
  )
}
