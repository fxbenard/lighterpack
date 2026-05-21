# Phase 6 Pre-Migration UI Isolation Plan

**Goal:** Reduce the remaining Vue 3 migration risk in the editor shell by isolating drag-and-drop, chart rendering, and the most fragile direct DOM access without changing the product model.

## Scope

- move `dragula` setup behind a small service boundary
- move pie chart bootstrapping behind a small service boundary
- replace the highest-risk `document.getElementById` and `getElementsByClassName` calls with component refs or root-scoped queries
- clean up remaining editor-surface `bus.$emit(...)` calls that still rely on global compatibility
- keep listener-heavy primitives such as `modal`, `popover`, and `unit-select` for the next lot unless touched by this work

## First Implementation Lot

1. create `client/services/drag-drop.js`
2. create `client/services/list-chart.js`
3. refactor:
   - `client/components/library-lists.vue`
   - `client/components/library-items.vue`
   - `client/components/list.vue`
   - `client/components/list-summary.vue`
   - `client/components/import-csv.vue`
4. harden `client/pies.js` teardown so repeated chart updates do not accumulate listeners or orphan tooltip nodes
5. replace remaining editor-local `bus.$emit(...)` calls with `eventBus.emit(...)`

## Verification

Run only targeted checks for touched flows:

- `npx playwright test test/e2e/list.spec.ts --project=chromium --reporter=line`
- `npx playwright test test/e2e/save-load.spec.ts --project=chromium --reporter=line`
- `npx playwright test test/e2e/csv.spec.ts --project=chromium --reporter=line`

## Follow-Up Lot

After this first isolation pass:

- extract shared window-listener helpers for `modal`, `popover`, and `unit-select`
- decide the replacement path for `vue-color-picker-wheel`
- remove temporary `window.bus` / `window.router` compatibility once the remaining callers are migrated
