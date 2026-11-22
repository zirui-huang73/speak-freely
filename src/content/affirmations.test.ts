import { describe, expect, it } from 'vitest'
import { AFFIRMATIONS, BOOK_TEN, CATEGORIES } from './affirmations'

describe('affirmation content', () => {
  it('has about 200 cards with 20-30 per category', () => {
    expect(AFFIRMATIONS.length).toBeGreaterThanOrEqual(200)
    for (const c of CATEGORIES) {
      const n = AFFIRMATIONS.filter((a) => a.category === c.id).length
      expect(n, c.id).toBeGreaterThanOrEqual(20)
      expect(n, c.id).toBeLessThanOrEqual(30)
    }
  })

  it('has unique ids and texts', () => {
    expect(new Set(AFFIRMATIONS.map((a) => a.id)).size).toBe(AFFIRMATIONS.length)
    expect(new Set(AFFIRMATIONS.map((a) => a.text.toLowerCase())).size).toBe(AFFIRMATIONS.length)
  })

  it('contains only positive statements', () => {
    const negative =
      /\b(not|never|no|none|nothing|n't|cannot|stutter\w*|fear\w*|afraid|block\w*|anxious|anxiety|worr\w*|nervous|hate|bad|fail\w*|disabled)\b|n't\b/i
    const offenders = AFFIRMATIONS.filter((a) => negative.test(a.text)).map((a) => a.text)
    expect(offenders).toEqual([])
  })

  it("maps the book's ten to real cards", () => {
    const ids = new Set(AFFIRMATIONS.map((a) => a.id))
    expect(BOOK_TEN).toHaveLength(10)
    for (const id of BOOK_TEN) expect(ids.has(id), id).toBe(true)
    const text = (id: string) => AFFIRMATIONS.find((a) => a.id === id)!.text
    expect(text(BOOK_TEN[0])).toBe('Every day, in every way, my speech grows better and better.')
    expect(text(BOOK_TEN[9])).toBe("Today, I'll make a happy day.")
  })
})
