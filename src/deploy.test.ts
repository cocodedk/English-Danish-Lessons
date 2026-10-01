// The Pages workflow is text; these checks read it from disk (Vitest runs from the project root).
import { exists, readAll, readText } from './test/files'

const workflow = await readText('.github/workflows/pages.yml')
const readme = await readText('README.md')

/** The indented lines that follow a top-level key, up to the next top-level key. */
function block(key: string): string[] {
  const lines = workflow.split('\n')
  const start = lines.findIndex((l) => l.startsWith(`${key}:`))
  const rest = lines.slice(start + 1)
  const end = rest.findIndex((l) => /^\S/.test(l))
  return (end === -1 ? rest : rest.slice(0, end)).filter((l) => l.trim() !== '')
}

const steps = workflow
  .split('\n')
  .slice(workflow.split('\n').findIndex((l) => l.trim() === 'steps:') + 1)
  .join('\n')
  .split(/^ {6}- /m)
  .slice(1)

describe('Deploy Pages workflow', () => {
  it('is named Deploy Pages', () => {
    expect(workflow).toMatch(/^name: Deploy Pages$/m)
  })

  it('runs on push to main and workflow_dispatch only', () => {
    expect(block('on')).toEqual(['  push:', '    branches: [main]', '  workflow_dispatch:'])
  })

  it('asks for exactly three permissions', () => {
    expect(block('permissions')).toEqual(['  contents: read', '  pages: write', '  id-token: write'])
  })

  it('never cancels a running deploy', () => {
    expect(block('concurrency')).toEqual(['  group: pages', '  cancel-in-progress: false'])
  })

  it('has one job, deploy, in the github-pages environment', () => {
    const jobs = block('jobs')
    expect(jobs.filter((l) => /^ {2}\S/.test(l))).toEqual(['  deploy:'])
    expect(jobs).toContain('    runs-on: ubuntu-latest')
    expect(jobs).toContain('    environment:')
    expect(jobs).toContain('      name: github-pages')
    expect(jobs).toContain('      url: ${{ steps.deployment.outputs.page_url }}')
  })

  it('pins every action to a 40-character SHA with its version in a comment', () => {
    const uses = workflow.match(/^\s*- uses: .*$/gm) ?? []
    expect(uses).toHaveLength(5)
    for (const line of uses) expect(line).toMatch(/@[0-9a-f]{40} # v\d+\.\d+\.\d+$/)
  })

  it('runs the seven steps in order', () => {
    const heads = steps.map((s) => s.split('\n')[0])
    expect(heads).toEqual([
      'uses: actions/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1 # v7.0.1',
      'uses: actions/setup-node@820762786026740c76f36085b0efc47a31fe5020 # v7.0.0',
      'run: npm ci',
      'run: npm run verify',
      'uses: actions/configure-pages@45bfe0192ca1faeb007ade9deae92b16b8254a0d # v6.0.0',
      'uses: actions/upload-pages-artifact@fc324d3547104276b827a68afc52ff2a11cc49c9 # v5.0.0',
      'uses: actions/deploy-pages@368f82528645a54fb793d4d04e342629a3f51346 # v5.0.1',
    ])
    expect(steps[1]).toMatch(/node-version: 24\n\s+cache: npm/)
    expect(steps[6]).toMatch(/id: deployment/)
  })

  it('verifies before it uploads', () => {
    expect(workflow.indexOf('run: npm run verify')).toBeGreaterThan(-1)
    expect(workflow.indexOf('run: npm run verify')).toBeLessThan(workflow.indexOf('upload-pages-artifact'))
  })

  it('uploads dist', () => {
    expect(steps[5]).toMatch(/^\s+path: dist$/m)
  })
})

describe('README', () => {
  it('says where to play', () => {
    expect(readme).toContain('\nPlay it: https://hej.cocode.dk/\n')
  })

  it('has no github.io play line', () => {
    expect(readme).not.toMatch(/^Play it: .*github\.io/m)
  })
})

describe('Path independence', () => {
  const OLD_PATH = 'English-Danish-Lessons'
  const BUILD_FIRST = 'dist is missing: run npm run build first'

  it('sets base to ./ in vite.config.ts and names no project path', async () => {
    const config = await readText('vite.config.ts')
    expect(config).toMatch(/^\s*base: '\.\/',$/m)
    expect(config).not.toContain(OLD_PATH)
  })

  it('builds index.html with only ./ local src and href', async () => {
    expect(await exists('dist/index.html'), BUILD_FIRST).toBe(true)
    const html = await readText('dist/index.html')
    const urls = [...html.matchAll(/\b(?:src|href)="([^"]*)"/g)].map((m) => m[1]).filter((u) => !/^(https?:|data:|#)/.test(u))
    expect(urls.length).toBeGreaterThan(0)
    for (const url of urls) expect(url, url).toMatch(/^\.\//)
    expect(html).not.toContain(OLD_PATH)
  })

  it('builds CSS without root-relative url() references', async () => {
    const css = await readAll('dist/assets', '.css')
    expect(css.length, BUILD_FIRST).toBeGreaterThan(0)
    for (const file of css) expect(file).not.toMatch(/url\(\s*["']?\//)
  })
})
