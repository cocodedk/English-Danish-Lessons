import { act, screen } from '@testing-library/react'
import type { Answer } from '../webmcp/helper'
import type { installModelContext } from './webmcp'

export type Registry = ReturnType<typeof installModelContext>

export const where = () => screen.getByTestId('where').textContent
export const stored = () => JSON.parse(localStorage.getItem('edl.v1.progress') ?? 'null')?.value?.lit?.['hej-og-tak']

export async function call(reg: Registry, name: string, input?: unknown): Promise<Answer> {
  let out: Answer = {}
  await act(async () => {
    out = await reg.call(name, input)
  })
  return out
}

/** Every page, a path that shows it, and the tools it registers besides `describe`. */
export const PAGES: [string, string, string[]][] = [
  ['home', '/', ['get_street', 'open_lesson']],
  ['lesson', '/lesson/hej-og-tak/1', ['get_entry', 'hear_entry', 'mark_said', 'go_to']],
  ['done', '/lesson/hej-og-tak/done', ['get_result', 'go_from_done']],
  ['sounds', '/sounds', ['get_sounds', 'hear_example']],
  ['me', '/me', ['get_settings', 'set_name', 'clear_name', 'set_color_mode', 'delete_progress']],
  ['about', '/about', ['get_about']],
  ['not-found', '/nowhere', ['go_to_street']],
]
