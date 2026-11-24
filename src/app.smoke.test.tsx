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

it('renders recordings, recorder intro and sleep pages without recordings', async () => {
  const el = document.createElement('div')
  document.body.append(el)
  window.location.hash = '#/recordings'
  await act(async () => createRoot(el).render(<App />))
  await wait(() => (el.textContent?.match(/Not recorded yet/g) ?? []).length === 2)
  expect(el.textContent).toContain('Sleep Playback')

  window.location.hash = '#/record/monotone'
  await wait(() => !!el.textContent?.includes('Start recording'))
  expect(el.textContent).toContain('Monotone recording')

  window.location.hash = '#/sleep'
  await wait(() => !!el.textContent?.includes('Record your Monotone version'))
  expect(el.textContent).toContain('No recording yet.')
})

it('renders the crutches page and all three drills', async () => {
  const el = document.createElement('div')
  document.body.append(el)
  window.location.hash = '#/crutches'
  await act(async () => createRoot(el).render(<App />))
  await wait(() => !!el.textContent?.includes('Crutch of the week'))
  expect(el.textContent).toContain('It takes four things to stutter')
  expect(el.textContent).toContain('No crutch at all')

  const click = async (label: string) => {
    const b = [...el.querySelectorAll('button')].find((x) => x.textContent?.trim() === label)!
    await act(async () => b.click())
  }

  window.location.hash = '#/drill/words?c=3'
  await wait(() => !!el.textContent?.includes('Skip or spell it'))
  await click('Done, next')
  expect(el.textContent).toContain('1 done this round')

  window.location.hash = '#/drill/linking'
  await wait(() => !!el.textContent?.includes('Pressure plan'))
  expect(el.textContent).toContain('Slow – Link – Stop')
  expect(el.textContent).toContain('‿')

  await click('Meeting')
  expect(el.textContent).toMatch(/‿/)
  await click('Pace')
  expect(el.textContent).toContain('Syllables / second')
  expect(el.querySelectorAll('[aria-label="Syllable pace"] span').length).toBeGreaterThan(0)
  await click('Start')
  expect(el.textContent).toContain('One syllable per dot')
  await click('Mine')
  expect(el.textContent).toContain('No sentences here yet')
  const ta = el.querySelector('textarea[aria-label="New sentence"]') as HTMLTextAreaElement
  const setTa = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value')!.set!
  await act(async () => {
    setTa.call(ta, 'Quick update || two things.')
    ta.dispatchEvent(new Event('input', { bubbles: true }))
  })
  expect(el.textContent).toContain('Preview: Quick‿update')
  await click('Add sentence')
  await wait(() => !!el.textContent?.includes('My sentences (1)'))

  window.location.hash = '#/drill/free'
  await wait(() => !!el.textContent?.includes('No crutch at all'))
  expect(el.textContent).toContain('60s')
})

it('starts and ends a hypnosis session', async () => {
  const el = document.createElement('div')
  document.body.append(el)
  window.location.hash = '#/hypnosis'
  await act(async () => createRoot(el).render(<App />))
  await wait(() => !!el.textContent?.includes('Start 10-minute bedtime session'))

  const click = async (label: string) => {
    const b = [...el.querySelectorAll('button')].find((x) => x.textContent?.trim() === label)!
    await act(async () => b.click())
  }
  await click('Start 10-minute bedtime session')
  expect(el.textContent).toContain('Find a comfortable position')
  expect(el.textContent).toMatch(/about \d+ min left/)
  await click('Pause')
  expect(el.textContent).toContain('Resume')

  window.confirm = () => true
  await click('End')
  expect(el.textContent).not.toContain('min left')
})

it('edits the speech plan, shows the card, and renders export/import', async () => {
  const el = document.createElement('div')
  document.body.append(el)
  window.location.hash = '#/more/plan'
  await act(async () => createRoot(el).render(<App />))
  await wait(() => !!el.textContent?.includes('My Speech Plan'))

  const click = async (label: string) => {
    const b = [...el.querySelectorAll('button')].find((x) => x.textContent?.trim() === label)!
    await act(async () => b.click())
  }
  await click('Hum – Link – Stop')
  expect((el.querySelector('input[aria-label="Pressure plan"]') as HTMLInputElement).value).toBe('Hum – Link – Stop')
  await act(async () => [...el.querySelectorAll('button')].filter((b) => b.textContent === 'Show as card')[1].click())
  await wait(() => !!el.textContent?.includes('Tap to switch plans'))
  expect(el.textContent).toContain('Hum')

  window.location.hash = '#/more/data'
  await wait(() => !!el.textContent?.includes('Export backup'))
  expect(el.textContent).toContain('Choose backup file')
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
