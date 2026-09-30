import { useEffect, useLayoutEffect, useRef } from 'react'

export type Answer = Record<string, unknown>

export type Tool = {
  name: string
  description: string
  inputSchema: Record<string, unknown>
  annotations?: { readOnlyHint?: boolean; consequentialHint?: boolean }
  run: (input: Record<string, unknown>) => Answer | Promise<Answer>
}

/** What `document.modelContext.registerTool` receives (the draft API: one call per tool, no provideContext). */
export type RegisteredTool = Omit<Tool, 'run'> & { execute: (input: unknown) => Promise<Answer> }
export type ModelContext = {
  registerTool: (tool: RegisteredTool, options: { signal: AbortSignal }) => unknown
}

export const NO_INPUT = { type: 'object', properties: {} }

function modelContext(): ModelContext | undefined {
  return (document as unknown as { modelContext?: ModelContext }).modelContext
}

/** Objects only: anything else (arrays, strings, null) is treated as no input. */
export function normalise(input: unknown): Record<string, unknown> {
  return typeof input === 'object' && input !== null && !Array.isArray(input)
    ? (input as Record<string, unknown>)
    : {}
}

export function fail(error: string, extra: Answer = {}): Answer {
  return { ok: false, error, ...extra }
}

/**
 * Registers a page's tools when it mounts and aborts them when it unmounts. Each tool runs the
 * latest render's closure, so it reads live state. Without `document.modelContext` it does nothing.
 */
export function useWebMcp(tools: readonly Tool[]): void {
  const latest = useRef(tools)
  useLayoutEffect(() => {
    latest.current = tools
  })

  useEffect(() => {
    const context = modelContext()
    if (!context) return
    const controller = new AbortController()
    for (const { name, description, inputSchema, annotations } of latest.current) {
      const execute = async (input: unknown): Promise<Answer> => {
        try {
          const tool = latest.current.find((t) => t.name === name)
          return tool ? await tool.run(normalise(input)) : fail('This tool is not on this page.')
        } catch {
          return fail('The tool could not finish. Try again.')
        }
      }
      try {
        const registered = context.registerTool(
          { name, description, inputSchema, ...(annotations ? { annotations } : {}), execute },
          { signal: controller.signal },
        )
        Promise.resolve(registered).catch(() => undefined)
      } catch {
        // one failing registration must not stop the others
      }
    }
    return () => controller.abort()
  }, [])
}
