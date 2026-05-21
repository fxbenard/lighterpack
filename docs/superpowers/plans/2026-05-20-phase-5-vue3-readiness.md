# Phase 5 Vue 3 Readiness Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Prepare the LighterPack frontend for a future Vue 3 migration by removing the highest-risk Vue 2-era patterns and documenting a migration sequence without changing the product model.

**Architecture:** Treat this phase as a compatibility-prep pass, not a framework migration. First isolate global runtime patterns (`window.bus`, global `router`, global helpers, custom directives coupled to store and DOM), then introduce app-local abstractions that work in Vue 2 and map cleanly to Vue 3. Keep webpack and runtime stable while shrinking the eventual migration blast radius.

**Tech Stack:** Vue 2.6, Vue Router 3, Vuex 3, webpack 5, custom directives, Playwright.

---

## File Structure

- Modify: `client/lighterpack.js`
  - Stop relying on `window.bus`, `window.router`, and ad hoc global bootstrapping as the primary integration mechanism.
- Create: `client/services/event-bus.js`
  - Provide a thin compatibility event bus module for Vue 2 now, with a Vue 3-safe replacement seam later.
- Create: `client/services/navigation.js`
  - Centralize programmatic navigation currently spread across `window.router`, direct `router.push`, and `window.location`.
- Modify: `client/utils/focus.js`
  - Decouple directives from `window.bus` and direct store mutation patterns.
- Modify: `client/store/store.js`
  - Remove direct `bus.$emit(...)` calls from mutations and route unauthorized handling through a compatibility boundary.
- Modify: `client/utils/utils.js`
  - Remove reliance on `window.fetchJson`, `window.createCookie`, `window.readCookie`, `window.getElementIndex`, and `window.arrayMove` globals by exporting normal module functions.
- Modify: `client/routes.js`
  - Keep route shape stable, but make it easier to create the router instance in one place.
- Modify: components currently coupled to the global bus/navigation layer:
  - `client/components/account.vue`
  - `client/components/account-delete.vue`
  - `client/components/account-dropdown.vue`
  - `client/components/copy-list.vue`
  - `client/components/help.vue`
  - `client/components/import-csv.vue`
  - `client/components/item-image.vue`
  - `client/components/item-link.vue`
  - `client/components/item-view-image.vue`
  - `client/components/library-lists.vue`
  - `client/components/list-settings.vue`
  - `client/components/share.vue`
  - `client/components/signin-form.vue`
  - `client/components/speedbump.vue`
- Modify: components with direct DOM/query coupling that need migration notes or adapter use:
  - `client/components/library-items.vue`
  - `client/components/list.vue`
  - `client/components/list-summary.vue`
  - `client/components/popover.vue`
  - `client/components/modal.vue`
  - `client/components/unit-select.vue`
- Modify: `package.json`
  - Add focused verification commands if needed for the readiness pass.
- Modify: `docs/superpowers/specs/2026-05-19-lighterpack-roadmap-design.md`
  - Link this Phase 5 plan from the Vue 3 section.

## Audit Summary

Current Vue 3 blockers confirmed by code audit:

- Global event bus bootstrapped in `client/lighterpack.js` as `window.bus = new Vue()`.
- Global router bootstrapped in `client/lighterpack.js` as `window.router = new VueRouter(...)`.
- Custom directives in `client/utils/focus.js` depend on global `bus`, direct `window` listeners, and Vue 2 directive hooks like `inserted` / `unbind`.
- Store mutations in `client/store/store.js` emit side effects through `bus.$emit(...)`, which is a poor fit for Vue 3 migration and for deterministic state updates.
- Several components navigate with global `router.push(...)` instead of injected router access.
- Several components depend on direct DOM queries (`document.getElementById`, `getElementsByClassName`, `window.addEventListener`) in a way that should be isolated before migration.
- Utility functions are exposed on `window` in `client/utils/utils.js`, increasing coupling between modules and runtime globals.
- The dependency set remains Vue 2-specific: `vue@2.6`, `vue-template-compiler`, `vue-loader@15`, `vue-router@3`, `vuex@3`, `vue-color-picker-wheel`.

### Task 1: Introduce Compatibility Service Boundaries

**Files:**
- Create: `client/services/event-bus.js`
- Create: `client/services/navigation.js`
- Modify: `client/lighterpack.js`
- Modify: `client/routes.js`

- [ ] **Step 1: Add the event bus compatibility module**

Create `client/services/event-bus.js`:

```js
import Vue from 'vue';

const bus = new Vue();

export function on(eventName, handler) {
    bus.$on(eventName, handler);
}

export function off(eventName, handler) {
    bus.$off(eventName, handler);
}

export function emit(eventName, ...args) {
    bus.$emit(eventName, ...args);
}

export default {
    on,
    off,
    emit,
};
```

- [ ] **Step 2: Add the navigation compatibility module**

Create `client/services/navigation.js`:

```js
let activeRouter = null;

export function setRouter(routerInstance) {
    activeRouter = routerInstance;
}

export function push(location) {
    if (!activeRouter) {
        throw new Error('Router is not initialized.');
    }
    return activeRouter.push(location);
}

export function redirect(location) {
    window.location = location;
}
```

- [ ] **Step 3: Stop surfacing bus and router as primary globals**

Refactor `client/lighterpack.js` so it:

```js
import eventBus from './services/event-bus';
import { setRouter, redirect } from './services/navigation';

const router = new VueRouter({
    mode: 'history',
    routes,
});

setRouter(router);

eventBus.on('unauthorized', () => {
    redirect('/signin');
});
```

Keep boot stable in Vue 2, but do not create new `window.bus` / `window.router` dependencies.

- [ ] **Step 4: Run a focused auth/list smoke test**

Run:

```bash
npx playwright test test/e2e/auth.spec.ts --project=chromium --grep "should successfully log out|should successfully log in an existing user" --reporter=line
npx playwright test test/e2e/list.spec.ts --project=chromium --reporter=line
```

Expected: selected tests pass

- [ ] **Step 5: Commit**

```bash
git add client/services/event-bus.js client/services/navigation.js client/lighterpack.js client/routes.js
git commit -m "refactor: add vue migration services"
```

### Task 2: Remove Bus Side Effects From The Store

**Files:**
- Modify: `client/store/store.js`
- Modify: `client/services/event-bus.js`
- Modify: `client/utils/utils.js`

- [ ] **Step 1: Convert utility globals into normal exports**

Refactor `client/utils/utils.js` from:

```js
window.fetchJson = ...
window.readCookie = ...
window.createCookie = ...
window.getElementIndex = ...
window.arrayMove = ...
```

to named exports:

```js
export function fetchJson(url, options) { ... }
export function readCookie(name) { ... }
export function createCookie(name, value, days) { ... }
export function getElementIndex(node) { ... }
export function arrayMove(inputArray, oldIndex, newIndex) { ... }
```

- [ ] **Step 2: Import utility functions explicitly in the store**

Update `client/store/store.js` imports:

```js
import { arrayMove, createCookie, fetchJson } from '../utils/utils';
import eventBus from '../services/event-bus';
```

- [ ] **Step 3: Replace store-level global bus calls**

Change mutations like:

```js
bus.$emit('optionalFieldChanged');
bus.$emit('unauthorized');
```

to:

```js
eventBus.emit('optionalFieldChanged');
eventBus.emit('unauthorized');
```

Keep behavior stable, but isolate the side effect behind a module seam.

- [ ] **Step 4: Run focused store-dependent flows**

Run:

```bash
npx playwright test test/e2e/save-load.spec.ts --project=chromium --reporter=line
npx playwright test test/e2e/csv.spec.ts --project=chromium --reporter=line
```

Expected: both commands pass

- [ ] **Step 5: Commit**

```bash
git add client/store/store.js client/utils/utils.js client/services/event-bus.js
git commit -m "refactor: isolate store side effects"
```

### Task 3: Make Directives Vue 3-Ready

**Files:**
- Modify: `client/utils/focus.js`
- Modify: `client/store/store.js`

- [ ] **Step 1: Replace directive reliance on globals**

Update `client/utils/focus.js` to import dependencies directly:

```js
import Vue from 'vue';
import uniqueId from 'lodash/uniqueId';
import store from '../store/store';
import eventBus from '../services/event-bus';
```

- [ ] **Step 2: Normalize directive lifecycle and teardown**

Keep Vue 2 hooks for now, but structure each directive so the handler is stored on the element rather than indirectly in app state when possible. For example:

```js
Vue.directive('focus-on-bus', {
    inserted(el, binding) {
        const handler = () => el.focus();
        el.__lpFocusOnBus = handler;
        eventBus.on(binding.value, handler);
    },
    unbind(el, binding) {
        if (el.__lpFocusOnBus) {
            eventBus.off(binding.value, el.__lpFocusOnBus);
            delete el.__lpFocusOnBus;
        }
    },
});
```

Apply the same principle to `select-on-bus` and `click-outside`.

- [ ] **Step 3: Remove directive-instance storage from Vuex if it becomes unused**

If all directive teardown can live on elements, delete:

```js
directiveInstances: {},
addDirectiveInstance,
removeDirectiveInstance
```

from `client/store/store.js`.

- [ ] **Step 4: Run UI interaction smoke tests**

Run:

```bash
npx playwright test test/e2e/auth.spec.ts --project=chromium --grep "register a new user|log in an existing user" --reporter=line
npx playwright test test/e2e/visual-refresh.spec.ts --project=chromium --reporter=line
```

Expected: selected tests pass

- [ ] **Step 5: Commit**

```bash
git add client/utils/focus.js client/store/store.js
git commit -m "refactor: decouple vue directives"
```

### Task 4: Replace Component-Level Global Bus And Router Usage

**Files:**
- Modify: `client/components/account.vue`
- Modify: `client/components/account-delete.vue`
- Modify: `client/components/account-dropdown.vue`
- Modify: `client/components/copy-list.vue`
- Modify: `client/components/help.vue`
- Modify: `client/components/import-csv.vue`
- Modify: `client/components/item-image.vue`
- Modify: `client/components/item-link.vue`
- Modify: `client/components/item-view-image.vue`
- Modify: `client/components/library-lists.vue`
- Modify: `client/components/list-settings.vue`
- Modify: `client/components/share.vue`
- Modify: `client/components/signin-form.vue`
- Modify: `client/components/speedbump.vue`

- [ ] **Step 1: Import the compatibility services**

In each component that currently uses global `bus` or global `router`, replace those calls with explicit imports:

```js
import eventBus from '../services/event-bus';
import { push } from '../services/navigation';
```

- [ ] **Step 2: Replace event bus usage mechanically**

Examples:

```js
bus.$on('showHelp', () => { ... });
bus.$emit('showDeleteAccount');
```

become:

```js
eventBus.on('showHelp', () => { ... });
eventBus.emit('showDeleteAccount');
```

- [ ] **Step 3: Replace global router usage mechanically**

Examples:

```js
router.push('/');
router.push('/signin');
```

become either:

```js
this.$router.push('/');
```

or:

```js
push('/signin');
```

Choose the local pattern already best supported by each component.

- [ ] **Step 4: Run targeted user-flow verification**

Run:

```bash
npx playwright test test/e2e/auth.spec.ts --project=chromium --reporter=line
npx playwright test test/e2e/csv.spec.ts --project=chromium --reporter=line
```

Expected: both commands pass

- [ ] **Step 5: Commit**

```bash
git add client/components/account.vue client/components/account-delete.vue client/components/account-dropdown.vue client/components/copy-list.vue client/components/help.vue client/components/import-csv.vue client/components/item-image.vue client/components/item-link.vue client/components/item-view-image.vue client/components/library-lists.vue client/components/list-settings.vue client/components/share.vue client/components/signin-form.vue client/components/speedbump.vue
git commit -m "refactor: remove global vue runtime access"
```

### Task 5: Document DOM-Coupled Components And Migration Sequence

**Files:**
- Modify: `docs/superpowers/specs/2026-05-19-lighterpack-roadmap-design.md`
- Create: `docs/superpowers/plans/2026-05-20-phase-5-vue3-readiness-audit.md`

- [ ] **Step 1: Write the migration-risk audit**

Create `docs/superpowers/plans/2026-05-20-phase-5-vue3-readiness-audit.md` with:

- components using direct DOM selectors
- components binding global listeners
- components using dragula or third-party Vue 2-only integrations
- a migration order:
  1. services/utilities
  2. directives
  3. modal/popover/shared primitives
  4. form/auth screens
  5. list/editor surfaces
  6. chart/color-picker integrations

- [ ] **Step 2: Link the plan from the roadmap**

Add under the `Vue 3` section:

```markdown
Phase 5 implementation plan: `docs/superpowers/plans/2026-05-20-phase-5-vue3-readiness.md`.
```

- [ ] **Step 3: Run final readiness verification**

Run:

```bash
node scripts/verify-library-fixtures.js
npx playwright test test/e2e/list.spec.ts --project=chromium --reporter=line
npx playwright test test/e2e/csv.spec.ts --project=chromium --reporter=line
npx playwright test test/e2e/visual-refresh.spec.ts --project=chromium --reporter=line
```

Expected: all commands pass

- [ ] **Step 4: Commit**

```bash
git add docs/superpowers/specs/2026-05-19-lighterpack-roadmap-design.md docs/superpowers/plans/2026-05-20-phase-5-vue3-readiness.md docs/superpowers/plans/2026-05-20-phase-5-vue3-readiness-audit.md
git commit -m "docs: add vue3 readiness plan"
```

## Self-Review

- Spec coverage: The plan addresses the confirmed blockers from the audit: global bus/router, directives, direct DOM coupling, store side effects, and Vue 2-only dependency surface.
- Placeholder scan: Each task names exact files, migration boundaries, commands, and commit points. The plan intentionally stages compatibility prep before any actual Vue 3 package switch.
- Type consistency: The compatibility seams are consistently named `event-bus.js` and `navigation.js`, and the readiness pass does not claim to perform the actual Vue 3 migration.
