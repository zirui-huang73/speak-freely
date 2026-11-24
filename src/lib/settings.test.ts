import { describe, expect, it } from 'vitest'
import { DEFAULT_SETTINGS, loadSettings, normalizeSettings, planOf, saveSettings } from './settings'

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
    const s = {
      name: 'Zirui',
      voiceURI: 'Samantha',
      rate: 1.1,
      reps: 30,
      deckReps: 5,
      theme: 'dark' as const,
      sleepVolume: 0.3,
      sleepMinutes: 30,
      generalPlan: 'Pronounce – Smile – Stop',
      pressurePlan: 'Hum – Link – Stop',
      hypnosisMode: 'daytime' as const,
      hypnosisMinutes: 20,
      hypnosisRate: 0.7,
      noise: 'white' as const,
      noiseVolume: 0.4,
      paceRate: 3,
      paceTick: true,
    }
    expect(normalizeSettings(s)).toEqual(s)
  })

  it('rejects unknown options and clamps ranges', () => {
    expect(normalizeSettings({ sleepMinutes: 45, sleepVolume: 5 })).toMatchObject({ sleepMinutes: 0, sleepVolume: 1 })
    expect(
      normalizeSettings({ hypnosisMode: 'nap', hypnosisMinutes: 15, hypnosisRate: 3, noise: 'pink', noiseVolume: -1 }),
    ).toMatchObject({ hypnosisMode: 'bedtime', hypnosisMinutes: 10, hypnosisRate: 1.2, noise: 'brown', noiseVolume: 0.02 })
  })
})

describe('planOf', () => {
  it('falls back to the default plan while a field is empty', () => {
    const s = normalizeSettings({ generalPlan: '  ', pressurePlan: 'Hum – Link – Stop' })
    expect(s.generalPlan).toBe('  ')
    expect(planOf(s, 'generalPlan')).toBe(DEFAULT_SETTINGS.generalPlan)
    expect(planOf(s, 'pressurePlan')).toBe('Hum – Link – Stop')
  })
})

describe('loadSettings / saveSettings', () => {
  it('round-trips through IndexedDB', async () => {
    expect(await loadSettings()).toEqual(DEFAULT_SETTINGS)
    await saveSettings({ ...DEFAULT_SETTINGS, name: 'Lee', reps: 25 })
    expect(await loadSettings()).toMatchObject({ name: 'Lee', reps: 25 })
  })
})
