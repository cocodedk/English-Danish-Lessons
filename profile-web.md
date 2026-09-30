# Profile: English-Danish Lessons (React, Vite, StyleX, Vitest)

The lean loop reads the first indented line under each heading below.

## suite_command

    npm ci && npm run verify

`verify` runs eslint, then `tsc --noEmit && vite build`, then Vitest. `scripts/assert-count.mjs`
checks that exactly the number of tests written in the `test` script ran and passed, so a skipped
or missing test fails the gate. A feature that adds tests raises that number. The gate has an
empty home, no browser and no credentials: `npm ci` uses the network, tests must not.

## build_command

    npm ci && npm run build

Type-checks with the project's TypeScript, then bundles with Vite into `dist/`.

## artifact

    dist/index.html

The built page. Serve `dist/` under `/English-Danish-Lessons/` with any static server and open it
(`npm run preview` does exactly that).

## account

    personal

The Claude account the loop spends on this project: the owner's own, never the work login. Run
with `GRAPH_ACCOUNTS=personal=$HOME/.claude-personal`.
