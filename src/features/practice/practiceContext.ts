import { createContext, useContext } from 'react'
import type { PracticeLog, SessionSlot } from '../../lib/practice'

export interface PracticeContextValue {
  log: PracticeLog
  markSession: (slot: SessionSlot) => void
  markReviewed: () => void
}

export const PracticeContext = createContext<PracticeContextValue | null>(null)

export function usePractice(): PracticeContextValue {
  const ctx = useContext(PracticeContext)
  if (!ctx) throw new Error('usePractice must be used inside PracticeProvider')
  return ctx
}

export const SLOT_INFO: Record<SessionSlot, { title: string; hint: string }> = {
  morning: { title: 'Morning', hint: 'Right after waking up' },
  midday: { title: 'Midday', hint: 'Optional extra session' },
  bedtime: { title: 'Bedtime', hint: 'Just before sleep, when the mind is most receptive' },
}
