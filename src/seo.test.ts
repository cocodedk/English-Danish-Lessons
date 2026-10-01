// Spec 09: favicon, social card and search basics. Everything is read from disk (Vitest runs from the project root).
import { exists, readBytes, readText } from './test/files'

// The public origin may not be written under src/: the README, where it is allowed, is the source of truth.
const ORIGIN = /^Play it: (\S+)$/m.exec(await readText('README.md'))?.[1] ?? ''
const TITLE = 'Hej. Learn Danish by hearing it and saying it'
const DESCRIPTION =
  'A free, private way for English speakers to learn Danish: hear each word, say it out loud and light a window on your street. No account, no ads.'
const ALT = 'Hej. with five painted Danish houses, their windows lit: Learn Danish by hearing it and saying it.'
const BUILD_FIRST = 'dist is missing: run npm run build first'

const html = await readText('index.html')
const head = html.slice(html.indexOf('<head>'), html.indexOf('</head>'))

/** The attributes of every `<name …>` tag in `text`, one record per tag. */
function tags(name: string, text = head): Record<string, string>[] {
  return [...text.matchAll(new RegExp(`<${name}\\s([^>]*)>`, 'g'))].map((m) =>
    Object.fromEntries([...m[1].matchAll(/([\w:-]+)="([^"]*)"/g)].map((a) => [a[1], a[2]])),
  )
}

const metas = tags('meta')
const links = tags('link')
const content = (key: 'name' | 'property', value: string) => metas.filter((m) => m[key] === value).map((m) => m.content)
const ldText = /<script type="application\/ld\+json">([\s\S]*?)<\/script>/.exec(head)?.[1] ?? ''
const be32 = (b: Uint8Array, at: number) => ((b[at] << 24) | (b[at + 1] << 16) | (b[at + 2] << 8) | b[at + 3]) >>> 0

describe('index.html head', () => {
  it('has every spec tag with the exact value', () => {
    expect(head.match(/<title>([^<]*)<\/title>/g)).toEqual([`<title>${TITLE}</title>`])
    expect(content('name', 'description')).toEqual([DESCRIPTION])
    expect(links.filter((l) => l.rel === 'canonical').map((l) => l.href)).toEqual([ORIGIN])
    expect(content('name', 'robots')).toEqual(['index, follow, max-image-preview:large'])
    expect(content('name', 'color-scheme')).toEqual(['light dark'])
    expect(metas.filter((m) => m.name === 'theme-color').map((m) => [m.content, m.media])).toEqual([
      ['#E5ECF1', '(prefers-color-scheme: light)'],
      ['#0B1730', '(prefers-color-scheme: dark)'],
    ])
    expect(links.filter((l) => l.rel === 'icon')).toEqual([
      { rel: 'icon', href: './favicon.svg', type: 'image/svg+xml' },
      { rel: 'icon', href: './favicon.ico', sizes: '48x48' },
    ])
    expect(links.filter((l) => l.rel === 'apple-touch-icon')).toEqual([{ rel: 'apple-touch-icon', href: './apple-touch-icon.png' }])
    expect(head).toContain('<meta charset="utf-8" />')
    expect(content('name', 'viewport')).toEqual(['width=device-width, initial-scale=1'])
  })

  it('has the Open Graph and Twitter tags with the same strings', () => {
    const og = Object.fromEntries(metas.filter((m) => m.property).map((m) => [m.property, m.content]))
    expect(og).toEqual({
      'og:type': 'website',
      'og:site_name': 'Hej.',
      'og:title': TITLE,
      'og:description': DESCRIPTION,
      'og:url': ORIGIN,
      'og:locale': 'en_US',
      'og:image': `${ORIGIN}og.png`,
      'og:image:type': 'image/png',
      'og:image:width': '1200',
      'og:image:height': '630',
      'og:image:alt': ALT,
    })
    const tw = Object.fromEntries(metas.filter((m) => m.name?.startsWith('twitter:')).map((m) => [m.name, m.content]))
    expect(tw).toEqual({
      'twitter:card': 'summary_large_image',
      'twitter:title': TITLE,
      'twitter:description': DESCRIPTION,
      'twitter:image': `${ORIGIN}og.png`,
      'twitter:image:alt': ALT,
    })
  })

  it('keeps the title short, the description a good length and every absolute URL on the origin', () => {
    expect(TITLE.length).toBeLessThanOrEqual(60)
    expect(DESCRIPTION.length).toBeGreaterThanOrEqual(110)
    expect(DESCRIPTION.length).toBeLessThanOrEqual(160)
    expect(head.match(/<title>/g)).toHaveLength(1)
    const allowed = [ORIGIN, 'https://schema.org', 'https://cocode.dk', 'http://www.w3.org/']
    for (const url of head.match(/https?:\/\/[^\s"<]+/g) ?? []) {
      expect(allowed.some((a) => url.startsWith(a)), url).toBe(true)
    }
  })

  it('holds the structured data as one parsed WebApplication', () => {
    expect(head.match(/application\/ld\+json/g)).toHaveLength(1)
    expect(JSON.parse(ldText)).toEqual({
      '@context': 'https://schema.org',
      '@type': 'WebApplication',
      name: 'Hej.',
      url: ORIGIN,
      description: DESCRIPTION,
      applicationCategory: 'EducationalApplication',
      operatingSystem: 'Any',
      inLanguage: 'en',
      isAccessibleForFree: true,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      teaches: 'Danish',
      author: { '@type': 'Person', name: 'Babak', url: 'https://cocode.dk' },
    })
  })

  it('shows a plain paragraph without scripts, before the root', () => {
    const noscript = '<noscript><p style="font:17px/1.45 system-ui,sans-serif;margin:24px;max-width:36em">Hej. teaches English speakers to hear and say Danish. It needs JavaScript to run: turn it on and reload.</p></noscript>'
    expect(html).toContain(noscript)
    expect(html.indexOf(noscript)).toBeLessThan(html.indexOf('<div id="root">'))
  })
})

describe('icons and card', () => {
  it('og.png is a 1200 x 630 PNG under 300 KB', async () => {
    const png = await readBytes('public/og.png')
    expect([...png.slice(0, 8)]).toEqual([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])
    expect([be32(png, 16), be32(png, 20)]).toEqual([1200, 630])
    expect(png.length).toBeLessThan(300 * 1024)
  })

  it('apple-touch-icon.png is a 180 x 180 PNG', async () => {
    const png = await readBytes('public/apple-touch-icon.png')
    expect([...png.slice(0, 8)]).toEqual([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])
    expect([be32(png, 16), be32(png, 20)]).toEqual([180, 180])
  })

  it('favicon.ico has the ICO signature and three images', async () => {
    const ico = await readBytes('public/favicon.ico')
    expect([...ico.slice(0, 4)]).toEqual([0, 0, 1, 0])
    expect(ico[4] | (ico[5] << 8)).toBe(3)
  })

  it('favicon.svg is the Dannebrog with the cross arms at the stated positions', async () => {
    const svg = await readText('public/favicon.svg')
    expect(svg).toContain('viewBox="0 0 37 28"')
    expect(svg).toContain('<rect width="37" height="28" fill="#C8102E"/>')
    expect(svg).toMatch(/<rect x="12" width="4" height="28" fill="#fff"\/>/)
    expect(svg).toMatch(/<rect y="12" width="37" height="4" fill="#fff"\/>/)
  })
})

describe('search files', () => {
  it('robots.txt is exactly three lines', async () => {
    expect(await readText('public/robots.txt')).toBe(`User-agent: *\nAllow: /\nSitemap: ${ORIGIN}sitemap.xml\n`)
  })

  it('sitemap.xml lists the one URL in the standard namespace', async () => {
    const xml = await readText('public/sitemap.xml')
    expect(xml).toMatch(/<urlset xmlns="http:\/\/www\.sitemaps\.org\/schemas\/sitemap\/0\.9">/)
    expect(xml.match(/<loc>/g)).toHaveLength(1)
    expect(xml).toContain(`<loc>${ORIGIN}</loc>`)
    expect(xml).not.toMatch(/lastmod|changefreq|priority/)
  })
})

describe('build and tokens', () => {
  it('copies the assets to dist and links the icons with ./ URLs', async () => {
    const files = ['favicon.svg', 'favicon.ico', 'apple-touch-icon.png', 'og.png', 'robots.txt', 'sitemap.xml']
    for (const f of files) expect(await exists(`dist/${f}`), `dist/${f}: ${BUILD_FIRST}`).toBe(true)
    const built = await readText('dist/index.html')
    for (const f of ['favicon.svg', 'favicon.ico', 'apple-touch-icon.png']) expect(built).toContain(`href="./${f}"`)
  })

  it('gives html and body the ink colour as well as the sky background', async () => {
    const css = await readText('src/styles/tokens.css')
    const start = css.search(/^html,\s*body\s*\{/m)
    expect(start).toBeGreaterThanOrEqual(0)
    const rule = css.slice(start, css.indexOf('}', start))
    expect(rule).toContain('background: var(--sky);')
    expect(rule).toContain('color: var(--ink);')
  })
})
