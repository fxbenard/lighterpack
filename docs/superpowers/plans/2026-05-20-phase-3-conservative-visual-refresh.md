# Phase 3 Conservative Visual Refresh Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refresh list readability and shared-list presentation without changing the LighterPack interaction model or persistence behavior.

**Architecture:** Keep the current Vue 2 component structure and Mustache share templates. Implement the refresh as CSS-first changes plus small class bindings on existing rows so the same visual state works in edit mode, import preview, and public share views. Use Playwright checks to confirm zero-quantity items remain visible but visually de-emphasized.

**Tech Stack:** Vue 2, SCSS, Mustache templates, Playwright.

---

## File Structure

- Modify: `client/components/item.vue`
  - Add explicit row classes for zero-quantity and active visual states in the editable list.
- Modify: `templates/t_itemShare.mustache`
  - Mirror the zero-quantity row class in the public share template.
- Modify: `server/views.js`
  - Pass share-row classes consistently into the Mustache item renderer.
- Modify: `client/css/_list.scss`
  - Improve editable list density, contrast, active-icon visibility, and zero-quantity de-emphasis.
- Modify: `client/css/_share.scss`
  - Apply the same row-state styling to public shared lists.
- Modify: `client/components/import-csv.vue`
  - Make the import preview easier to scan with clearer summary and denser table styling.
- Create: `test/e2e/visual-refresh.spec.ts`
  - Confirm a zero-quantity imported row carries the de-emphasis class in edit and share views.
- Modify: `package.json`
  - Add a focused Playwright script for the visual refresh scenario.

### Task 1: Zero-Quantity State

**Files:**
- Modify: `client/components/item.vue`
- Modify: `templates/t_itemShare.mustache`
- Modify: `server/views.js`
- Modify: `client/css/_list.scss`
- Modify: `client/css/_share.scss`

- [x] **Step 1: Add a focused browser test**

Create `test/e2e/visual-refresh.spec.ts` with a scenario that:

1. Registers a user.
2. Imports `test/fixtures/csv/roundtrip-rich.csv`.
3. Confirms the `Rain jacket` row in edit mode has class `lpQtyZero`.
4. Opens the share URL and confirms the same row has class `lpQtyZero`.

- [x] **Step 2: Run the test to see the failure**

Run:

```bash
npm run test:e2e:visual -- --project=chromium --reporter=line
```

Expected: FAIL because no `lpQtyZero` class is rendered yet.

- [x] **Step 3: Add the row classes**

Update `client/components/item.vue` so the root `<li>` uses an object binding that preserves `item.classes` and adds `lpQtyZero` when `parseFloat(displayQty) <= 0` or `categoryItem.qty <= 0`.

Update `server/views.js` so `renderCategory()` appends `lpQtyZero` when `categoryItem.qty <= 0`.

Update `templates/t_itemShare.mustache` to render the passed class string unchanged on the root `.lpItem`.

- [x] **Step 4: Style the zero-quantity state**

In `client/css/_list.scss` and `client/css/_share.scss`, add a `.lpItem.lpQtyZero` state that:

- keeps the row fully readable
- reduces foreground contrast
- adds a subtle desaturated background
- keeps link, worn, consumable, and star indicators visible enough to scan

- [x] **Step 5: Re-run the focused test**

Run:

```bash
npm run test:e2e:visual -- --project=chromium --reporter=line
```

Expected: PASS.

- [x] **Step 6: Commit**

```bash
git add client/components/item.vue client/css/_list.scss client/css/_share.scss server/views.js templates/t_itemShare.mustache test/e2e/visual-refresh.spec.ts package.json
git commit -m "feat: gray out zero qty rows"
```

### Task 2: Row Density And Action States

**Files:**
- Modify: `client/css/_list.scss`
- Modify: `client/css/_share.scss`

- [x] **Step 1: Tighten row rhythm**

Adjust list row spacing, border color, and header/footer contrast in `client/css/_list.scss` so category tables read more like dense gear tables and less like loose form rows.

- [x] **Step 2: Make item states easier to scan**

Increase visibility of active link, worn, consumable, and star states while keeping inactive icons quiet.

- [x] **Step 3: Mirror the read-only styling**

Apply equivalent density and state styling in `client/css/_share.scss` so public share pages visually match the edit view.

- [x] **Step 4: Run build and focused browser tests**

Run:

```bash
npm run build
npm run test:e2e:critical -- --project=chromium --reporter=line
npm run test:e2e:visual -- --project=chromium --reporter=line
```

Expected: all commands pass.

- [x] **Step 5: Commit**

```bash
git add client/css/_list.scss client/css/_share.scss
git commit -m "update: refine list row styling"
```

### Task 3: Import Preview Readability

**Files:**
- Modify: `client/components/import-csv.vue`

- [x] **Step 1: Restyle the modal summary**

Add badge-like accepted/rejected counts and improve spacing above the preview table.

- [x] **Step 2: Improve preview table scanning**

Make the table header sticky within the modal, align numeric columns consistently, and add subtle row zebra/background treatment.

- [x] **Step 3: Run build and CSV browser tests**

Run:

```bash
npm run build
npm run test:e2e:csv -- --project=chromium --reporter=line
```

Expected: both commands pass.

- [x] **Step 4: Commit**

```bash
git add client/components/import-csv.vue
git commit -m "update: polish csv preview"
```

### Task 4: Final Verification And Documentation

**Files:**
- Modify: `README.md`
- Modify: `docs/superpowers/specs/2026-05-19-lighterpack-roadmap-design.md`

- [x] **Step 1: Add the visual test command**

Document:

```bash
npm run test:e2e:visual -- --project=chromium --reporter=line
```

- [x] **Step 2: Link the plan from the roadmap**

Add:

```markdown
Phase 3 implementation plan: `docs/superpowers/plans/2026-05-20-phase-3-conservative-visual-refresh.md`.
```

- [x] **Step 3: Run final verification**

Run:

```bash
npm run build
npm run test:e2e:critical -- --project=chromium --reporter=line
npm run test:e2e:csv -- --project=chromium --reporter=line
npm run test:e2e:visual -- --project=chromium --reporter=line
```

Expected: all commands pass.

- [x] **Step 4: Commit**

```bash
git add README.md docs/superpowers/specs/2026-05-19-lighterpack-roadmap-design.md
git commit -m "docs: add visual refresh checks"
```

## Self-Review

- Spec coverage: The plan covers quantity `0` de-emphasis, row density, visual states, calmer scanning, import preview readability, and verification on shared lists.
- Placeholder scan: Steps are concrete and include exact files and commands.
- Type consistency: `lpQtyZero` is the single row-state class used in editable and shared views.
