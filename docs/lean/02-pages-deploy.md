# Spec 02: publish the app on GitHub Pages

## Goal

Every push to `main` builds the app and publishes it at
`https://cocodedk.github.io/English-Danish-Lessons/`. The repository says so in its README. The app
itself does not change.

## Behaviour

- `.github/workflows/pages.yml`, named `Deploy Pages`:
  - triggers: `push` to `main`, and `workflow_dispatch`;
  - `permissions`: `contents: read`, `pages: write`, `id-token: write`;
  - `concurrency`: group `pages`, `cancel-in-progress: false`;
  - one job `deploy`, `runs-on: ubuntu-latest`, `environment` named `github-pages` with `url` set
    to `${{ steps.deployment.outputs.page_url }}`;
  - steps, in order, each action pinned by full commit SHA with the version as a trailing comment:
    1. `actions/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1 # v4`
    2. `actions/setup-node@820762786026740c76f36085b0efc47a31fe5020 # v7.0.0`, `node-version: 24`,
       `cache: npm`
    3. `run: npm ci`
    4. `run: npm run verify` (the same gate CI runs: nothing is published from a red build)
    5. `actions/configure-pages@45bfe0192ca1faeb007ade9deae92b16b8254a0d # v6.0.0`
    6. `actions/upload-pages-artifact@fc324d3547104276b827a68afc52ff2a11cc49c9 # v5.0.0` with
       `path: dist`
    7. `actions/deploy-pages@368f82528645a54fb793d4d04e342629a3f51346 # v5.0.1` with
       `id: deployment`
- `README.md`: add, under the first paragraph, the line
  `Play it: https://cocodedk.github.io/English-Danish-Lessons/`. The address may appear in the
  README and the workflow only (CLAUDE.md allows the path in `vite.config.ts` and the workflows; the
  README link is the one documentation exception).
- `package.json`: the test count in `assert-count.mjs N` rises by the new tests.
- Nothing else changes: no other file, no `index.html` meta tags, no brand frame, no external
  request.

## Acceptance

`npm ci && npm run verify` passes. A new test file reads `.github/workflows/pages.yml` from disk
(`node:fs`, path relative to the project root) and proves: the name; both triggers and only those;
the three permissions and no others; the concurrency group and `cancel-in-progress: false`; the
single job `deploy` with its environment and url expression; every `uses:` line pins a 40-character
SHA and the seven steps appear in the order above; `npm run verify` runs before the upload; the
upload path is `dist`. Another test proves `README.md` contains the play line exactly. The pull
request says the new test count.

## Answers to the grill

- The builder cannot enable Pages or run the workflow; a workflow that passes these tests is enough.
  The owner turns Pages on (Settings, Pages, source GitHub Actions) and the first push to `main`
  publishes.
- Running `npm run verify` inside the deploy job is deliberate: it doubles the work of CI, and that
  is the price of never publishing a broken build.
- The builder may change any existing test only to raise the count in `package.json`.

## Out of scope

A custom domain, a landing page, Open Graph or canonical tags, a service worker, the cocode.dk
frame, analytics, any change under `src/`.
