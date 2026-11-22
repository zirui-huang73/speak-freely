import { getValue, setValue } from './storage'

export const THEMES = ['system', 'light', 'dark'] as const
export type Theme = (typeof THEMES)[number]

export interface Settings {
  name: string
  voiceURI: string | null
  rate: number
  reps: number
  deckReps: number
  theme: Theme
  sleepVolume: number
  sleepMinutes: number
  generalPlan: string
  pressurePlan: string
}

export const SLEEP_MINUTES = [30, 60, 0] as const

export const DEFAULT_SETTINGS: Settings = {
  name: '',
  voiceURI: null,
  rate: 0.9,
  reps: 20,
  deckReps: 3,
  theme: 'system',
  sleepVolume: 0.15,
  sleepMinutes: 0,
  generalPlan: 'Joy – Smile – Stop',
  pressurePlan: 'Slow – Link – Stop',
}

const text = (v: unknown, fallback: string) => (typeof v === 'string' && v.trim() ? v : fallback)

const KEY = 'settings'

const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n))

const intIn = (v: unknown, min: number, max: number, fallback: number) =>
  typeof v === 'number' && Number.isFinite(v) ? clamp(Math.round(v), min, max) : fallback

export function normalizeSettings(raw: unknown): Settings {
  const r = (raw && typeof raw === 'object' ? raw : {}) as Partial<Record<keyof Settings, unknown>>
  return {
    name: typeof r.name === 'string' ? r.name : DEFAULT_SETTINGS.name,
    voiceURI: typeof r.voiceURI === 'string' && r.voiceURI ? r.voiceURI : null,
    rate: typeof r.rate === 'number' && Number.isFinite(r.rate) ? clamp(r.rate, 0.5, 1.5) : DEFAULT_SETTINGS.rate,
    reps: intIn(r.reps, 1, 100, DEFAULT_SETTINGS.reps),
    deckReps: intIn(r.deckReps, 1, 20, DEFAULT_SETTINGS.deckReps),
    theme: THEMES.includes(r.theme as Theme) ? (r.theme as Theme) : DEFAULT_SETTINGS.theme,
    sleepVolume:
      typeof r.sleepVolume === 'number' && Number.isFinite(r.sleepVolume)
        ? clamp(r.sleepVolume, 0.02, 1)
        : DEFAULT_SETTINGS.sleepVolume,
    sleepMinutes: SLEEP_MINUTES.includes(r.sleepMinutes as 0) ? (r.sleepMinutes as number) : DEFAULT_SETTINGS.sleepMinutes,
    generalPlan: text(r.generalPlan, DEFAULT_SETTINGS.generalPlan),
    pressurePlan: text(r.pressurePlan, DEFAULT_SETTINGS.pressurePlan),
  }
}

export async function loadSettings(): Promise<Settings> {
  return normalizeSettings(await getValue(KEY))
}

export async function saveSettings(settings: Settings): Promise<void> {
  await setValue(KEY, normalizeSettings(settings))
}
