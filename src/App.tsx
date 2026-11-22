import { HashRouter, Navigate, Route, Routes } from 'react-router-dom'
import { Layout } from './app/Layout'
import { CardsPage } from './features/cards/CardsPage'
import { DeckPage } from './features/cards/DeckPage'
import { CrutchesPage } from './features/crutches/CrutchesPage'
import { HypnosisPage } from './features/hypnosis/HypnosisPage'
import { LibraryProvider } from './features/library/LibraryProvider'
import { MorePage } from './features/more/MorePage'
import { SettingsPage } from './features/more/SettingsPage'
import { PracticeProvider } from './features/practice/PracticeProvider'
import { SessionPage } from './features/practice/SessionPage'
import { RecorderPage } from './features/recordings/RecorderPage'
import { RecordingsPage } from './features/recordings/RecordingsPage'
import { SleepPage } from './features/recordings/SleepPage'
import { SettingsProvider } from './features/settings/SettingsProvider'
import { TodayPage } from './features/today/TodayPage'

export default function App() {
  return (
    <SettingsProvider>
      <LibraryProvider>
        <PracticeProvider>
          <HashRouter>
            <Routes>
              <Route element={<Layout />}>
                <Route index element={<TodayPage />} />
                <Route path="cards" element={<CardsPage />} />
                <Route path="crutches" element={<CrutchesPage />} />
                <Route path="hypnosis" element={<HypnosisPage />} />
                <Route path="more" element={<MorePage />} />
                <Route path="more/settings" element={<SettingsPage />} />
                <Route path="recordings" element={<RecordingsPage />} />
              </Route>
              <Route path="deck" element={<DeckPage />} />
              <Route path="session/:slot" element={<SessionPage />} />
              <Route path="record/:kind" element={<RecorderPage />} />
              <Route path="sleep" element={<SleepPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </HashRouter>
        </PracticeProvider>
      </LibraryProvider>
    </SettingsProvider>
  )
}
