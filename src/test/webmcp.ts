import type { Answer, ModelContext, RegisteredTool } from '../webmcp/helper'

/** A fake `document.modelContext`: keeps the registered tools, and drops each when its signal aborts. */
export function installModelContext(rejecting: string[] = []) {
  const tools = new Map<string, RegisteredTool>()
  const signals: AbortSignal[] = []
  const context: ModelContext = {
    registerTool(tool, { signal }) {
      signals.push(signal)
      if (rejecting.includes(tool.name)) return Promise.reject(new Error('refused'))
      tools.set(tool.name, tool)
      signal.addEventListener('abort', () => tools.delete(tool.name))
      return undefined
    },
  }
  Object.defineProperty(document, 'modelContext', { value: context, configurable: true, writable: true })
  return {
    tools,
    signals,
    names: () => [...tools.keys()].sort(),
    call(name: string, input: unknown = {}): Promise<Answer> {
      const tool = tools.get(name)
      if (!tool) throw new Error(`tool ${name} is not registered`)
      return tool.execute(input)
    },
  }
}
