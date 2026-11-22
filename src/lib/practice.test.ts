import { describe, expect, it } from 'vitest'
import {
  dayKey,
  lastDays,
  loadPractice,
  markSession,
  normalizePractice,
  reviewDue,
  savePractice,
  streak,
  suggestedSlot,
  type PracticeLog,
} from './practice'

const at = (s: string) => new Date(s).getTime()
const empty: PracticeLog = { days: {}, lastReviewed: null }

describe('dayKey', () => {
  it('uses the local date, rolling over at 04:00', () => {
    expect(dayKey(at('2026-11-22T10:00:00'))).toBe('2026-11-22')
    expect(dayKey(at('2026-11-23T01:30:00'))).toBe('2026-11-22')
    expect(dayKey(at('2026-11-23T04:00:00'))).toBe('2026-11-23')
    expect(dayKey(at('2026-03-01T02:00:00'))).toBe('2026-02-28')
  })
})

describe('suggestedSlot', () => {
  it('suggests by time of day', () => {
    expect(suggestedSlot(at('2026-11-22T07:00:00'))).toBe('morning')
    expect(suggestedSlot(at('2026-11-22T13:00:00'))).toBe('midday')
    expect(suggestedSlot(at('2026-11-22T22:00:00'))).toBe('bedtime')
    expect(suggestedSlot(at('2026-11-23T01:00:00'))).toBe('bedtime')
  })
})

describe('markSession', () => {
  it('records the session on its practice day and starts the review clock', () => {
    const t = at('2026-11-23T00:30:00')
    const log = markSession(empty, 'bedtime', t)
    expect(log.days['2026-11-22']).toEqual({ bedtime: t })
    expect(log.lastReviewed).toBe(t)
    expect(markSession(log, 'morning', t + 1).lastReviewed).toBe(t)
  })
})

describe('streak', () => {
  const both = (log: PracticeLog, day: string) =>
    markSession(markSession(log, 'morning', at(`${day}T07:00:00`)), 'bedtime', at(`${day}T22:00:00`))

  it('counts consecutive days with 2+ sessions', () => {
    let log = both(both(both(empty, '2026-11-18'), '2026-11-20'), '2026-11-21')
    expect(streak(log, at('2026-11-22T09:00:00'))).toBe(2)
    log = markSession(log, 'morning', at('2026-11-22T07:00:00'))
    expect(streak(log, at('2026-11-22T09:00:00'))).toBe(2)
    log = markSession(log, 'midday', at('2026-11-22T12:00:00'))
    expect(streak(log, at('2026-11-22T13:00:00'))).toBe(3)
  })

  it('is zero after a missed day', () => {
    const log = both(empty, '2026-11-19')
    expect(streak(log, at('2026-11-22T09:00:00'))).toBe(0)
  })
})

describe('lastDays', () => {
  it('returns the last 7 practice days ending today', () => {
    const log = markSession(empty, 'morning', at('2026-11-20T07:00:00'))
    const days = lastDays(log, at('2026-11-22T09:00:00'))
    expect(days.map((d) => d.key)).toEqual([
      '2026-11-16',
      '2026-11-17',
      '2026-11-18',
      '2026-11-19',
      '2026-11-20',
      '2026-11-21',
      '2026-11-22',
    ])
    expect(days[4].sessions).toBe(1)
    expect(days[6].weekday).toBe('S')
  })
})

describe('reviewDue', () => {
  it('is due 30 days after the last review', () => {
    const t = at('2026-11-01T09:00:00')
    expect(reviewDue(empty, t)).toBe(false)
    expect(reviewDue({ days: {}, lastReviewed: t }, at('2026-11-30T09:00:00'))).toBe(false)
    expect(reviewDue({ days: {}, lastReviewed: t }, at('2026-12-02T09:00:00'))).toBe(true)
  })
})

describe('normalizePractice / storage', () => {
  it('drops malformed entries', () => {
    expect(
      normalizePractice({ days: { bad: { morning: 1 }, '2026-11-22': { morning: 5, nap: 3, bedtime: 'x' } }, lastReviewed: 'no' }),
    ).toEqual({ days: { '2026-11-22': { morning: 5 } }, lastReviewed: null })
  })

  it('round-trips', async () => {
    const log = markSession(empty, 'morning', at('2026-11-22T07:00:00'))
    await savePractice(log)
    expect(await loadPractice()).toEqual(log)
  })
})
