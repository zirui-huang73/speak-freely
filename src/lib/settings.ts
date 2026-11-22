import { HYPNOSIS_LENGTHS, type HypnosisMode } from '../content/hypnosis'
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
  hypnosisMode: HypnosisMode
  hypnosisMinutes: number
  hypnosisRate: number
  noise: NoiseType
  noiseVolume: number
}

export const SLEEP_MINUTES = [30, 60, 0] as const
export const NOISE_TYPES = ['off', 'brown', 'white'] as const
export type NoiseType = (typeof NOISE_TYPES)[number]

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
  hypnosisMode: 'bedtime',
  hypnosisMinutes: 10,
  hypnosisRate: 0.8,
  noise: 'brown',
  noiseVolume: 0.25,
}

const oneOf = <T>(options: readonly T[], v: unknown, fallback: T): T => (options.includes(v as T) ? (v as T) : fallback)

const numIn = (v: unknown, min: number, max: number, fallback: number) =>
  typeof v === 'number' && Number.isFinite(v) ? Math.min(max, Math.max(min, v)) : fallback

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
    sleepVolume: numIn(r.sleepVolume, 0.02, 1, DEFAULT_SETTINGS.sleepVolume),
    sleepMinutes: oneOf<number>(SLEEP_MINUTES, r.sleepMinutes, DEFAULT_SETTINGS.sleepMinutes),
    generalPlan: text(r.generalPlan, DEFAULT_SETTINGS.generalPlan),
    pressurePlan: text(r.pressurePlan, DEFAULT_SETTINGS.pressurePlan),
    hypnosisMode: oneOf(['bedtime', 'daytime'] as const, r.hypnosisMode, DEFAULT_SETTINGS.hypnosisMode),
    hypnosisMinutes: oneOf(HYPNOSIS_LENGTHS, r.hypnosisMinutes, 10),
    hypnosisRate: numIn(r.hypnosisRate, 0.5, 1.2, DEFAULT_SETTINGS.hypnosisRate),
    noise: oneOf(NOISE_TYPES, r.noise, DEFAULT_SETTINGS.noise),
    noiseVolume: numIn(r.noiseVolume, 0.02, 1, DEFAULT_SETTINGS.noiseVolume),
  }
}

export async function loadSettings(): Promise<Settings> {
  return normalizeSettings(await getValue(KEY))
}

export async function saveSettings(settings: Settings): Promise<void> {
  await setValue(KEY, normalizeSettings(settings))
}
