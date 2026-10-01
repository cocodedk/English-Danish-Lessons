// Vitest hands back an empty string for CSS imported with ?raw, so files are read from disk.
// Paths are relative to the project root: Vitest runs from there.
type Fs = {
  readFileSync: (path: string, encoding: 'utf8') => string
  readdirSync: (path: string) => string[]
  existsSync: (path: string) => boolean
}

async function fs(): Promise<Fs> {
  const name = 'node:fs'
  return (await import(/* @vite-ignore */ name)) as Fs
}

export async function readText(path: string): Promise<string> {
  return (await fs()).readFileSync(path, 'utf8')
}

export async function exists(path: string): Promise<boolean> {
  return (await fs()).existsSync(path)
}

/** The text of every file in `dir` whose name ends with `ext`; empty when the directory is missing. */
export async function readAll(dir: string, ext: string): Promise<string[]> {
  const { existsSync, readdirSync, readFileSync } = await fs()
  if (!existsSync(dir)) return []
  return readdirSync(dir)
    .filter((f) => f.endsWith(ext))
    .map((f) => readFileSync(`${dir}/${f}`, 'utf8'))
}
