import { createContext, useContext } from 'react'
import type { Affirmation } from '../../content/affirmations'
import type { LibraryData } from '../../lib/library'

export interface LibraryContextValue {
  data: LibraryData
  cards: Affirmation[]
  cardById: Map<string, Affirmation>
  toggleFavorite: (id: string) => void
  addReps: (id: string, n?: number) => void
  addCustom: (text: string) => void
  editCustom: (id: string, text: string) => void
  deleteCustom: (id: string) => void
  setTodaySlot: (slot: number, id: string) => void
}

export const LibraryContext = createContext<LibraryContextValue | null>(null)

export function useLibrary(): LibraryContextValue {
  const ctx = useContext(LibraryContext)
  if (!ctx) throw new Error('useLibrary must be used inside LibraryProvider')
  return ctx
}
