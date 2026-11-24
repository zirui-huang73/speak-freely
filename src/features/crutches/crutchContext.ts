import { createContext, useContext } from 'react'
import type { CrutchData } from '../../lib/crutches'

export interface CrutchContextValue {
  data: CrutchData
  setWeek: (n: number) => void
  addCount: (n: number) => void
  addWord: (word: string) => void
  removeWord: (word: string) => void
  addSentence: (text: string) => void
  updateSentence: (old: string, text: string) => void
  removeSentence: (text: string) => void
}

export const CrutchContext = createContext<CrutchContextValue | null>(null)

export function useCrutches(): CrutchContextValue {
  const ctx = useContext(CrutchContext)
  if (!ctx) throw new Error('useCrutches must be used inside CrutchProvider')
  return ctx
}
