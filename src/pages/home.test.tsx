import { screen, within } from '@testing-library/react'
import { getLesson } from '../catalog'
import { resetStorage } from '../storage/core'
import { ENTRY_IDS, renderAt, seedName, seedProgress } from '../test/render'
import { byContent } from '../test/text'

const entries = getLesson('hej-og-tak')!.entries
const sounds = (i: number) => `Sounds like “${entries[i].respelling}” · ${entries[i].ipa}`
const h1 = () => screen.getByRole('heading', { level: 1 })
const card = () => within(screen.getByRole('region', { name: 'Continue' }))
const STORAGE_NOTE =
  "This browser can't save your progress, name or colour choice. They will be lost when you reload or close the page."

describe('home', () => {
  it('greets with the name, or without one', () => {
    const { unmount } = renderAt('/')
    expect(h1()).toHaveTextContent(/^Hej\.$/)
    unmount()
    seedName('Sam')
    renderAt('/')
    expect(h1()).toHaveTextContent('Hej, Sam.')
  })

  it('says how many windows are lit', () => {
    const cases: [string[], string][] = [
      [[], 'Your street is waiting. Start with Hej og tak.'],
      [['hej'], '1 window lit on your street.'],
      [['hej', 'tak', 'ja'], '3 windows lit on your street.'],
      [ENTRY_IDS, 'Every window is lit on your street.'],
    ]
    for (const [ids, line] of cases) {
      seedProgress(ids)
      const { unmount } = renderAt('/')
      expect(byContent(line)).toBeInTheDocument()
      unmount()
    }
  })

  it('shows the continue card for none lit, some lit and all lit', () => {
    let view = renderAt('/')
    expect(byContent('Start Hej og tak')).toBeInTheDocument()
    expect(byContent('Start Hej og tak').querySelector('[lang="da"]')).toHaveTextContent('Hej og tak')
    expect(card().getByText('Hej')).toHaveAttribute('lang', 'da')
    expect(view.container.textContent).toContain(sounds(0))
    expect(card().getByText('Hello')).toBeInTheDocument()
    expect(card().getByRole('link', { name: 'Start' })).toHaveAttribute('href', '/lesson/hej-og-tak/1')
    view.unmount()

    seedProgress(['hej', 'goddag'])
    view = renderAt('/')
    expect(byContent('Next in Hej og tak')).toBeInTheDocument()
    expect(card().getByText('Tak')).toHaveAttribute('lang', 'da')
    expect(view.container.textContent).toContain(sounds(2))
    expect(card().getByText('Thanks')).toBeInTheDocument()
    expect(card().getByRole('link', { name: 'Continue' })).toHaveAttribute('href', '/lesson/hej-og-tak/3')
    view.unmount()

    seedProgress(ENTRY_IDS)
    view = renderAt('/')
    expect(byContent('Hej og tak is done')).toBeInTheDocument()
    expect(card().getByText('Say it all again')).toBeInTheDocument()
    expect(card().getByRole('link', { name: 'Practise' })).toHaveAttribute('href', '/lesson/hej-og-tak/1')
    expect(view.container.textContent).not.toContain('Sounds like')
  })

  it('shows the main nav on Home, Me and Not found, and not on the lesson or done pages', () => {
    const nav = () => screen.queryByRole('navigation', { name: 'Main' })
    const current = () => within(nav()!).queryAllByRole('link').filter((l) => l.getAttribute('aria-current') === 'page')
    let view = renderAt('/')
    expect(current().map((l) => l.textContent)).toEqual(['Street'])
    view.unmount()
    view = renderAt('/me')
    expect(current().map((l) => l.textContent)).toEqual(['Me'])
    view.unmount()
    view = renderAt('/nowhere')
    expect(nav()).not.toBeNull()
    expect(current()).toHaveLength(0)
    view.unmount()
    for (const path of ['/lesson/hej-og-tak/1', '/lesson/hej-og-tak/done']) {
      view = renderAt(path)
      expect(nav()).toBeNull()
      view.unmount()
    }
  })

  it('draws the lit windows from storage and names the house link', () => {
    seedProgress(['hej', 'tak'])
    const { container } = renderAt('/')
    const link = screen.getByRole('link', { name: 'Hej og tak, 2 of 8 windows lit' })
    expect(link).toHaveAttribute('href', '/lesson/hej-og-tak')
    expect(link.querySelectorAll('g[data-lit="true"]')).toHaveLength(2)
    expect(link.querySelectorAll('g[data-lit="false"]')).toHaveLength(6)
    expect(container.textContent).toContain('Your street')
    expect(container.textContent).toContain('1 lesson')
    expect(container.textContent).toContain('Coming next')
  })

  it('offers Add your name only without a name', () => {
    const { unmount } = renderAt('/')
    expect(screen.getByRole('link', { name: 'Add your name' })).toHaveAttribute('href', '/me')
    unmount()
    seedName('Sam')
    renderAt('/')
    expect(screen.queryByRole('link', { name: 'Add your name' })).toBeNull()
  })

  it('shows the storage note only when storage is not saving', () => {
    const { unmount } = renderAt('/')
    expect(screen.queryByText(STORAGE_NOTE)).toBeNull()
    unmount()
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('denied')
    })
    resetStorage()
    renderAt('/')
    expect(screen.getByRole('status')).toHaveTextContent(STORAGE_NOTE)
  })
})
