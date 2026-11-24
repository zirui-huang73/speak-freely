import { describe, expect, it } from 'vitest'
import { CRUTCHES, LINKED_SENTENCES } from '../content/crutches'
import {
  countSyllables,
  loadCrutchData,
  normalizeCrutchData,
  parseSentence,
  pickOther,
  saveCrutchData,
  spellInto,
  splitFirstSound,
  splitSyllable,
} from './crutches'

describe('content', () => {
  it('has 13 crutches numbered 1-13 and ~30 sentences', () => {
    expect(CRUTCHES.map((c) => c.n)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13])
    expect(LINKED_SENTENCES.length).toBeGreaterThanOrEqual(30)
  })
})

describe('linked sentences', () => {
  it('has about 80 tagged sentences with short linked phrases', () => {
    expect(LINKED_SENTENCES.length).toBeGreaterThanOrEqual(75)
    expect(new Set(LINKED_SENTENCES.map((s) => s.text)).size).toBe(LINKED_SENTENCES.length)
    for (const s of LINKED_SENTENCES) for (const p of parseSentence(s.text)) expect(p.words.length, s.text).toBeLessThanOrEqual(5)
  })
})

describe('countSyllables', () => {
  it('estimates common words', () => {
    const cases: [string, number][] = [
      ['the', 1], ['time', 1], ['hello', 2], ['meeting', 2], ['weekend', 2], ['minutes', 2],
      ['coffee', 2], ['really', 2], ['everyone', 3], ['finished', 2], ['wanted', 2], ['update', 2],
      ['yes', 1], ["everyone's", 3], ['quarter?', 2], ['data.', 2],
    ]
    for (const [w, n] of cases) expect(countSyllables(w), w).toBe(n)
  })
})

describe('word hints', () => {
  it('splits off the first sound', () => {
    expect(splitFirstSound('Lee')).toEqual(['L', 'ee'])
    expect(splitFirstSound('Thank you')).toEqual(['Th', 'ank you'])
    expect(splitFirstSound('Apple')).toEqual(['A', 'pple'])
  })

  it('spells into the word', () => {
    expect(spellInto('Lee')).toBe('L-E-E-Lee')
    expect(spellInto('My name is')).toBe('M-Y-My name is')
  })

  it('finds a rough first syllable', () => {
    expect(splitSyllable('Hello')).toEqual(['Hel', 'lo'])
    expect(splitSyllable('Monday')).toEqual(['Mon', 'day'])
    expect(splitSyllable('Seven')).toEqual(['Se', 'ven'])
    expect(splitSyllable('Coffee')).toEqual(['Cof', 'fee'])
    expect(splitSyllable('Lee')).toBeNull()
    expect(splitSyllable('Bank')).toBeNull()
  })
})

describe('parseSentence', () => {
  it('groups linked words and reads stop lengths', () => {
    expect(parseSentence('Hello | my name is Lee || nice to meet you')).toEqual([
      { words: ['Hello'], stop: 1 },
      { words: ['my', 'name', 'is', 'Lee'], stop: 2 },
      { words: ['nice', 'to', 'meet', 'you'], stop: 0 },
    ])
  })
})

describe('pickOther', () => {
  it('never repeats the current item when there is a choice', () => {
    let calls = 0
    const random = () => [0, 0, 0.9][calls++ % 3]
    expect(pickOther(['a', 'b'], 'a', random)).toBe('b')
    expect(pickOther(['a'], 'a')).toBe('a')
  })
})

describe('normalizeCrutchData', () => {
  it('cleans bad data and dedupes words', () => {
    expect(
      normalizeCrutchData({ week: 99, counts: { 4: 2.5, x: -1 }, myWords: [' Lee ', 'Lee', '', 3], mySentences: [' Hi | there ', 7] }),
    ).toEqual({
      week: 1,
      counts: { 4: 2 },
      myWords: ['Lee'],
      mySentences: ['Hi | there'],
    })
  })

  it('round-trips', async () => {
    const data = { week: 8, counts: { 8: 3 }, myWords: ['Zirui'], mySentences: ['Quick update || two things.'] }
    await saveCrutchData(data)
    expect(await loadCrutchData()).toEqual(data)
  })
})
