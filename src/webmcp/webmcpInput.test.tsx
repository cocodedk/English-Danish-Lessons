import { fireEvent, screen } from '@testing-library/react'
import { renderAt, seedProgress } from '../test/render'
import { call, PAGES, stored } from '../test/mcpCalls'
import { readText } from '../test/files'
import { installModelContext } from '../test/webmcp'

const llms = await readText('public/llms.txt')

describe('webmcp input and registration', () => {
  it('refuses missing, wrong-typed and unknown input on the tools that need input', async () => {
    const cases: [string, string, unknown[]][] = [
      ['/', 'open_lesson', [{}, { lessonId: 5 }, { lessonId: 'nope' }, { lessonId: 'hej-og-tak', position: '2' }, { lessonId: 'hej-og-tak', position: 9 }, { lessonId: 'hej-og-tak', position: 1.5 }]],
      ['/lesson/hej-og-tak/1', 'go_to', [{}, { where: 1 }, { where: 'sideways' }, { where: 'back' }, { where: 'finish' }]],
      ['/lesson/hej-og-tak/done', 'go_from_done', [{}, { where: 1 }, { where: 'elsewhere' }, [], 'x', null]],
      ['/me', 'set_color_mode', [{}, { mode: 5 }, { mode: 'purple' }]],
    ]
    for (const [path, tool, inputs] of cases) {
      const reg = installModelContext()
      const { unmount } = renderAt(path)
      for (const input of inputs) {
        const answer = await call(reg, tool, input)
        expect(answer, `${tool} ${JSON.stringify(input)}`).toMatchObject({ ok: false, error: expect.any(String) })
        expect(Array.isArray(answer.lessonIds ?? answer.valid)).toBe(true)
      }
      unmount()
    }
  })

  it('refuses bad names and an unconfirmed delete, and changes nothing', async () => {
    seedProgress(['hej'])
    const reg = installModelContext()
    renderAt('/me')
    for (const input of [{}, { name: 5 }, { name: '' }, { name: 'a'.repeat(25) }, { name: 'Sa\u0007m' }, { name: 'Sam\n' }, { name: '\tSam' }, [], null]) {
      const answer = await call(reg, 'set_name', input)
      expect(answer, JSON.stringify(input)).toMatchObject({ ok: false, error: expect.any(String), maxCharacters: 24 })
    }
    expect((await call(reg, 'set_name', { name: 'Sam\n' })).error).toBe(
      "That name has a character we can't save. Remove it and try again.",
    )
    for (const input of [{}, { confirm: 'yes' }, { confirm: false }, [], 'x']) {
      expect(await call(reg, 'delete_progress', input)).toMatchObject({ ok: false, error: expect.any(String) })
    }
    expect(stored()).toEqual(['hej'])
    expect((await call(reg, 'get_settings')).name).toBeNull()
  })

  it('gives the normal shape for {}, [], extra keys and other junk on the tools without input', async () => {
    seedProgress(['hej'])
    const junk: unknown[] = [{}, [], { extra: 1 }, 'x', 7, null, { where: 'next' }]
    for (const [, path, tools] of PAGES) {
      const reg = installModelContext()
      const { unmount } = renderAt(path)
      for (const tool of ['describe', ...tools].filter((t) => !['open_lesson', 'go_to', 'go_from_done', 'hear_example', 'set_name', 'set_color_mode', 'delete_progress'].includes(t))) {
        if (tool === 'clear_name' || tool === 'go_to_street') {
          // go_to_street leaves the page and unregisters its tools, so render it again for each input
          for (const input of junk) {
            const again = renderAt(path)
            expect(await call(reg, tool, input), `${tool} ${JSON.stringify(input)}`).toMatchObject({ ok: true })
            again.unmount()
          }
          continue
        }
        const normal = await call(reg, tool, {})
        for (const input of junk) {
          const answer = await call(reg, tool, input)
          if (tool === 'mark_said' || tool === 'hear_entry') expect(typeof answer.ok).toBe('boolean')
          else expect(answer, `${tool} ${JSON.stringify(input)}`).toEqual(normal)
        }
      }
      unmount()
    }
  })

  it('runs the app unchanged when there is no registry', () => {
    renderAt('/lesson/hej-og-tak/1')
    fireEvent.click(screen.getByRole('button', { name: 'I said it' }))
    expect(stored()).toEqual(['hej'])
  })

  it('keeps registering the other tools when one registration rejects', async () => {
    const reg = installModelContext(['get_street'])
    renderAt('/')
    expect(reg.names()).toEqual(['describe', 'open_lesson'])
    expect(await call(reg, 'open_lesson', { lessonId: 'hej-og-tak' })).toMatchObject({ ok: true })
  })

  it('lists in llms.txt exactly the tools the pages register, with their descriptions', () => {
    const reg = installModelContext()
    const registered: Record<string, string> = {}
    for (const [, path] of PAGES) {
      const { unmount } = renderAt(path)
      reg.tools.forEach((t) => {
        registered[t.name] = t.description
      })
      unmount()
    }
    const listed = Object.fromEntries([...llms.matchAll(/^- `([a-z_]+)`: (.+)$/gm)].map((m) => [m[1], m[2]]))
    expect(listed).toEqual(registered)
    expect(Object.keys(registered)).toHaveLength(18)
  })
})
