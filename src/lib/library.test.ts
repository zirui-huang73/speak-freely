import { describe, expect, it } from 'vitest'
import { AFFIRMATIONS, BOOK_TEN } from '../content/affirmations'
import {
  allCards,
  defaultLibrary,
  fillName,
  filterCards,
  loadLibrary,
  normalizeLibrary,
  sanitizeTodayTen,
  saveLibrary,
  setTodaySlot,
  shuffle,
  toggleInList,
} from './library'

const valid = new Set(AFFIRMATIONS.map((a) => a.id))

describe('fillName', () => {
  it('inserts the name', () => {
    expect(fillName('I love to say my name, {name}.', 'Zirui')).toBe('I love to say my name, Zirui.')
  })
  it('drops the placeholder cleanly when there is no name', () => {
    expect(fillName('I love to say my name, {name}.', '  ')).toBe('I love to say my name.')
  })
})

describe('setTodaySlot', () => {
  const ten = [...BOOK_TEN]
  it('replaces a middle slot', () => {
    expect(setTodaySlot(ten, 3, 'calm-5')[3]).toBe('calm-5')
  })
  it('refuses locked slots, out-of-range slots and duplicates', () => {
    expect(setTodaySlot(ten, 0, 'calm-5')).toBe(ten)
    expect(setTodaySlot(ten, 9, 'calm-5')).toBe(ten)
    expect(setTodaySlot(ten, 10, 'calm-5')).toBe(ten)
    expect(setTodaySlot(ten, 3, BOOK_TEN[5])).toBe(ten)
  })
})

describe('sanitizeTodayTen', () => {
  it('defaults to the book ten', () => {
    expect(sanitizeTodayTen(undefined, valid)).toEqual(BOOK_TEN)
  })
  it('forces locked slots and fills invalid or duplicate entries with unused cards', () => {
    const input = ['calm-2', 'gone', 'calm-3', 'calm-3', ...BOOK_TEN.slice(4, 9), 'calm-9']
    const out = sanitizeTodayTen(input, valid)
    expect(out).toHaveLength(10)
    expect(out[0]).toBe(BOOK_TEN[0])
    expect(out[9]).toBe(BOOK_TEN[9])
    expect(out[2]).toBe('calm-3')
    expect(new Set(out).size).toBe(10)
    expect(out.every((id) => valid.has(id))).toBe(true)
  })
})

describe('filterCards', () => {
  const cards = allCards([{ id: 'mine-1', text: 'I glow.' }])
  it('filters by all, favorites, mine and category', () => {
    expect(filterCards(cards, 'all', [])).toHaveLength(AFFIRMATIONS.length + 1)
    expect(filterCards(cards, 'favorites', ['calm-1', 'mine-1']).map((c) => c.id)).toEqual(['calm-1', 'mine-1'])
    expect(filterCards(cards, 'mine', []).map((c) => c.id)).toEqual(['mine-1'])
    expect(filterCards(cards, 'calm', []).every((c) => c.category === 'calm')).toBe(true)
  })
})

describe('toggleInList / shuffle', () => {
  it('toggles membership', () => {
    expect(toggleInList(['a'], 'b')).toEqual(['a', 'b'])
    expect(toggleInList(['a', 'b'], 'a')).toEqual(['b'])
  })
  it('shuffles without losing items', () => {
    const items = [1, 2, 3, 4, 5]
    const out = shuffle(items, () => 0)
    expect(out).not.toBe(items)
    expect([...out].sort()).toEqual(items)
  })
})

describe('normalizeLibrary', () => {
  it('cleans up bad data', () => {
    const lib = normalizeLibrary({
      favorites: ['calm-1', 'nope', 'mine-1'],
      counts: { 'calm-1': 3.7, x: -1, y: 'a' },
      custom: [{ id: 'mine-1', text: 'I glow.' }, { id: 'mine-2', text: '  ' }, null],
      todayTen: null,
    })
    expect(lib.favorites).toEqual(['calm-1', 'mine-1'])
    expect(lib.counts).toEqual({ 'calm-1': 3 })
    expect(lib.custom).toEqual([{ id: 'mine-1', text: 'I glow.' }])
    expect(lib.todayTen).toEqual(BOOK_TEN)
  })

  it('round-trips through storage', async () => {
    const lib = { ...defaultLibrary(), favorites: ['life-3'], counts: { 'life-3': 5 } }
    await saveLibrary(lib)
    expect(await loadLibrary()).toEqual(lib)
  })
})
