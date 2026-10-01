# Spec 08: serve the app from any path, so a custom domain works

## Goal

The same build works at `https://cocodedk.github.io/English-Danish-Lessons/` and at the root of a
custom domain, `https://hej.cocode.dk/`. Today every asset URL in the build starts with
`/English-Danish-Lessons/`, which would 404 on the custom domain. The domain's DNS record and the
repository's Pages setting are the owner's; this spec only makes the build path-independent and
points the README at the new address.

## Behaviour

- `vite.config.ts`: `base` becomes `'./'`, so the built `index.html`, scripts, styles and fonts use
  relative URLs. Replace the comment above it: the app lives wherever its folder is served from; the
  project path no longer appears in the config. `HashRouter` already keeps routing independent of
  the path, so no route changes.
- Search `src/`, `index.html` and `public/` for any other use of the old path or of
  `import.meta.env.BASE_URL` and make it path-independent; the only remaining mention of
  `English-Danish-Lessons` in them may be the repository link in `public/llms.txt`.
- `README.md`: the play line becomes exactly `Play it: https://hej.cocode.dk/`.
- `src/deploy.test.ts` (and any test that asserts the old base or the old play line) is updated to
  the new base and the new line.
- No `CNAME` file: the repository uses the Pages Actions deployment, where the domain is a
  repository setting, not a file.
- Nothing else changes.

## Acceptance

`npm ci && npm run verify` passes; the new test count is in `assert-count.mjs` and the pull request.
The tests prove, at least:

1. `vite.config.ts` has `base: './'` (read from disk) and no other mention of the old path.
2. In the built `dist/index.html` every local `src` and `href` starts with `./` and none starts with
   `/` or with the old path; the built CSS in `dist/assets/` has no `url(/` reference. (These read
   `dist/` and fail with a message saying to run `npm run build` first if it is missing.)
3. `README.md` contains the play line exactly as above and no `github.io` play line.
4. The usual static checks (no network calls, no colour literals) still pass.

## Answers to the grill

- Why relative and not `/`: with `/` the old `github.io/English-Danish-Lessons/` address would
  break the moment this merges, before the domain is live; `./` works at both.
- The owner merges this when the domain is live, so `README.md` never advertises a dead address.
- The builder may not edit `CLAUDE.md` or `docs/design/`; the owner updates the Hosting line.

## Out of scope

DNS, the Pages domain setting, HTTPS enforcement, a `CNAME` file, redirects, Open Graph or
canonical tags, and any change under `src/` other than path handling and the tests above.
