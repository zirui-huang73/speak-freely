import { AFFIRMATIONS, BOOK_TEN, LOCKED_SLOTS, type Affirmation, type CategoryId } from '../content/affirmations'
import { getValue, setValue } from './storage'

export interface CustomCard {
  id: string
  text: string
}

export interface LibraryData {
  favorites: string[]
  counts: Record<string, number>
  custom: CustomCard[]
  todayTen: string[]
}

export const defaultLibrary = (): LibraryData => ({ favorites: [], counts: {}, custom: [], todayTen: [...BOOK_TEN] })

export function fillName(text: string, name: string): string {
  const n = name.trim()
  return n ? text.replaceAll('{name}', n) : text.replace(/,?\s*\{name\}/g, '')
}

export function allCards(custom: CustomCard[]): Affirmation[] {
  return [...AFFIRMATIONS, ...custom.map((c) => ({ ...c, category: 'mine' as const }))]
}

export type CardFilter = 'all' | 'favorites' | 'mine' | CategoryId

export function filterCards(cards: Affirmation[], filter: CardFilter, favorites: string[]): Affirmation[] {
  if (filter === 'all') return cards
  if (filter === 'favorites') return cards.filter((c) => favorites.includes(c.id))
  return cards.filter((c) => c.category === filter)
}

/** Ensures exactly 10 unique, existing ids with the locked book slots in place. */
export function sanitizeTodayTen(ten: unknown, validIds: Set<string>): string[] {
  const input = Array.isArray(ten) ? ten : []
  const used = new Set(LOCKED_SLOTS.map((s) => BOOK_TEN[s]))
  const result = BOOK_TEN.map((fallback, slot) => {
    if (LOCKED_SLOTS.includes(slot)) return fallback
    const id = input[slot]
    if (typeof id === 'string' && validIds.has(id) && !used.has(id)) {
      used.add(id)
      return id
    }
    return ''
  })
  const spares = [...BOOK_TEN, ...AFFIRMATIONS.map((a) => a.id)].filter((id) => !used.has(id))
  return result.map((id) => {
    if (id) return id
    const next = spares.find((s) => !used.has(s))!
    used.add(next)
    return next
  })
}

export function setTodaySlot(ten: string[], slot: number, id: string): string[] {
  if (LOCKED_SLOTS.includes(slot) || slot < 0 || slot >= ten.length || ten.includes(id)) return ten
  return ten.map((x, i) => (i === slot ? id : x))
}

export function toggleInList(list: string[], id: string): string[] {
  return list.includes(id) ? list.filter((x) => x !== id) : [...list, id]
}

export function shuffle<T>(items: T[], random: () => number = Math.random): T[] {
  const a = [...items]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export function normalizeLibrary(raw: unknown): LibraryData {
  const r = (raw && typeof raw === 'object' ? raw : {}) as Partial<Record<keyof LibraryData, unknown>>
  const custom = Array.isArray(r.custom)
    ? r.custom.filter(
        (c): c is CustomCard => !!c && typeof c.id === 'string' && typeof c.text === 'string' && !!c.text.trim(),
      )
    : []
  const validIds = new Set(allCards(custom).map((c) => c.id))
  const counts: Record<string, number> = {}
  if (r.counts && typeof r.counts === 'object') {
    for (const [k, v] of Object.entries(r.counts)) if (typeof v === 'number' && v > 0) counts[k] = Math.floor(v)
  }
  return {
    favorites: Array.isArray(r.favorites) ? r.favorites.filter((id) => validIds.has(id)) : [],
    counts,
    custom,
    todayTen: sanitizeTodayTen(r.todayTen, validIds),
  }
}

const KEY = 'library'

export async function loadLibrary(): Promise<LibraryData> {
  return normalizeLibrary(await getValue(KEY))
}

export async function saveLibrary(data: LibraryData): Promise<void> {
  await setValue(KEY, data)
}
