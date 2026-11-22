import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { loadSettings, normalizeSettings, saveSettings, type Settings, type Theme } from '../../lib/settings'
import { SettingsContext } from './settingsContext'

function useApplyTheme(theme: Theme | undefined) {
  useEffect(() => {
    if (!theme) return
    const media = window.matchMedia('(prefers-color-scheme: dark)')
    const apply = () => {
      const dark = theme === 'dark' || (theme === 'system' && media.matches)
      document.documentElement.classList.toggle('dark', dark)
      document.documentElement.style.colorScheme = dark ? 'dark' : 'light'
    }
    apply()
    media.addEventListener('change', apply)
    return () => media.removeEventListener('change', apply)
  }, [theme])
}

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Settings | null>(null)

  useEffect(() => {
    loadSettings().then(setSettings)
  }, [])

  useApplyTheme(settings?.theme)

  const update = useCallback((patch: Partial<Settings>) => {
    setSettings((prev) => {
      if (!prev) return prev
      const next = normalizeSettings({ ...prev, ...patch })
      void saveSettings(next)
      return next
    })
  }, [])

  const value = useMemo(() => (settings ? { settings, update } : null), [settings, update])

  if (!value) return null
  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>
}
