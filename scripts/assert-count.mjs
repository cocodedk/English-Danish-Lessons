// Fails unless exactly the expected number of tests ran and all passed.
// Usage: node scripts/assert-count.mjs <expected> (reads .vitest.json)
import { readFileSync } from 'node:fs'

const expected = Number(process.argv[2])
const { numTotalTests: total, numPassedTests: passed } = JSON.parse(
  readFileSync('.vitest.json', 'utf8'),
)

if (total !== expected || passed !== total) {
  console.error(`expected ${expected} tests, ${total} ran, ${passed} passed`)
  process.exit(1)
}
console.log(`test count ok: ${total}`)
