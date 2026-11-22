import { LOCKED_SLOTS } from '../../content/affirmations'
import { LockIcon, XIcon } from '../../app/icons'
import { fillName } from '../../lib/library'
import { useLibrary } from '../library/libraryContext'
import { useSettings } from '../settings/settingsContext'

export function TodayPicker({ cardId, onClose }: { cardId: string; onClose: () => void }) {
  const { data, cardById, setTodaySlot } = useLibrary()
  const { settings } = useSettings()
  const card = cardById.get(cardId)
  if (!card) return null

  return (
    <div className="fixed inset-0 z-30 flex items-end justify-center bg-black/40 md:items-center" onClick={onClose}>
      <div
        className="max-h-[85dvh] w-full overflow-y-auto rounded-t-3xl bg-white p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] md:max-w-lg md:rounded-3xl dark:bg-slate-900"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-1 flex items-start justify-between gap-4">
          <h2 className="text-lg font-semibold">Add to Today's 10</h2>
          <button type="button" onClick={onClose} aria-label="Close" className="text-slate-400">
            <XIcon />
          </button>
        </div>
        <p className="mb-4 rounded-xl bg-teal-50 p-3 text-teal-900 dark:bg-teal-950 dark:text-teal-100">
          “{fillName(card.text, settings.name)}”
        </p>
        <p className="mb-2 text-sm text-slate-500">Choose the card it replaces:</p>
        <ol className="space-y-1.5">
          {data.todayTen.map((id, slot) => {
            const locked = LOCKED_SLOTS.includes(slot)
            return (
              <li key={id}>
                <button
                  type="button"
                  disabled={locked}
                  onClick={() => {
                    setTodaySlot(slot, cardId)
                    onClose()
                  }}
                  className="flex w-full items-start gap-3 rounded-xl border border-slate-200 p-3 text-left hover:border-teal-600 hover:bg-teal-50 disabled:opacity-60 disabled:hover:border-slate-200 disabled:hover:bg-transparent dark:border-slate-700 dark:hover:bg-teal-950"
                >
                  <span className="w-5 shrink-0 text-right font-semibold text-slate-400">{slot + 1}</span>
                  <span className="flex-1">{fillName(cardById.get(id)?.text ?? id, settings.name)}</span>
                  {locked && <LockIcon className="size-4 shrink-0 text-slate-400" />}
                </button>
              </li>
            )
          })}
        </ol>
        <p className="mt-3 text-xs text-slate-500">Cards 1 and 10 always stay, as the book recommends.</p>
      </div>
    </div>
  )
}
