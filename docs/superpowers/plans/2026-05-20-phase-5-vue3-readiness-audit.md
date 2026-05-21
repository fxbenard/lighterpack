# Phase 5 Vue 3 Readiness Audit

## Goal

Capture the concrete frontend risks that still matter for a future Vue 3 migration after the readiness work in Phase 5.

## Current State

The frontend is now less dependent on `window.bus`, `window.router`, and store-emitted global side effects. The biggest remaining migration risks are structural rather than purely global:

- custom directives still use Vue 2 directive hook names
- several components still query the DOM directly
- several components manage global window listeners manually
- drag-and-drop flows depend on `dragula`
- charting and color-picker integrations are not yet isolated behind framework-neutral adapters

## Direct DOM Coupling

These files still rely on document queries or direct DOM element orchestration and should be treated as medium-to-high migration risk:

- [client/components/import-csv.vue](/Users/fxbenard/Documents/Dev/lighterpack/client/components/import-csv.vue)
  Uses `document.getElementById('csv')` to bridge a hidden file input and bus-driven import flow.
- [client/components/library-items.vue](/Users/fxbenard/Documents/Dev/lighterpack/client/components/library-items.vue)
  Uses `document.getElementById('library')` and `document.getElementsByClassName('lpItems')` to wire `dragula`.
- [client/components/library-lists.vue](/Users/fxbenard/Documents/Dev/lighterpack/client/components/library-lists.vue)
  Uses `document.getElementById('lists')` to wire list reordering.
- [client/components/list.vue](/Users/fxbenard/Documents/Dev/lighterpack/client/components/list.vue)
  Uses `document.getElementsByClassName('lpItems')` and `document.getElementsByClassName('lpCategories')` for item/category drag setup.
- [client/components/list-summary.vue](/Users/fxbenard/Documents/Dev/lighterpack/client/components/list-summary.vue)
  Passes `document.getElementsByClassName('lpChart')[0]` into the chart renderer.
- [client/pies.js](/Users/fxbenard/Documents/Dev/lighterpack/client/pies.js)
  Creates and appends tooltip DOM directly to `document.body`.

## Global Listener Coupling

These files attach listeners to `window` and will need careful lifecycle translation when moving to Vue 3:

- [client/components/modal.vue](/Users/fxbenard/Documents/Dev/lighterpack/client/components/modal.vue)
- [client/components/popover.vue](/Users/fxbenard/Documents/Dev/lighterpack/client/components/popover.vue)
- [client/components/unit-select.vue](/Users/fxbenard/Documents/Dev/lighterpack/client/components/unit-select.vue)
- [client/utils/focus.js](/Users/fxbenard/Documents/Dev/lighterpack/client/utils/focus.js)

These are good candidates for a shared composition/helper layer before any component migration.

## Vue 2-Specific Runtime Surface

These dependencies still anchor the app to Vue 2 semantics:

- `vue@2.6.12`
- `vue-template-compiler@2.6.12`
- `vue-loader@15.9.6`
- `vue-router@3.4.9`
- `vuex@3.6.0`
- `vue-color-picker-wheel@0.4.3`

The first migration milestone should not replace them all at once. The safer path is to remove local code assumptions first, then upgrade the runtime stack in a dedicated phase.

## Migration Risk Groups

### Low Risk

Mostly local state or straightforward modal/event behavior:

- `account.vue`
- `account-delete.vue`
- `account-dropdown.vue`
- `copy-list.vue`
- `help.vue`
- `item-link.vue`
- `item-view-image.vue`
- `share.vue`
- `signin-form.vue`
- `speedbump.vue`

### Medium Risk

Use directives, optional fields, or hidden DOM interactions but are still reasonably bounded:

- `import-csv.vue`
- `item-image.vue`
- `list-settings.vue`
- `modal.vue`
- `popover.vue`
- `unit-select.vue`
- `global-alerts.vue`

### High Risk

Core editor surfaces or third-party coupling:

- `library-items.vue`
- `library-lists.vue`
- `list.vue`
- `item.vue`
- `category.vue`
- `list-summary.vue`
- `pies.js`
- `colorpicker.vue`

## Recommended Migration Order

1. services and utilities
   - finish removing remaining global runtime assumptions
   - keep compatibility seams stable

2. directives
   - translate Vue 2 directive hooks and teardown logic into migration-friendly helpers

3. shared primitives
   - modal, popover, unit-select, alert surfaces

4. auth and account flows
   - sign-in, account, help, delete-account, copy/share helpers

5. import and editor shell
   - import-csv, list-settings, sidebar-level coordination

6. list/editor core
   - list, category, item, library-lists, library-items, drag/drop integration

7. chart and color integrations
   - list-summary, pies, color picker, any Vue 2-only plugin replacements

## Recommended Next Technical Phase

Before any package upgrade, create one more prep phase that:

- isolates `dragula` behind a wrapper module
- moves chart tooltip DOM code behind a small renderer service
- replaces remaining direct `document.getElementById` / `getElementsByClassName` usage with refs or adapter functions where practical
- identifies a Vue 3-compatible replacement path for `vue-color-picker-wheel`

That will keep the actual Vue 3 migration focused on framework changes rather than mixed framework-plus-behavior rewrites.
