import { getValue, setValue } from './storage'

export const SLOTS = ['morning', 'midday', 'bedtime'] as const
export type SessionSlot = (typeof SLOTS)[number]

export interface PracticeLog {
  /** Practice day (YYYY-MM-DD) → completion timestamp per session. */
  days: Record<string, Partial<Record<SessionSlot, number>>>
  lastReviewed: number | null
}

const DAY_MS = 24 * 60 * 60 * 1000
const ROLLOVER_HOUR = 4
export const REVIEW_INTERVAL_DAYS = 30

/** Local calendar day, where the day starts at 04:00 so late bedtime sessions count for the previous day. */
export function dayKey(at: Date | number): string {
  const d = new Date(at)
  d.setHours(d.getHours() - ROLLOVER_HOUR)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function shiftDay(key: string, delta: number): string {
  const [y, m, d] = key.split('-').map(Number)
  const date = new Date(y, m - 1, d + delta, 12)
  return dayKey(date.getTime() + ROLLOVER_HOUR * 60 * 60 * 1000)
}

export function suggestedSlot(now: Date | number): SessionSlot {
  const h = new Date(now).getHours()
  if (h >= ROLLOVER_HOUR && h < 11) return 'morning'
  if (h >= 11 && h < 17) return 'midday'
  return 'bedtime'
}

export const sessionsOn = (log: PracticeLog, key: string) => Object.keys(log.days[key] ?? {}).length

export function markSession(log: PracticeLog, slot: SessionSlot, now: number): PracticeLog {
  const key = dayKey(now)
  return {
    days: { ...log.days, [key]: { ...log.days[key], [slot]: now } },
    lastReviewed: log.lastReviewed ?? now,
  }
}

/** Consecutive days with at least 2 sessions (the book's minimum). Today counts once it reaches 2. */
export function streak(log: PracticeLog, now: number): number {
  let key = dayKey(now)
  if (sessionsOn(log, key) < 2) key = shiftDay(key, -1)
  let n = 0
  while (sessionsOn(log, key) >= 2) {
    n++
    key = shiftDay(key, -1)
  }
  return n
}

export function lastDays(log: PracticeLog, now: number, count = 7): { key: string; sessions: number; weekday: string }[] {
  const today = dayKey(now)
  return Array.from({ length: count }, (_, i) => {
    const key = shiftDay(today, i - count + 1)
    const [y, m, d] = key.split('-').map(Number)
    return {
      key,
      sessions: sessionsOn(log, key),
      weekday: new Date(y, m - 1, d).toLocaleDateString('en-US', { weekday: 'narrow' }),
    }
  })
}

export const reviewDue = (log: PracticeLog, now: number) =>
  log.lastReviewed !== null && now - log.lastReviewed > REVIEW_INTERVAL_DAYS * DAY_MS

export function normalizePractice(raw: unknown): PracticeLog {
  const r = (raw && typeof raw === 'object' ? raw : {}) as Partial<Record<keyof PracticeLog, unknown>>
  const days: PracticeLog['days'] = {}
  if (r.days && typeof r.days === 'object') {
    for (const [key, value] of Object.entries(r.days)) {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(key) || !value || typeof value !== 'object') continue
      const entry: Partial<Record<SessionSlot, number>> = {}
      for (const slot of SLOTS) {
        const t = (value as Record<string, unknown>)[slot]
        if (typeof t === 'number') entry[slot] = t
      }
      if (Object.keys(entry).length) days[key] = entry
    }
  }
  return { days, lastReviewed: typeof r.lastReviewed === 'number' ? r.lastReviewed : null }
}

const KEY = 'practice'

export async function loadPractice(): Promise<PracticeLog> {
  return normalizePractice(await getValue(KEY))
}

export async function savePractice(log: PracticeLog): Promise<void> {
  await setValue(KEY, log)
}
