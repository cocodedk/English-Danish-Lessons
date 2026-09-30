import { screen, within } from '@testing-library/react'
import { getLesson } from '../catalog'
import { resetStorage } from '../storage/core'
import { ALL_LIT, ENTRY_IDS, ENTRY_IDS_2, LESSON, LESSON_2, renderAt, seedName, seedProgress } from '../test/render'
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
    const cases: [Record<string, string[]>, string][] = [
      [{}, 'Your street is waiting. Start with Hej og tak.'],
      [{ [LESSON]: ['hej'] }, '1 window lit on your street.'],
      [{ [LESSON]: ['hej', 'tak', 'ja'] }, '3 windows lit on your street.'],
      [{ [LESSON]: ENTRY_IDS }, '8 windows lit on your street.'],
      [{ [LESSON]: ENTRY_IDS, [LESSON_2]: ['jeg'] }, '9 windows lit on your street.'],
      [{ [LESSON]: ENTRY_IDS, [LESSON_2]: ENTRY_IDS_2 }, '16 windows lit on your street.'],
      [ALL_LIT, 'Every window is lit on your street.'],
    ]
    for (const [lit, line] of cases) {
      seedProgress([], lit)
      const { unmount } = renderAt('/')
      expect(byContent(line)).toBeInTheDocument()
      unmount()
    }
  })

  it('continues the first lesson with an unlit entry', () => {
    const cases: [Record<string, string[]>, string, string, string, string][] = [
      [{ [LESSON]: ENTRY_IDS }, 'Start Hvem er du?', 'Jeg', 'Start', '/lesson/hvem-er-du/1'],
      [{ [LESSON]: ENTRY_IDS, [LESSON_2]: ['jeg', 'du'] }, 'Next in Hvem er du?', 'Hvad hedder du?', 'Continue', '/lesson/hvem-er-du/3'],
      [{ [LESSON_2]: ENTRY_IDS_2 }, 'Start Hej og tak', 'Hej', 'Start', '/lesson/hej-og-tak/1'],
    ]
    for (const [lit, label, word, button, href] of cases) {
      seedProgress([], lit)
      const { unmount } = renderAt('/')
      expect(byContent(label)).toBeInTheDocument()
      expect(card().getByText(word)).toHaveAttribute('lang', 'da')
      expect(card().getByRole('link', { name: button })).toHaveAttribute('href', href)
      unmount()
    }
  })

  it('says every lesson is done, and practises the first lesson', () => {
    seedProgress([], ALL_LIT)
    const { container } = renderAt('/')
    expect(byContent('Every lesson is done')).toBeInTheDocument()
    expect(card().getByText('Hej og tak')).toHaveAttribute('lang', 'da')
    expect(card().getByText('Start again from the beginning.')).toBeInTheDocument()
    expect(card().getByRole('link', { name: 'Practise' })).toHaveAttribute('href', '/lesson/hej-og-tak/1')
    expect(container.textContent).not.toContain('Sounds like')
  })

  it('shows the continue card for none lit and some lit', () => {
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
  })

  it('shows the three-item main nav on Home, Sounds, Me and Not found, and not on the lesson or done pages', () => {
    const nav = () => screen.queryByRole('navigation', { name: 'Main' })
    const links = () => within(nav()!).getAllByRole('link')
    const current = () => links().filter((l) => l.getAttribute('aria-current') === 'page')
    let view = renderAt('/')
    expect(links().map((l) => [l.textContent, l.getAttribute('href')])).toEqual([
      ['Street', '/'],
      ['Sounds', '/sounds'],
      ['Me', '/me'],
    ])
    expect(current().map((l) => l.textContent)).toEqual(['Street'])
    view.unmount()
    view = renderAt('/sounds')
    expect(links().map((l) => l.textContent)).toEqual(['Street', 'Sounds', 'Me'])
    expect(current().map((l) => l.textContent)).toEqual(['Sounds'])
    view.unmount()
    view = renderAt('/me')
    expect(links().map((l) => l.textContent)).toEqual(['Street', 'Sounds', 'Me'])
    expect(current().map((l) => l.textContent)).toEqual(['Me'])
    view.unmount()
    view = renderAt('/nowhere')
    expect(links().map((l) => l.textContent)).toEqual(['Street', 'Sounds', 'Me'])
    expect(current()).toHaveLength(0)
    view.unmount()
    for (const path of ['/lesson/hej-og-tak/1', '/lesson/hej-og-tak/done']) {
      view = renderAt(path)
      expect(nav()).toBeNull()
      view.unmount()
    }
  })

  it('draws the houses from storage, names their links and has no plot', () => {
    seedProgress(['hej', 'tak'], { [LESSON]: ['hej', 'tak'], [LESSON_2]: ['jeg'] })
    const { container } = renderAt('/')
    const link = screen.getByRole('link', { name: 'Hej og tak, 2 of 8 windows lit' })
    expect(link).toHaveAttribute('href', '/lesson/hej-og-tak')
    expect(link.querySelectorAll('g[data-lit="true"]')).toHaveLength(2)
    expect(link.querySelectorAll('g[data-lit="false"]')).toHaveLength(6)
    const second = screen.getByRole('link', { name: 'Hvem er du?, 1 of 8 windows lit' })
    expect(second).toHaveAttribute('href', '/lesson/hvem-er-du')
    expect(second.querySelector('[data-house]')).toHaveAttribute('data-house', 'tegl')
    expect(second.querySelector('[data-gable]')).toHaveAttribute('data-gable', 'point')
    expect(container.textContent).toContain('Your street')
    expect(container.textContent).toContain('5 lessons')
    expect(container.textContent).not.toContain('Coming next')
    expect(container.querySelector('[data-plot]')).toBeNull()
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
