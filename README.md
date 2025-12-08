# npm CI Guard

Catch `npm ci` / lockfile problems **before** they break your CI.

`npm-ci-guard` is a small CLI + GitHub Action that checks:

- Is `package-lock.json` consistent with `package.json`?
- Are we using an npm version compatible with this lockfile?
- Did someone run `npm install` locally but forget to commit the lockfile?

## Status

> MVP / experimental - focused on a single command: `npm-ci-guard check`.

## Why?

Typical pain:

- `npm ci` suddenly breaks in CI after a Node / npm upgrade.
- `npm ci` fails while `npm install` worked locally.
- You pinned npm versions but lockfile behaviour is still flaky.

**Job to be done:**

> Before I merge or upgrade anything, I want to know if our `package-lock.json`
> will install deterministically in CI (and across machines), and if not, what to fix.

## Install / Usage
Installation:
```bash
npm i npm-ci-guard
```

You can run it via `npx` (no global install needed):

```bash
npx npm-ci-guard check
