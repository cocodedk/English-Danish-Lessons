import { totalEntries } from '../catalog'
import { isPersistent } from '../storage/core'
import {
  COLOR_MODES,
  MAX_NAME_LENGTH,
  countLit,
  prefsStore,
  profileStore,
  progressStore,
  type ColorMode,
  type NameCheck,
} from '../storage/stores'
import { fail, NO_INPUT, type Tool } from './helper'

/** The same handlers the Me page's buttons call. */
export type MeContext = {
  saveName: (raw: string) => NameCheck
  removeName: () => void
  applyColorMode: (mode: ColorMode) => void
  confirmDelete: () => void
}

export function meTools(ctx: MeContext): Tool[] {
  return [
    {
      name: 'get_settings',
      description: 'Returns the saved name, colour mode, windows lit and whether this browser is saving.',
      inputSchema: NO_INPUT,
      annotations: { readOnlyHint: true },
      run: () => ({
        name: profileStore.get().name || null,
        colorMode: prefsStore.get().colorMode,
        windowsLit: countLit(progressStore.get()),
        windowsTotal: totalEntries(),
        storage: isPersistent() ? 'saved' : 'session-only',
      }),
    },
    {
      name: 'set_name',
      description: 'Saves the name used in the greeting (1 to 24 characters) and returns it.',
      inputSchema: { type: 'object', properties: { name: { type: 'string' } }, required: ['name'] },
      run: ({ name }) => {
        const bad = (error: string) => fail(error, { maxCharacters: MAX_NAME_LENGTH })
        if (typeof name !== 'string') return bad('Give a name as text.')
        const check = ctx.saveName(name)
        return check.ok ? { ok: true, name: check.name } : bad(check.error ?? 'Use 1 to 24 characters.')
      },
    },
    {
      name: 'clear_name',
      description: 'Removes the saved name and returns ok.',
      inputSchema: NO_INPUT,
      run: () => {
        ctx.removeName()
        return { ok: true }
      },
    },
    {
      name: 'set_color_mode',
      description: 'Sets the colour mode to auto, light or dark and returns it.',
      inputSchema: { type: 'object', properties: { mode: { type: 'string', enum: [...COLOR_MODES] } }, required: ['mode'] },
      run: ({ mode }) => {
        const chosen = COLOR_MODES.find((m) => m === mode)
        if (!chosen) return fail('Use auto, light or dark.', { valid: [...COLOR_MODES] })
        ctx.applyColorMode(chosen)
        return { ok: true, colorMode: chosen }
      },
    },
    {
      name: 'delete_progress',
      description: 'Deletes every lit window when called with confirm true, and returns ok.',
      inputSchema: { type: 'object', properties: { confirm: { const: true } }, required: ['confirm'] },
      annotations: { consequentialHint: true },
      run: ({ confirm }) => {
        if (confirm !== true) return fail('Send { "confirm": true } to delete your progress.')
        if (countLit(progressStore.get()) === 0) return fail('No windows are lit, so there is nothing to delete.')
        ctx.confirmDelete()
        return { ok: true }
      },
    },
  ]
}
