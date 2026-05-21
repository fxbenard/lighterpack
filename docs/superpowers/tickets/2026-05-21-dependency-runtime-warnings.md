# Dependency and Runtime Warnings

## Summary

A separate follow-up is needed for remaining dependency/runtime warnings observed during the Vue 3 runtime preparation work.

## Observed warnings

During focused build and Playwright verification runs, these warnings still appear:

- `DeprecationWarning: The util.isArray API is deprecated. Please use Array.isArray() instead.`
- `DeprecationWarning: The util._extend API is deprecated. Please use Object.assign() instead.`
- `Warning: --localstorage-file was provided without a valid path`

## What was already checked

- `node.extend` has already been removed from the app code and dependencies.
- The app/runtime flows are currently green on the focused Chromium gate:
  - auth register
  - list external ID
  - list save
  - share/save-load persistence
  - CSV import/share/export
- The remaining warnings do not appear to come from the last Vue 3 migration patches directly.

## Current attribution

### `util.isArray`

Attributed to the `config` package during config loading.

Observed trace:

- `node_modules/config/lib/config.js`

Current installed version at investigation time:

- `config@1.31.0`

This warning is dependency-owned, not caused by current app code.

### `util._extend`

Attributed to the legacy dev-server stack pulled in by `webpack-dev-server@3`.

Observed dependency chain:

- `webpack-dev-server@3.11.1`
- `http-proxy-middleware@0.19.1`
- `http-proxy@1.18.1`
- `spdy@4.0.2`
- `spdy-transport@3.0.0`

These packages still reference `util._extend`.

This warning is dependency-owned, not caused by current app code.

### `--localstorage-file was provided without a valid path`

This warning reproduces during Playwright-managed `webServer` runs, but did **not** reproduce when running the equivalent `npm run start` command directly outside Playwright.

Current conclusion:

- likely injected by the Playwright/runtime harness or inherited process flags
- not currently attributable to repo-owned application code

## Goal

Identify which warnings come from:

1. repo-owned code
2. Playwright/webServer configuration
3. third-party dependencies still on legacy Node APIs

Then either:

- fix them in-project, or
- isolate/document them if they must be deferred to dependency upgrades

## Suggested investigation steps

- trace `util.isArray` and `util._extend` back to the actual loaded package(s)
- inspect the Playwright/web server startup path for the `--localstorage-file` warning
- decide whether each warning is:
  - fix now
  - remove via dependency replacement/upgrade
  - accept temporarily with explicit documentation

## Recommended next actions

1. Evaluate whether `config` should be upgraded or replaced, or whether this warning is acceptable until a broader config/runtime modernization pass.
2. Treat `util._extend` as a legacy toolchain warning tied to `webpack-dev-server@3`; the durable fix is likely the later bundler/dev-server modernization, not another patch in current app code.
3. Investigate Playwright `webServer` process flags/env separately if the `localstorage-file` warning becomes noisy enough to matter, but do not block current Vue 3 prep on it.

## Acceptance criteria

- warnings are either removed or explicitly attributed and documented
- no regression on the focused runtime gate after any fixes

## Note

GitHub issues are disabled on `fxbenard/lighterpack`, so this ticket is tracked locally for now.
