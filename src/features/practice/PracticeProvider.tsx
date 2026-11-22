import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { loadPractice, markSession, savePractice, type PracticeLog, type SessionSlot } from '../../lib/practice'
import { PracticeContext } from './practiceContext'

export function PracticeProvider({ children }: { children: ReactNode }) {
  const [log, setLog] = useState<PracticeLog | null>(null)

  useEffect(() => {
    loadPractice().then(setLog)
  }, [])

  const mutate = useCallback((fn: (l: PracticeLog) => PracticeLog) => {
    setLog((prev) => {
      if (!prev) return prev
      const next = fn(prev)
      void savePractice(next)
      return next
    })
  }, [])

  const value = useMemo(
    () =>
      log && {
        log,
        markSession: (slot: SessionSlot) => mutate((l) => markSession(l, slot, Date.now())),
        markReviewed: () => mutate((l) => ({ ...l, lastReviewed: Date.now() })),
      },
    [log, mutate],
  )

  if (!value) return null
  return <PracticeContext.Provider value={value}>{children}</PracticeContext.Provider>
}
