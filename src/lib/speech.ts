export const speechSupported = typeof window !== 'undefined' && 'speechSynthesis' in window

type VoiceLike = Pick<SpeechSynthesisVoice, 'name' | 'lang' | 'voiceURI'>

const NOVELTY =
  /^(Albert|Bad News|Bahh|Bells|Boing|Bubbles|Cellos|Wobble|Good News|Jester|Organ|Superstar|Trinoids|Whisper|Zarvox|Fred|Junior|Kathy|Ralph|Eddy|Flo|Grandma|Grandpa|Reed|Rocko|Sandy|Shelley)\b/i

/** 3 = natural/premium, 2 = enhanced, 1 = online Google voice, 0 = basic. */
export function voiceQuality(v: VoiceLike): number {
  const id = `${v.name} ${v.voiceURI}`
  if (/premium|natural|neural/i.test(id)) return 3
  if (/enhanced/i.test(id)) return 2
  if (/google/i.test(id)) return 1
  return 0
}

export function pickEnglishVoices<T extends VoiceLike>(voices: T[]): T[] {
  return voices
    .filter((v) => v.lang.toLowerCase().replace('_', '-').startsWith('en') && !NOVELTY.test(v.name))
    .sort((a, b) => voiceQuality(b) - voiceQuality(a) || a.lang.localeCompare(b.lang) || a.name.localeCompare(b.name))
}

export function englishVoices(): SpeechSynthesisVoice[] {
  return speechSupported ? pickEnglishVoices(speechSynthesis.getVoices()) : []
}

/** Calls `cb` whenever the voice list may have changed. Polls briefly because some browsers load voices late. */
export function watchVoices(cb: () => void): () => void {
  if (!speechSupported) return () => {}
  speechSynthesis.addEventListener('voiceschanged', cb)
  let tries = 0
  const timer = setInterval(() => {
    cb()
    if (++tries >= 20 || speechSynthesis.getVoices().length) clearInterval(timer)
  }, 250)
  return () => {
    clearInterval(timer)
    speechSynthesis.removeEventListener('voiceschanged', cb)
  }
}

export interface SpeakOptions {
  voiceURI: string | null
  rate: number
  volume?: number
}

/** iOS only allows speech that starts from a tap; call this inside the tap handler before speaking later. */
export function unlockSpeech() {
  if (!speechSupported) return
  const u = new SpeechSynthesisUtterance(' ')
  u.volume = 0
  speechSynthesis.speak(u)
}

export function speak(text: string, { voiceURI, rate, volume = 1 }: SpeakOptions): Promise<void> {
  if (!speechSupported) return Promise.resolve()
  speechSynthesis.cancel()
  return new Promise((resolve) => {
    const u = new SpeechSynthesisUtterance(text)
    const voices = englishVoices()
    const voice = voices.find((v) => v.voiceURI === voiceURI) ?? voices[0]
    if (voice) u.voice = voice
    u.lang = voice?.lang ?? 'en-US'
    u.rate = rate
    u.volume = volume
    u.onend = u.onerror = () => resolve()
    speechSynthesis.speak(u)
  })
}

export function stopSpeaking() {
  if (speechSupported) speechSynthesis.cancel()
}
