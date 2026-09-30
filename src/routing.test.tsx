import { fireEvent, screen, within } from '@testing-library/react'
import { renderAt } from './test/render'

describe('routing and focus', () => {
  it('sets the document title on every page', () => {
    const titles: [string, string][] = [
      ['/', 'Hej. Danish for English speakers'],
      ['/lesson/hej-og-tak/3', 'Tak · Hej og tak · Hej.'],
      ['/lesson/hej-og-tak/done', 'Done · Hej og tak · Hej.'],
      ['/me', 'Me · Hej.'],
      ['/nowhere', 'Not found · Hej.'],
    ]
    for (const [path, title] of titles) {
      const { unmount } = renderAt(path)
      expect(document.title, path).toBe(title)
      unmount()
    }
  })

  it('moves focus to the h1 on navigation, but not on the first render', () => {
    renderAt('/')
    expect(document.body).toHaveFocus()
    const nav = within(screen.getByRole('navigation', { name: 'Main' }))
    fireEvent.click(nav.getByRole('link', { name: 'Me' }))
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Me')
    expect(screen.getByRole('heading', { level: 1 })).toHaveFocus()
  })

  it('moves focus to the new entry heading when the learner goes to the next entry', () => {
    renderAt('/lesson/hej-og-tak/1')
    expect(document.body).toHaveFocus()
    fireEvent.click(screen.getByRole('link', { name: 'Next: Goddag' }))
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Goddag')
    expect(screen.getByRole('heading', { level: 1 })).toHaveFocus()
  })
})
