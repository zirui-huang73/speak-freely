import { getValue, setValue } from './storage'

export const THEMES = ['system', 'light', 'dark'] as const
export type Theme = (typeof THEMES)[number]

export interface Settings {
  name: string
  voiceURI: string | null
  rate: number
  reps: number
  theme: Theme
}

export const DEFAULT_SETTINGS: Settings = {
  name: '',
  voiceURI: null,
  rate: 0.9,
  reps: 20,
  theme: 'system',
}

const KEY = 'settings'

const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n))

export function normalizeSettings(raw: unknown): Settings {
  const r = (raw && typeof raw === 'object' ? raw : {}) as Partial<Record<keyof Settings, unknown>>
  return {
    name: typeof r.name === 'string' ? r.name : DEFAULT_SETTINGS.name,
    voiceURI: typeof r.voiceURI === 'string' && r.voiceURI ? r.voiceURI : null,
    rate: typeof r.rate === 'number' && Number.isFinite(r.rate) ? clamp(r.rate, 0.5, 1.5) : DEFAULT_SETTINGS.rate,
    reps:
      typeof r.reps === 'number' && Number.isFinite(r.reps) ? clamp(Math.round(r.reps), 1, 100) : DEFAULT_SETTINGS.reps,
    theme: THEMES.includes(r.theme as Theme) ? (r.theme as Theme) : DEFAULT_SETTINGS.theme,
  }
}

export async function loadSettings(): Promise<Settings> {
  return normalizeSettings(await getValue(KEY))
}

export async function saveSettings(settings: Settings): Promise<void> {
  await setValue(KEY, normalizeSettings(settings))
}
