import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { expect, it } from 'vitest'
import App from './App'

;(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true
window.matchMedia ??= (() => ({ matches: false, addEventListener() {}, removeEventListener() {} })) as never

const wait = async (until: () => boolean = () => true) => {
  for (let i = 0; i < 40; i++) {
    await act(() => new Promise((r) => setTimeout(r, 25)))
    if (until()) return
  }
}

it('renders cards, picker and deck', async () => {
  const el = document.createElement('div')
  document.body.append(el)
  window.location.hash = '#/cards?f=calm'
  await act(async () => createRoot(el).render(<App />))
  await wait(() => !!el.textContent)
  expect(el.textContent).toContain('When I speak, calm floods my body.')
  expect(el.querySelectorAll('li').length).toBe(25)

  const add = [...el.querySelectorAll('button')].find((b) => b.textContent?.trim() === 'Today')!
  await act(async () => add.click())
  expect(document.body.textContent).toContain("Add to Today's 10")
  const slot3 = [...document.querySelectorAll('ol button')][2] as HTMLButtonElement
  await act(async () => slot3.click())
  await wait()

  expect(document.body.textContent).not.toContain("Add to Today's 10")

  window.location.hash = '#/deck?f=calm'
  await wait(() => !!el.textContent?.includes('/ 25'))
  expect(el.textContent).toContain('1 / 25')
  expect(el.textContent).toContain('Say it out loud, then tap')
})

it('runs a full affirmation session and marks it done on Today', async () => {
  const el = document.createElement('div')
  document.body.append(el)
  window.location.hash = '#/session/morning'
  await act(async () => createRoot(el).render(<App />))
  await wait(() => !!el.textContent?.includes('Breathe'))

  const click = async (label: string) => {
    const b = [...el.querySelectorAll('button')].find((x) => x.textContent?.trim() === label)!
    await act(async () => b.click())
  }
  await click('Skip')
  expect(el.textContent).toContain('Say this out loud first')
  await click('I said it')
  expect(el.textContent).toContain('Affirmation 1 of 10')

  const card = el.querySelector('[role="button"]') as HTMLElement
  for (let i = 0; i < 20; i++) await act(async () => card.click())
  expect(el.textContent).toContain('Well done!')
  await wait(() => !!el.textContent?.includes('Affirmation 2 of 10'))

  for (let i = 0; i < 9; i++) await click('Skip')
  expect(el.textContent).toContain('Morning session complete')
  expect(el.textContent).toContain('20 repetitions')

  window.location.hash = '#/'
  await wait(() => !!el.textContent?.includes('Affirmation sessions'))
  expect(el.textContent).toContain('Done at')
})
