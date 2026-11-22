import { HashRouter, Navigate, Route, Routes } from 'react-router-dom'
import { Layout } from './app/Layout'
import { CardsPage } from './features/cards/CardsPage'
import { CrutchesPage } from './features/crutches/CrutchesPage'
import { HypnosisPage } from './features/hypnosis/HypnosisPage'
import { MorePage } from './features/more/MorePage'
import { SettingsPage } from './features/more/SettingsPage'
import { SettingsProvider } from './features/settings/SettingsProvider'
import { TodayPage } from './features/today/TodayPage'

export default function App() {
  return (
    <SettingsProvider>
      <HashRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<TodayPage />} />
            <Route path="cards" element={<CardsPage />} />
            <Route path="crutches" element={<CrutchesPage />} />
            <Route path="hypnosis" element={<HypnosisPage />} />
            <Route path="more" element={<MorePage />} />
            <Route path="more/settings" element={<SettingsPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </HashRouter>
    </SettingsProvider>
  )
}
