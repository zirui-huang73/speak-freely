export const speechSupported = typeof window !== 'undefined' && 'speechSynthesis' in window

export function englishVoices(): SpeechSynthesisVoice[] {
  if (!speechSupported) return []
  return speechSynthesis
    .getVoices()
    .filter((v) => v.lang.toLowerCase().startsWith('en'))
    .sort((a, b) => a.lang.localeCompare(b.lang) || a.name.localeCompare(b.name))
}

export function onVoicesChanged(cb: () => void): () => void {
  if (!speechSupported) return () => {}
  speechSynthesis.addEventListener('voiceschanged', cb)
  return () => speechSynthesis.removeEventListener('voiceschanged', cb)
}

export interface SpeakOptions {
  voiceURI: string | null
  rate: number
}

export function speak(text: string, { voiceURI, rate }: SpeakOptions): Promise<void> {
  if (!speechSupported) return Promise.resolve()
  speechSynthesis.cancel()
  return new Promise((resolve) => {
    const u = new SpeechSynthesisUtterance(text)
    const voice = englishVoices().find((v) => v.voiceURI === voiceURI)
    if (voice) u.voice = voice
    u.lang = voice?.lang ?? 'en-US'
    u.rate = rate
    u.onend = u.onerror = () => resolve()
    speechSynthesis.speak(u)
  })
}

export function stopSpeaking() {
  if (speechSupported) speechSynthesis.cancel()
}
