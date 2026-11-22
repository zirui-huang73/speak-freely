import { describe, expect, it } from 'vitest'
import { pickEnglishVoices, voiceQuality } from './speech'

const v = (name: string, lang = 'en-US', voiceURI = name) => ({ name, lang, voiceURI })

describe('voiceQuality', () => {
  it('ranks natural/premium > enhanced > google > basic', () => {
    expect(voiceQuality(v('Microsoft Ava Online (Natural) - English (United States)'))).toBe(3)
    expect(voiceQuality(v('Ava', 'en-US', 'com.apple.voice.premium.en-US.Ava'))).toBe(3)
    expect(voiceQuality(v('Samantha (Enhanced)'))).toBe(2)
    expect(voiceQuality(v('Google US English'))).toBe(1)
    expect(voiceQuality(v('Samantha'))).toBe(0)
  })
})

describe('pickEnglishVoices', () => {
  it('keeps English voices, drops novelty ones, best first', () => {
    const picked = pickEnglishVoices([
      v('Samantha'),
      v('Zarvox'),
      v('Grandma (English (US))'),
      v('Thomas', 'fr-FR'),
      v('Daniel', 'en_GB'),
      v('Ava (Premium)'),
      v('Google UK English Female', 'en-GB'),
    ]).map((x) => x.name)
    expect(picked).toEqual(['Ava (Premium)', 'Google UK English Female', 'Daniel', 'Samantha'])
  })
})
