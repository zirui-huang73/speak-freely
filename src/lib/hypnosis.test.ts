import { describe, expect, it } from 'vitest'
import { AFFIRMATIONS } from '../content/affirmations'
import { buildScript } from '../content/hypnosis'
import { estimateMs, hypnosisSession, speechMs, timeScript } from './hypnosis'

const ten = AFFIRMATIONS.slice(0, 10).map((a) => a.text)

describe('buildScript', () => {
  it('includes the affirmations once (10 min) or twice (20 min)', () => {
    const count = (lines: { text: string }[]) => lines.filter((l) => l.text === ten[3]).length
    expect(count(buildScript('daytime', 10, ten))).toBe(1)
    expect(count(buildScript('daytime', 20, ten))).toBe(2)
  })

  it('wakes up in daytime mode and fades out at bedtime', () => {
    const day = buildScript('daytime', 10, ten)
    const night = buildScript('bedtime', 10, ten)
    expect(day.at(-1)!.text).toContain('wide awake')
    expect(night.at(-1)!.text).toContain('Sleep now')
    expect(night.at(-1)!.volume).toBeLessThan(0.5)
    expect(night.some((l) => l.text.includes('wide awake'))).toBe(false)
  })

  it('keeps every line short enough for browser voices', () => {
    for (const l of buildScript('bedtime', 20, ten)) expect(speechMs(l.text, 0.8)).toBeLessThan(15_000)
  })
})

describe('timeScript', () => {
  it.each([
    ['daytime', 10],
    ['bedtime', 10],
    ['daytime', 20],
    ['bedtime', 20],
  ] as const)('fits a %s %i-minute session with sensible pauses', (mode, minutes) => {
    const lines = hypnosisSession(mode, minutes, ten, 0.8)
    expect(estimateMs(lines, 0.8) / 60_000).toBeCloseTo(minutes, 0)
    const unit = lines[0].pauseMs / lines[0].pause
    expect(unit).toBeGreaterThan(900)
    expect(unit).toBeLessThan(3500)
  })

  it('never shrinks pauses below the minimum when speech is long', () => {
    const lines = timeScript([{ text: 'word '.repeat(2000), pause: 1 }], 1, 1)
    expect(lines[0].pauseMs).toBe(700)
  })
})
