import { CRUTCHES } from '../content/crutches'
import { getValue, setValue } from './storage'

export interface CrutchData {
  week: number
  counts: Record<string, number>
  myWords: string[]
  mySentences: string[]
}

export const defaultCrutchData = (): CrutchData => ({ week: 1, counts: {}, myWords: [], mySentences: [] })

export const drillPath = (n: number) => (n <= 8 ? `/drill/words?c=${n}` : n === 13 ? '/drill/free' : '/drill/linking')

const VOWELS = /[aeiouy]/i

/** Splits off the leading consonant cluster (or the first letter for vowel-initial words). */
export function splitFirstSound(word: string): [string, string] {
  const first = word.split(' ')[0]
  if (VOWELS.test(first[0] ?? '')) return [word.slice(0, 1), word.slice(1)]
  const i = first.search(VOWELS)
  return i <= 0 ? [word.slice(0, 1), word.slice(1)] : [word.slice(0, i), word.slice(i)]
}

/** “L-E-E-Lee” using the first word. */
export function spellInto(word: string): string {
  const first = word.split(' ')[0]
  return `${first.toUpperCase().split('').join('-')}-${word}`
}

/** Rough first-syllable split for modulation hints; null for one-syllable words. */
export function splitSyllable(word: string): [string, string] | null {
  const first = word.split(' ')[0]
  const v = first.search(VOWELS)
  if (v < 0) return null
  let i = v
  while (i < first.length && VOWELS.test(first[i])) i++
  let j = i
  while (j < first.length && !VOWELS.test(first[j])) j++
  if (j >= first.length) return null
  const cut = j - i >= 2 ? i + 1 : i
  return [word.slice(0, cut), word.slice(cut)]
}

export interface Phrase {
  words: string[]
  stop: 0 | 1 | 2
}

export function parseSentence(sentence: string): Phrase[] {
  const parts = sentence.split(/\s*(\|\|?)\s*/)
  const phrases: Phrase[] = []
  for (let i = 0; i < parts.length; i += 2) {
    const words = parts[i].trim().split(/\s+/).filter(Boolean)
    if (!words.length) continue
    const marker = parts[i + 1]
    phrases.push({ words, stop: marker === '||' ? 2 : marker === '|' ? 1 : 0 })
  }
  return phrases
}

/** Rough English syllable count from spelling (at least 1). */
export function countSyllables(word: string): number {
  let w = word.toLowerCase().replace(/[^a-z]/g, '')
  if (!w) return 0
  if (w.length <= 3) return 1
  w = w.replace(/(?:[^laeiouy]es|[^tdaeiouy]ed|[^laeiouy]e)$/, (m) => m[0]).replace(/^y/, '')
  return Math.max(1, (w.match(/[aeiouy]+/g) ?? []).length)
}

export function pickOther<T>(items: T[], current: T | undefined, random: () => number = Math.random): T {
  if (items.length <= 1) return items[0]
  let next = current
  while (next === current) next = items[Math.floor(random() * items.length)]
  return next as T
}

const validCrutch = (n: unknown): n is number => typeof n === 'number' && CRUTCHES.some((c) => c.n === n)

export function normalizeCrutchData(raw: unknown): CrutchData {
  const r = (raw && typeof raw === 'object' ? raw : {}) as Partial<Record<keyof CrutchData, unknown>>
  const counts: Record<string, number> = {}
  if (r.counts && typeof r.counts === 'object') {
    for (const [k, v] of Object.entries(r.counts)) if (typeof v === 'number' && v > 0) counts[k] = Math.floor(v)
  }
  const strings = (v: unknown) =>
    Array.isArray(v) ? [...new Set(v.filter((w): w is string => typeof w === 'string').map((w) => w.trim()).filter(Boolean))] : []
  return {
    week: validCrutch(r.week) ? r.week : 1,
    counts,
    myWords: strings(r.myWords),
    mySentences: strings(r.mySentences),
  }
}

const KEY = 'crutches'

export async function loadCrutchData(): Promise<CrutchData> {
  return normalizeCrutchData(await getValue(KEY))
}

export async function saveCrutchData(data: CrutchData): Promise<void> {
  await setValue(KEY, data)
}
