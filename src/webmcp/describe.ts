import type { Tool } from './helper'
import { NO_INPUT } from './helper'

export type PageKind = 'home' | 'lesson' | 'done' | 'sounds' | 'me' | 'about' | 'not-found'

// The tools each page declares, besides `describe`. A test checks this against what pages register.
export const PAGE_TOOLS: Record<PageKind, string[]> = {
  home: ['get_street', 'open_lesson'],
  lesson: ['get_entry', 'hear_entry', 'mark_said', 'go_to'],
  done: ['get_result', 'go_from_done'],
  sounds: ['get_sounds', 'hear_example'],
  me: ['get_settings', 'set_name', 'clear_name', 'set_color_mode', 'delete_progress'],
  about: ['get_about'],
  'not-found': ['go_to_street'],
}

const SUMMARIES: Record<PageKind, string> = {
  home: 'Your street: one house per lesson with its lit windows, and a card that continues the next lesson.',
  lesson: 'One Danish entry to hear and say, a recorder to hear yourself, and a button to light its window.',
  done: 'The result of the lesson: how many windows are lit, and where to go next.',
  sounds: 'Four cards about Danish sounds, each with three example words to hear.',
  me: 'Your name, colour mode and progress, all kept in this browser.',
  about: 'About Hej.: who made it and when, where the Danish comes from, what is stored, and what it is built with.',
  'not-found': 'This page does not exist; one link leads back to your street.',
}

let current: PageKind = 'home'

/** Pages call this when they mount, so `describe` answers for the page on screen. */
export function setCurrentPage(page: PageKind): void {
  current = page
}

export const describeTool: Tool = {
  name: 'describe',
  description: 'Says which page is on screen, what it shows and which tools it offers.',
  inputSchema: NO_INPUT,
  annotations: { readOnlyHint: true },
  run: () => ({ page: current, summary: SUMMARIES[current], tools: ['describe', ...PAGE_TOOLS[current]] }),
}
