import { fireEvent, screen, within } from '@testing-library/react'
import { renderAt } from '../test/render'
import { BUILD_DATE, FIRST_PUBLISHED, formatDate } from './buildInfo'
import { COCODE, DDO, ISSUES, LICENSE_URL, OFL, REPO } from '../links'

const SUFFIX = ' (opens in a new tab)'
const plain = (el: Element) => (el.textContent ?? '').split(SUFFIX).join('')
const footerOf = (container: HTMLElement) => container.querySelector('footer')

describe('about page', () => {
  it('shows at #/about with its title, a main nav with nothing current, and focus on the h1 after a click', () => {
    const view = renderAt('/me')
    fireEvent.click(within(footerOf(view.container)!).getByRole('link', { name: 'About' }))
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('About Hej.')
    expect(screen.getByRole('heading', { level: 1 })).toHaveFocus()
    expect(document.title).toBe('About · Hej.')
    expect(screen.getByTestId('where')).toHaveTextContent('/about')
    const nav = within(screen.getByRole('navigation', { name: 'Main' }))
    expect(nav.getAllByRole('link').map((l) => l.textContent)).toEqual(['Street', 'Sounds', 'Me'])
    expect(nav.getAllByRole('link').filter((l) => l.hasAttribute('aria-current'))).toHaveLength(0)
  })

  it('shows the seven cards in order with their exact sentences and the dates from the constants', () => {
    const view = renderAt('/about')
    const cards = [...view.container.querySelectorAll('main section')].map((s) => [
      s.querySelector('h2')!.textContent,
      [...s.querySelectorAll('p')].map(plain),
    ])
    expect(cards).toEqual([
      ['What it is', [
        'Hej. teaches English speakers to hear and say Danish. Each lesson is a house on your street, and every word you hear and say lights a window.',
        'It is free, has no accounts and no ads, and runs entirely in your browser.',
      ]],
      ['Made by', [
        'Made by Babak at cocode.dk.',
        `First published ${formatDate(FIRST_PUBLISHED)}.`,
        `Updated ${formatDate(BUILD_DATE)}.`,
      ]],
      ['How it works', [
        'Hear each Danish word, say it out loud, then tap “I said it” to light its window. On a lesson word you can also record yourself and listen back; your recording never leaves your device. The Sounds page covers the letters and sounds English speakers trip on.',
      ]],
      ['Where the Danish comes from', [
        'The pronunciation symbols (IPA) are taken from Den Danske Ordbog (ordnet.dk). The sound you hear is your own device’s Danish voice reading the word: it is not a recording from the dictionary or from a native speaker, and it can differ from how a Dane says it. The English sound guides are written by hand and are approximate.',
        'The Danish and its sound guides are a draft until a Danish speaker has read them. If you spot a mistake, please tell us on GitHub.',
      ]],
      ['Your privacy', [
        'Hej. saves your name, your progress and your colour choice in this browser only. Nothing is sent anywhere, and there are no accounts, no ads and no tracking.',
      ]],
      ['Credits', [
        'Built with React, Vite and StyleX. Fonts: Bricolage Grotesque, Atkinson Hyperlegible Next and Noto Sans, under the SIL Open Font License. The Danish flag icon is the Dannebrog.',
        'Source code on GitHub, licensed under the Apache License 2.0 (licence).',
      ]],
      ['For agents', [
        'This site declares WebMCP tools on every page, so an agent in your browser can read what is on screen. They are listed in llms.txt.',
      ]],
    ])
    expect(screen.getAllByRole('heading', { level: 2 })).toHaveLength(7)
  })

  it('opens every external link in a new tab with the hidden suffix, and keeps llms.txt relative', () => {
    renderAt('/about')
    const external: [string, string][] = [
      ['cocode.dk', COCODE],
      ['ordnet.dk', DDO],
      ['tell us on GitHub', ISSUES],
      ['SIL Open Font License', OFL],
      ['GitHub', REPO],
      ['licence', LICENSE_URL],
    ]
    for (const [text, href] of external) {
      // cocode.dk is also in the footer, so take the first match
      const link = screen.getAllByRole('link', { name: `${text}${SUFFIX}` })[0]
      expect(link, text).toHaveAttribute('href', href)
      expect(link).toHaveAttribute('target', '_blank')
      expect(link).toHaveAttribute('rel', 'noopener noreferrer')
    }
    const llms = screen.getByRole('link', { name: 'llms.txt' })
    expect(llms).toHaveAttribute('href', './llms.txt')
    expect(llms).not.toHaveAttribute('target')
  })
})

describe('footer line', () => {
  it('reads "Made by Babak at cocode.dk · About" on Home, Sounds and Me, with About going to #/about', () => {
    for (const path of ['/', '/sounds', '/me']) {
      const view = renderAt(path)
      const footer = footerOf(view.container)!
      expect(plain(footer), path).toBe('Made by Babak at cocode.dk · About')
      expect(within(footer).getByRole('link', { name: 'About' }), path).toHaveAttribute('href', '/about')
      expect(within(footer).getByRole('link', { name: `cocode.dk${SUFFIX}` })).toHaveAttribute('href', COCODE)
      view.unmount()
    }
  })

  it('reads "Made by Babak at cocode.dk" with no About link on the About page', () => {
    const view = renderAt('/about')
    const footer = footerOf(view.container)!
    expect(plain(footer)).toBe('Made by Babak at cocode.dk')
    expect(within(footer).queryByRole('link', { name: 'About' })).toBeNull()
    expect(within(footer).getAllByRole('link')).toHaveLength(1)
  })

  it('is absent on the lesson entry, the done page and Not found', () => {
    for (const path of ['/lesson/hej-og-tak/1', '/lesson/hej-og-tak/done', '/nowhere']) {
      const view = renderAt(path)
      expect(view.container.textContent, path).not.toContain('Made by Babak')
      view.unmount()
    }
  })
})
