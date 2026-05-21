# Phase 8 Runtime Migration Preparation Plan

**Goal:** Prepare the actual Vue runtime migration from Vue 2 to Vue 3 by defining a safe sequence for dependency upgrades, build changes, and compatibility validation on top of the cleanup already completed in Phases 5-7.

**Current state:** Global runtime seams have largely been isolated. Dialog orchestration, speedbump flow, share/signin focus behavior, auth/global alert app events, and browser-storage side effects now sit behind explicit services instead of ad hoc globals or a generic event bus. The remaining risk is no longer "hidden coupling everywhere"; it is the concrete runtime/toolchain jump itself.

**Why this phase exists:** The project is still pinned to a Vue 2-era stack:

- `vue@2.6.12`
- `vue-template-compiler@2.6.12`
- `vue-router@3`
- `vuex@3`
- `vue-loader@15`
- `webpack-dev-server@3`
- legacy hot client wiring in `webpack.development.config.js`

That means the next work should be a migration-prep phase focused on:

1. runtime dependency decisions
2. build pipeline upgrade sequence
3. compatibility checkpoints
4. smallest viable migration slice

## Target decisions

### Runtime

- Move to `vue@3`
- Move to `vue-router@4`
- Keep state on `vuex@4` first, not Pinia yet

Reason: switching from Vuex to Pinia at the same time as the Vue runtime adds unnecessary variables. Vuex 4 keeps the mental model stable while the runtime changes.

### Build

- Keep webpack for the first runtime migration
- Upgrade `vue-loader` to the Vue 3-compatible line
- Remove `vue-template-compiler`
- Add `@vue/compiler-sfc`
- Modernize dev server wiring away from hardcoded `webpack-dev-server/client?...`

Reason: moving from webpack to Vite in the same step would be a second migration. Runtime first, bundler second if still useful later.

### Scope boundaries

Do in Phase 8:

- dependency prep
- build config prep
- router/store compatibility prep
- one vertical runtime slice proven under Vue 3

Do not do in Phase 8:

- full visual redesign
- state management rewrite
- bundler replacement
- backend rewrite

## Concrete work plan

### Task 1: Freeze migration baseline

- Record the currently green focused commands:
  - `npm run build`
  - `npx playwright test test/e2e/auth.spec.ts --project=chromium --reporter=line`
  - `npx playwright test test/e2e/list.spec.ts --project=chromium --reporter=line`
  - `npx playwright test test/e2e/save-load.spec.ts --project=chromium --reporter=line`
  - `npx playwright test test/e2e/csv.spec.ts --project=chromium --reporter=line`
- Keep these as the minimum runtime-migration gate.

### Task 2: Prepare dependency jump

- Replace:
  - `vue-template-compiler`
  - `vue-loader@15`
  - `vue-router@3`
  - `vuex@3`
- Add:
  - `@vue/compiler-sfc`
- Audit any Vue 2-only loader/plugin assumptions in:
  - [webpack.config.js](/Users/fxbenard/Documents/Dev/lighterpack/webpack.config.js)
  - [webpack.development.config.js](/Users/fxbenard/Documents/Dev/lighterpack/webpack.development.config.js)

### Task 3: Prepare app bootstrap

- Convert [client/lighterpack.js](/Users/fxbenard/Documents/Dev/lighterpack/client/lighterpack.js) to Vue 3 bootstrap shape
- Replace `new Vue(...).$mount(...)` with `createApp(...)`
- Adapt service registration so `navigation`, `app-events`, and the store keep one clear initialization path

### Task 4: Prepare router/store compatibility

- Update router creation to Vue Router 4 style
- Update store wiring to Vuex 4 style
- Keep mutation/action semantics stable during the jump

### Task 5: Prepare directive/component compatibility

- Translate remaining Vue 2 lifecycle hooks where required:
  - `beforeDestroy` -> `beforeUnmount`
  - any remaining Vue 2 directive assumptions
- Recheck these surfaces first:
  - modals/popovers
  - drag/drop editor shell
  - share flow
  - auth flow

### Task 6: Migrate development server entry wiring

- Remove hardcoded dev-server client URLs from [webpack.development.config.js](/Users/fxbenard/Documents/Dev/lighterpack/webpack.development.config.js)
- Keep the dedicated Playwright port setup intact
- Make dev server entry composition depend on runtime config rather than fixed localhost strings

### Task 7: Prove one runtime slice

Success condition for the first migration slice:

- app boots on Vue 3
- auth flow passes
- list/share flow passes
- csv flow passes

Only after that should broader cleanup continue.

## Recommended execution order

1. dependency and webpack prep
2. bootstrap conversion in `client/lighterpack.js`
3. router/store migration
4. directive lifecycle cleanup
5. focused runtime verification

## Commit strategy

- `refactor: prep vue3 dependencies`
- `refactor: migrate vue app bootstrap`
- `refactor: upgrade router and store runtime`
- `refactor: align vue lifecycle hooks`
- `fix: restore vue3 runtime flows`

## Exit criteria

Phase 8 preparation is complete when:

- the migration order is fixed
- the runtime target stack is chosen
- the verification gate is explicit
- the repo is ready for a dedicated Vue 3 runtime branch without more discovery work
