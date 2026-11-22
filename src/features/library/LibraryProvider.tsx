import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import {
  allCards,
  loadLibrary,
  normalizeLibrary,
  saveLibrary,
  setTodaySlot,
  toggleInList,
  type LibraryData,
} from '../../lib/library'
import { LibraryContext, type LibraryContextValue } from './libraryContext'

export function LibraryProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<LibraryData | null>(null)

  useEffect(() => {
    loadLibrary().then(setData)
  }, [])

  const mutate = useCallback((fn: (d: LibraryData) => LibraryData) => {
    setData((prev) => {
      if (!prev) return prev
      const next = normalizeLibrary(fn(prev))
      void saveLibrary(next)
      return next
    })
  }, [])

  const value = useMemo<LibraryContextValue | null>(() => {
    if (!data) return null
    const cards = allCards(data.custom)
    return {
      data,
      cards,
      cardById: new Map(cards.map((c) => [c.id, c])),
      toggleFavorite: (id) => mutate((d) => ({ ...d, favorites: toggleInList(d.favorites, id) })),
      addReps: (id, n = 1) => mutate((d) => ({ ...d, counts: { ...d.counts, [id]: (d.counts[id] ?? 0) + n } })),
      addCustom: (text) =>
        mutate((d) => ({ ...d, custom: [...d.custom, { id: `mine-${Date.now().toString(36)}`, text: text.trim() }] })),
      editCustom: (id, text) =>
        mutate((d) => ({ ...d, custom: d.custom.map((c) => (c.id === id ? { ...c, text: text.trim() } : c)) })),
      deleteCustom: (id) => mutate((d) => ({ ...d, custom: d.custom.filter((c) => c.id !== id) })),
      setTodaySlot: (slot, id) => mutate((d) => ({ ...d, todayTen: setTodaySlot(d.todayTen, slot, id) })),
    }
  }, [data, mutate])

  if (!value) return null
  return <LibraryContext.Provider value={value}>{children}</LibraryContext.Provider>
}
