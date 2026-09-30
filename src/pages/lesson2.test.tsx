import { screen } from '@testing-library/react'
import { getLesson } from '../catalog'
import { ENTRY_IDS, ENTRY_IDS_2, LESSON, LESSON_2, renderAt, seedProgress } from '../test/render'
import { byContent } from '../test/text'

const lesson = getLesson(LESSON_2)!
const h1 = () => screen.getByRole('heading', { level: 1 })
const where = () => screen.getByTestId('where').textContent

describe('lesson 2 on the other pages', () => {
  it('shows an entry page with both pronunciation helps, and the long word', () => {
    const e = lesson.entries[7]
    const { container } = renderAt('/lesson/hvem-er-du/8')
    expect(h1()).toHaveTextContent('Hyggeligt at møde dig')
    expect(h1()).toHaveAttribute('lang', 'da')
    expect(container.textContent).toContain(`Sounds like “${e.respelling}” · ${e.ipa}`)
    expect(screen.getByText('Nice to meet you')).toBeInTheDocument()
    expect(byContent('Hvem er du? · 8 of 8').querySelector('[lang="da"]')).toHaveTextContent('Hvem er du?')
    expect(screen.getByRole('button', { name: 'Hear Hyggeligt at møde dig' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Finish' })).toHaveAttribute('href', '/lesson/hvem-er-du/done')
  })

  it('links Next to the entry after this one, inside lesson 2', () => {
    renderAt('/lesson/hvem-er-du/1')
    expect(screen.getByRole('link', { name: 'Next: Du' })).toHaveAttribute('href', '/lesson/hvem-er-du/2')
    expect(screen.getByRole('button', { name: 'Back' })).toBeDisabled()
  })

  it('celebrates on the done page with its own praise, title and count', () => {
    seedProgress([], { [LESSON_2]: ENTRY_IDS_2 })
    const { container } = renderAt('/lesson/hvem-er-du/done')
    expect(screen.getByRole('status')).toHaveTextContent('All 8 windows lit. Flot!')
    expect(h1()).toHaveTextContent('Flot')
    expect(container.textContent).toContain('Sounds like “flut” · [ˈflʌd]')
    expect(screen.getByText('Well done')).toBeInTheDocument()
    expect(byContent('Hvem er du? · all 8 windows lit').querySelector('[lang="da"]')).toHaveTextContent('Hvem er du?')
    expect(container.querySelectorAll('g[data-lit="true"]')).toHaveLength(8)
    expect(screen.getByRole('link', { name: 'Practise again' })).toHaveAttribute('href', '/lesson/hvem-er-du/1')
  })

  it('names its own first word when nothing is lit on the done page', () => {
    seedProgress(ENTRY_IDS)
    renderAt('/lesson/hvem-er-du/done')
    expect(h1()).toHaveTextContent('0 of 8 windows lit')
    expect(byContent('Start with Jeg and light your first window.')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Start the lesson' })).toHaveAttribute('href', '/lesson/hvem-er-du/1')
  })

  it('sends the bare lesson URL to its first unlit entry, whatever lesson 1 holds', () => {
    const cases: [Record<string, string[]>, string][] = [
      [{ [LESSON]: ENTRY_IDS }, '/lesson/hvem-er-du/1'],
      [{ [LESSON_2]: ['jeg', 'du', 'hvad-hedder-du'] }, '/lesson/hvem-er-du/4'],
      [{ [LESSON_2]: ENTRY_IDS_2 }, '/lesson/hvem-er-du/1'],
    ]
    for (const [lit, expected] of cases) {
      seedProgress([], lit)
      const { unmount } = renderAt('/lesson/hvem-er-du')
      expect(where()).toBe(expected)
      unmount()
    }
  })

  it('has no lesson name, praise or window count in the source outside the catalog', () => {
    const sources = import.meta.glob<string>(['/src/**/*.{ts,tsx}', '!/src/**/*.test.*', '!/src/test/**', '!/src/catalog/**'], {
      query: '?raw',
      import: 'default',
      eager: true,
    })
    expect(Object.keys(sources).length).toBeGreaterThan(20)
    for (const [file, text] of Object.entries(sources)) {
      expect(text, file).not.toMatch(/Hej og tak|Velkommen|hej-og-tak|hvem-er-du/)
      expect(text, file).not.toMatch(/\b(all|of|All) 8\b|\b8 windows/)
    }
  })
})
