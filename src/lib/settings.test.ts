import { describe, expect, it } from 'vitest'
import { DEFAULT_SETTINGS, loadSettings, normalizeSettings, saveSettings } from './settings'

describe('normalizeSettings', () => {
  it('returns defaults for missing or invalid input', () => {
    expect(normalizeSettings(undefined)).toEqual(DEFAULT_SETTINGS)
    expect(normalizeSettings('nope')).toEqual(DEFAULT_SETTINGS)
    expect(normalizeSettings({ name: 3, rate: 'fast', reps: NaN, theme: 'pink', voiceURI: '' })).toEqual(
      DEFAULT_SETTINGS,
    )
  })

  it('clamps rate and reps into range', () => {
    expect(normalizeSettings({ rate: 3, reps: 500 })).toMatchObject({ rate: 1.5, reps: 100 })
    expect(normalizeSettings({ rate: 0.1, reps: 0 })).toMatchObject({ rate: 0.5, reps: 1 })
    expect(normalizeSettings({ reps: 12.6 }).reps).toBe(13)
  })

  it('keeps valid values', () => {
    const s = { name: 'Zirui', voiceURI: 'Samantha', rate: 1.1, reps: 30, deckReps: 5, theme: 'dark' as const }
    expect(normalizeSettings(s)).toEqual(s)
  })
})

describe('loadSettings / saveSettings', () => {
  it('round-trips through IndexedDB', async () => {
    expect(await loadSettings()).toEqual(DEFAULT_SETTINGS)
    await saveSettings({ ...DEFAULT_SETTINGS, name: 'Lee', reps: 25 })
    expect(await loadSettings()).toMatchObject({ name: 'Lee', reps: 25 })
  })
})
