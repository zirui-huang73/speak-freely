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
