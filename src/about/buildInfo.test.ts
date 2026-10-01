import { readText } from '../test/files'
import { BUILD_DATE, FIRST_PUBLISHED, formatDate } from './buildInfo'

describe('build info', () => {
  it('formats a date as day, English month and year, and leaves anything else alone', () => {
    expect(formatDate('2026-10-01')).toBe('1 October 2026')
    expect(formatDate('2026-09-30')).toBe('30 September 2026')
    expect(formatDate('2026-12-09')).toBe('9 December 2026')
    expect(formatDate('0099-10-01')).toBe('1 October 0099')
    expect(formatDate('0100-10-01')).toBe('1 October 0100')
    for (const junk of ['garbage', '', '2026-13-01', '2026-02-30', '2026-1-1', '1 October 2026']) {
      expect(formatDate(junk), junk).toBe(junk)
    }
  })

  it('has a fixed first publication date and a build date of the form YYYY-MM-DD', () => {
    expect(FIRST_PUBLISHED).toBe('2026-09-30')
    expect(BUILD_DATE).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })

  it('defines __BUILD_DATE__ in vite.config.ts without a Node global', async () => {
    const config = await readText('vite.config.ts')
    expect(config).toContain('define: { __BUILD_DATE__: JSON.stringify(new Date().toISOString().slice(0, 10)) }')
    for (const node of ['process.', '__dirname', 'Buffer', 'require(']) expect(config).not.toContain(node)
  })
})
