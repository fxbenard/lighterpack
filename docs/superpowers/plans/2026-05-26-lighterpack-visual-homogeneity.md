# LighterPack Visual Homogeneity Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make LighterPack+ visually coherent across the historical editor and secondary surfaces while preserving the familiar LighterPack workflow.

**Architecture:** Use existing SCSS and Vue component patterns. First define shared theme, density, button, field, and icon rules in global styles, then apply them to editor surfaces, then to modal/popover/settings surfaces. Avoid store, persistence, and data model changes.

**Tech Stack:** Vue 3 Options API, SCSS, Webpack, Vuex, Playwright.

---

## File Structure

- Modify `client/css/_globals.scss`: source of design tokens for colors, radii, density, control sizes, shadows, and functional color roles.
- Modify `client/css/_common.scss`: shared base styles for buttons, links, fields, warnings, icon buttons, focus states, and utility classes.
- Modify `client/css/_list.scss`: historical editor list/category/item row visual treatment.
- Modify `client/components/sidebar.vue`: sidebar section rhythm, Gear Room entry, theme toggle, and modern icon-ready controls.
- Modify `client/components/library-lists.vue`: list sidebar actions and list item controls.
- Modify `client/components/library-items.vue`: gear sidebar search, chips, create button, and library item rows.
- Modify `client/components/category.vue`: category footer/add action markup only if needed for shared classes.
- Modify `client/components/item.vue`: item action hit areas only if needed; preserve sprite semantics.
- Modify `client/components/modal.vue`: shared modal surface, radius, titles, fields, and actions.
- Modify `client/components/popover.vue`: compact secondary surface rules.
- Modify `client/components/list-settings.vue`, `client/components/share.vue`, `client/components/account-dropdown.vue`: popover content styling and control classes.
- Modify `client/components/item-detail.vue`, `client/components/gear-picker.vue`, `client/components/import-csv.vue`: larger secondary surfaces after editor foundations are stable.
- Modify simple modal components only as needed: `client/components/item-link.vue`, `client/components/item-image.vue`, `client/components/copy-list.vue`, `client/components/speedbump.vue`, `client/components/account.vue`, `client/components/profile-settings.vue`, `client/components/creator-links.vue`.
- Test with `npm run build`, `npm run test:e2e:visual`, and targeted Playwright critical tests when markup changes could affect flows.

Do not modify `client/store/store.js`, server routes, templates, CSV logic, or persistence files for this visual pass.

---

### Task 1: Baseline Visual Inventory

**Files:**
- Read: `docs/superpowers/specs/2026-05-26-lighterpack-visual-homogeneity-design.md`
- Read: `client/css/_globals.scss`
- Read: `client/css/_common.scss`
- Read: `client/css/_list.scss`
- Read: `client/components/sidebar.vue`
- Read: `client/components/modal.vue`
- Read: `client/components/popover.vue`

- [ ] **Step 1: Confirm working tree scope**

Run:

```bash
git status --short
```

Expected: existing unrelated staged and unstaged changes may be present. Do not reset or unstage user work. Track only files touched by this plan.

- [ ] **Step 2: Inventory hardcoded visual values**

Run:

```bash
rg "#[0-9a-fA-F]{3,8}|rgba?\(|border-radius|box-shadow|font-size|padding:" client/css client/components -n
```

Expected: output highlights local color, radius, shadow, size, and spacing rules. Use it to decide which local styles must be replaced by shared variables.

- [ ] **Step 3: Inventory button and icon surfaces**

Run:

```bash
rg "lpButton|lpAdd|lpCopy|lpRemove|lpSprite|button|<i" client/components client/css -n
```

Expected: output identifies current button and icon classes. Keep item-row sprite semantics during pass 1.

- [ ] **Step 4: Commit nothing**

No code is changed in this task. Record observations in the task notes or implementation summary.

---

### Task 2: Define Shared Visual Tokens

**Files:**
- Modify: `client/css/_globals.scss`

- [ ] **Step 1: Add functional color and control tokens**

Add CSS custom properties to both `:root`, `[data-theme="dark"]`, and the auto dark media block. Keep existing variables and add missing roles:

```scss
--color-link: #1B77D3;
--color-link-hover: #145EA8;
--color-warning: #EFA026;
--color-warning-rgb: 239, 160, 38;
--color-danger: #CE1836;
--color-danger-rgb: 206, 24, 54;
--color-danger-hover: #A9132B;
--color-control: rgba(255, 255, 255, 0.86);
--color-control-hover: rgba(255, 255, 255, 0.96);
--color-control-muted: rgba(15, 23, 42, 0.04);
--shadow-soft: 0 1px 3px rgba(var(--color-shadow-rgb), 0.08);
--shadow-popover: 0 12px 28px rgba(var(--color-shadow-rgb), 0.16);
--shadow-modal: 0 24px 56px rgba(var(--color-shadow-rgb), 0.24);
```

For dark mode, use:

```scss
--color-link: #6AAFEF;
--color-link-hover: #9BCBFF;
--color-warning: #F2B84B;
--color-warning-rgb: 242, 184, 75;
--color-danger: #EF5B73;
--color-danger-rgb: 239, 91, 115;
--color-danger-hover: #FF7A8D;
--color-control: rgba(35, 35, 38, 0.92);
--color-control-hover: rgba(45, 45, 49, 0.96);
--color-control-muted: rgba(255, 255, 255, 0.05);
--shadow-soft: 0 1px 3px rgba(var(--color-shadow-rgb), 0.28);
--shadow-popover: 0 14px 32px rgba(var(--color-shadow-rgb), 0.4);
--shadow-modal: 0 26px 64px rgba(var(--color-shadow-rgb), 0.48);
```

- [ ] **Step 2: Add SCSS wrappers**

Add wrappers below the existing `$color-*` wrappers:

```scss
$color-link: var(--color-link);
$color-link-hover: var(--color-link-hover);
$color-warning: var(--color-warning);
$color-danger: var(--color-danger);
$color-danger-hover: var(--color-danger-hover);
$color-control: var(--color-control);
$color-control-hover: var(--color-control-hover);
$color-control-muted: var(--color-control-muted);
$shadow-soft: var(--shadow-soft);
$shadow-popover: var(--shadow-popover);
$shadow-modal: var(--shadow-modal);
```

Change the existing `$color-danger: $red1;` wrapper to the CSS custom property:

```scss
$color-danger: var(--color-danger);
```

- [ ] **Step 3: Add density and control size tokens**

Add these SCSS tokens near the existing radius and row tokens:

```scss
$control-height-sm: 32px;
$control-height-md: 38px;
$control-height-lg: 44px;
$icon-size-sm: 14px;
$icon-size-md: 16px;
$icon-hit-size: 32px;
$row-height-min: 46px;
```

If `$row-height-min` already exists, update its value from `44px` to `46px`.

- [ ] **Step 4: Build**

Run:

```bash
npm run build
```

Expected: webpack compilation succeeds.

- [ ] **Step 5: Commit**

Run:

```bash
git add client/css/_globals.scss
git commit -m "style: define visual system tokens"
```

Expected: commit contains only `_globals.scss`.

---

### Task 3: Normalize Shared Controls

**Files:**
- Modify: `client/css/_common.scss`

- [ ] **Step 1: Normalize links and add shared focus helper**

Update `.lpHref` to use the link tokens:

```scss
.lpHref {
    color: $color-link;
    cursor: pointer;
    text-decoration: none;

    &:hover {
        color: $color-link-hover;
        text-decoration: underline;
    }
}
```

Add a shared focus mixin near the top of the file after `@import "globals";`:

```scss
@mixin lpFocusRing($color: var(--color-accent-rgb)) {
    box-shadow: 0 0 0 3px rgba($color, 0.18);
    outline: none;
}
```

- [ ] **Step 2: Replace `.lpButton` with shared variants**

Update `.lp .lpButton` so it uses stable heights and variants:

```scss
.lp .lpButton {
    align-items: center;
    background: $color-accent;
    border: 1px solid transparent;
    border-radius: $radius-md;
    box-shadow: $shadow-soft;
    color: #fff;
    cursor: pointer;
    display: inline-flex;
    font-family: $font-family-base;
    font-size: $fontSize-base;
    font-weight: $fontWeight-bold;
    gap: 6px;
    justify-content: center;
    line-height: 1.2;
    min-height: $control-height-lg;
    padding: 0 18px;
    position: relative;
    text-align: center;
    text-decoration: none;
    transition:
        background $transitionDurationFast,
        border-color $transitionDurationFast,
        box-shadow $transitionDurationFast,
        color $transitionDurationFast;
    width: auto;

    &.lpSmall,
    &.lpButtonSm {
        font-size: $fontSize-sm;
        min-height: $control-height-sm;
        padding: 0 12px;
    }

    &.lpButtonSecondary {
        background: $color-control;
        border-color: $color-border;
        box-shadow: none;
        color: $color-text;
    }

    &.lpButtonGhost {
        background: transparent;
        border-color: transparent;
        box-shadow: none;
        color: $color-text-muted;
    }

    &.lpButtonDanger {
        background: $color-danger;
        color: #fff;
    }

    &:hover:not(:disabled):not(.lpButtonDisabled) {
        background: $color-accent-hover;
        box-shadow: $shadow-soft;
    }

    &.lpButtonSecondary:hover:not(:disabled):not(.lpButtonDisabled),
    &.lpButtonGhost:hover:not(:disabled):not(.lpButtonDisabled) {
        background: $color-control-hover;
        border-color: $color-accent;
        box-shadow: none;
        color: $color-accent;
    }

    &.lpButtonDanger:hover:not(:disabled):not(.lpButtonDisabled) {
        background: $color-danger-hover;
        color: #fff;
    }

    &:focus:not(:active) {
        @include lpFocusRing();
    }

    &::-moz-focus-inner {
        border: none;
    }

    &:disabled,
    &.lpButtonDisabled {
        cursor: default;
        opacity: 0.5;
    }
}
```

- [ ] **Step 3: Add icon button and field utilities**

Add after `.lp .lpButton`:

```scss
.lpIconButton {
    align-items: center;
    background: transparent;
    border: 1px solid transparent;
    border-radius: $radius-md;
    color: $color-text-muted;
    cursor: pointer;
    display: inline-flex;
    height: $icon-hit-size;
    justify-content: center;
    padding: 0;
    transition:
        background $transitionDurationFast,
        border-color $transitionDurationFast,
        color $transitionDurationFast,
        opacity $transitionDurationFast;
    width: $icon-hit-size;

    &:hover {
        background: $color-control-muted;
        color: $color-text;
    }

    &:focus:not(:active) {
        @include lpFocusRing();
    }

    svg,
    i {
        flex: 0 0 auto;
        height: $icon-size-md;
        width: $icon-size-md;
    }
}

.lpControl {
    background: $color-control;
    border: 1px solid $color-border;
    border-radius: $radius-md;
    color: $color-text;
    min-height: $control-height-md;
    padding: 0 10px;

    &:focus {
        border-color: $color-accent;
        @include lpFocusRing();
    }
}
```

- [ ] **Step 4: Theme warnings and old table borders**

Update `.lpWarning` to use warning tokens:

```scss
.lpWarning {
    background: rgba(var(--color-warning-rgb), 0.12);
    border: 1px solid rgba(var(--color-warning-rgb), 0.32);
    border-radius: $radius-md;
    color: $color-text;
    padding: 10px 12px;
}
```

Change `.lpRow .lpHeader .lpCell`, `.lpFooter .lpCell`, and `.lpCell` borders from `#aaa` to `$color-border`.

- [ ] **Step 5: Build and commit**

Run:

```bash
npm run build
git add client/css/_common.scss
git commit -m "style: normalize shared controls"
```

Expected: build passes and commit contains only `_common.scss`.

---

### Task 4: Refresh Historical Editor Rows

**Files:**
- Modify: `client/css/_list.scss`
- Modify only if needed: `client/components/item.vue`
- Modify only if needed: `client/components/category.vue`

- [ ] **Step 1: Normalize category and row surfaces**

In `_list.scss`, update `.lpCategory` shadow and drop states:

```scss
.lpCategory {
    background: $color-surface;
    border: 1px solid $color-border;
    border-radius: $radius-md;
    box-shadow: $shadow-soft;
    list-style: none;
    margin: 0 0 14px;
    overflow: visible;

    &.dropAccept {
        background: $color-highlight;
    }

    &.dropHover {
        background: rgba(var(--color-accent-rgb), 0.14);
    }

    &.gu-mirror {
        background: $color-bg;
        border: 1px solid $color-border;
        box-shadow: $shadow-popover;
    }
}
```

- [ ] **Step 2: Stabilize row rhythm**

Update row block:

```scss
.lpItem,
.lpItemsHeader,
.lpItemsFooter {
    align-items: center;
    border-top: 1px solid $color-border;
    display: flex;
    flex-direction: row;
    justify-content: stretch;
    min-height: $row-height-min;
    padding: 0 12px;
}

.lpItemsHeader {
    background: $color-control-muted;
    border-bottom: 1px solid $color-border;
    border-top: none;
    color: $color-text;
    min-height: 40px;
}

.lpItemsFooter {
    background: $color-control-muted;
    border-top: 1px solid $color-border;
    justify-content: flex-end;
    min-height: 42px;
    overflow: visible;
}
```

- [ ] **Step 3: Improve item action hit areas without replacing sprites**

Replace the `.lpActionsCell` icon rules with:

```scss
.lpActionsCell {
    align-items: center;
    display: flex;
    gap: 2px;

    .lpWorn,
    .lpConsumable,
    .lpCamera,
    .lpLink,
    .lpTag,
    .lpStar {
        align-items: center;
        border-radius: $radius-sm;
        cursor: pointer;
        display: inline-flex;
        height: $icon-hit-size;
        justify-content: center;
        margin-right: 0;
        opacity: 0.32;
        transition:
            background $transitionDurationFast ease,
            opacity $transitionDurationFast ease,
            transform $transitionDurationFast ease;
        visibility: hidden;
        width: $icon-hit-size;

        &:hover {
            background: $color-control-muted;
            opacity: 1;
            transform: translateY(-1px);
        }

        &.lpActive,
        &.lpStar1,
        &.lpStar2,
        &.lpStar3 {
            opacity: 1;
            visibility: visible;
        }
    }
}
```

Keep the existing active selector below it, but include `.lpTag.lpActive` if it is missing.

- [ ] **Step 4: Check item markup only if sprite alignment breaks**

If sprites become misaligned because `.lpSprite` has fixed dimensions, adjust only the CSS around `.lpActionsCell i`. Do not replace the `<i>` elements in `client/components/item.vue` during this task.

- [ ] **Step 5: Build and run visual e2e**

Run:

```bash
npm run build
npm run test:e2e:visual
```

Expected: build passes. Visual e2e passes or reports only expected screenshot updates caused by the visual refresh.

- [ ] **Step 6: Commit**

Run:

```bash
git add client/css/_list.scss client/components/item.vue client/components/category.vue
git commit -m "style: refresh editor row surfaces"
```

Expected: commit excludes `item.vue` and `category.vue` if no markup changes were needed.

---

### Task 5: Align Sidebar And Gear Library Controls

**Files:**
- Modify: `client/components/sidebar.vue`
- Modify: `client/components/library-lists.vue`
- Modify: `client/components/library-items.vue`

- [ ] **Step 1: Update sidebar button classes**

In `sidebar.vue`, change the Gear Room button to use shared button classes:

```vue
<button class="lpButton lpSmall lpButtonSecondary lpGearRoomBtn" @click="gearRoomOpen = true">
    Gear Room
</button>
```

Change the theme toggle to:

```vue
<button class="lpButton lpSmall lpButtonGhost lpThemeToggle" @click="cycleTheme">
    <span aria-hidden="true">{{ themeIcon }}</span>
    <span>{{ themeLabel }}</span>
</button>
```

Keep the existing text icons for this task. Modern SVG replacement can happen later.

- [ ] **Step 2: Simplify sidebar local button CSS**

In `sidebar.vue`, remove local background, border, radius, font, padding, and hover definitions from `.lpGearRoomBtn` and `.lpThemeToggle` that duplicate shared button rules. Keep only layout-specific rules:

```scss
.lpGearRoomBtn {
    white-space: nowrap;
}

.lpThemeToggle {
    justify-content: flex-start;
    margin-top: auto;
    width: 100%;
}
```

- [ ] **Step 3: Align list and gear sidebar actions**

In `library-lists.vue` and `library-items.vue`, replace local create/action button styling with existing shared classes where markup has buttons. Example target for create buttons:

```vue
<button class="lpButton lpSmall lpButtonSecondary libraryCreateButton" @click="createLibraryItem">
    New gear item
</button>
```

If a component uses `<a class="lpAdd">`, keep it unless changing it would alter popover trigger behavior.

- [ ] **Step 4: Build and commit**

Run:

```bash
npm run build
git add client/components/sidebar.vue client/components/library-lists.vue client/components/library-items.vue
git commit -m "style: align sidebar controls"
```

Expected: build passes and sidebar controls use shared button rules.

---

### Task 6: Reconcile Modal And Popover Surfaces

**Files:**
- Modify: `client/components/modal.vue`
- Modify: `client/components/popover.vue`

- [ ] **Step 1: Reduce modal radius and hero styling**

In `modal.vue`, update `.lpModal` to use the shared modal shadow and restrained radius:

```scss
.lpModal {
    background: $color-surface-elevated;
    border: 1px solid $color-border;
    border-radius: $radius-lg;
    box-shadow: $shadow-modal;
    left: 50%;
    max-height: calc(100dvh - 48px);
    overflow-y: auto;
    padding: 24px;
    position: fixed;
    text-align: left;
    top: 50%;
    transform: translateX(-50%) translateY(-50%);
    transition:
        opacity $transitionDuration ease,
        transform $transitionDuration ease;
    width: min(560px, calc(100vw - 32px));
    z-index: $dialog;
}
```

Remove the `.lpModal::before` accent bar unless a specific modal needs a status marker.

- [ ] **Step 2: Compact modal headings and fields**

In `modal.vue`, set headings and fields to tool-surface sizing:

```scss
.lpModal h2 {
    font-size: 22px;
    font-weight: $fontWeight-bold;
    letter-spacing: 0;
    line-height: 1.2;
    margin: 0 0 18px;
    max-width: none;
}

.lpModal input[type=text],
.lpModal input[type=email],
.lpModal input[type=password],
.lpModal select,
.lpModal textarea {
    background: $color-control;
    border: 1px solid $color-border;
    border-radius: $radius-md;
    color: $color-text;
    min-height: $control-height-lg;
    padding: 10px 12px;
    width: 100%;
}
```

Keep focus styling but use `rgba(var(--color-accent-rgb), 0.18)`.

- [ ] **Step 3: Align popover surface**

In `popover.vue`, update the popover panel to use:

```scss
background: $color-surface-elevated;
border: 1px solid $color-border;
border-radius: $radius-md;
box-shadow: $shadow-popover;
color: $color-text;
```

Ensure popover content spacing remains compact. Do not add card wrappers inside popovers.

- [ ] **Step 4: Build and commit**

Run:

```bash
npm run build
git add client/components/modal.vue client/components/popover.vue
git commit -m "style: reconcile modal and popover surfaces"
```

Expected: build passes. Modals and popovers look closer to the editor instead of a separate visual style.

---

### Task 7: Apply Shared Controls To Secondary Surfaces

**Files:**
- Modify: `client/components/list-settings.vue`
- Modify: `client/components/share.vue`
- Modify: `client/components/account-dropdown.vue`
- Modify: `client/components/item-detail.vue`
- Modify: `client/components/gear-picker.vue`
- Modify: `client/components/import-csv.vue`
- Modify: `client/components/item-link.vue`
- Modify: `client/components/item-image.vue`
- Modify: `client/components/copy-list.vue`
- Modify: `client/components/speedbump.vue`
- Modify: `client/components/account.vue`
- Modify: `client/components/profile-settings.vue`
- Modify: `client/components/creator-links.vue`

- [ ] **Step 1: Replace local button variants**

For each secondary component, map buttons to shared classes:

```vue
class="lpButton"
class="lpButton lpButtonSecondary"
class="lpButton lpButtonGhost"
class="lpButton lpButtonDanger"
class="lpButton lpSmall"
```

Examples:

```vue
<button class="lpButton lpButtonSecondary" @click="shown = false">
    Cancel
</button>
```

```vue
<button class="lpButton lpButtonDanger" @click="removeItemImage">
    Remove image
</button>
```

- [ ] **Step 2: Replace local field styling with `.lpControl` where safe**

For text inputs inside secondary surfaces that do not already inherit modal field styling, add `class="lpControl"`:

```vue
<input class="lpControl" type="text" :value="profile.displayName" @input="update('displayName', $event.target.value)">
```

Do not add `.lpControl` to silent inline editor fields in item rows.

- [ ] **Step 3: Convert import CSV status colors**

In `import-csv.vue`, replace hardcoded beige/red/yellow review colors with:

```scss
background: rgba(var(--color-warning-rgb), 0.12);
border-color: rgba(var(--color-warning-rgb), 0.32);
color: $color-text;
```

For destructive/error states use:

```scss
background: rgba(var(--color-danger-rgb), 0.1);
border-color: rgba(var(--color-danger-rgb), 0.24);
color: $color-danger;
```

- [ ] **Step 4: Keep behavior unchanged**

Do not change method names, emitted events, store commits, form submit handlers, import review logic, or item-detail data flow in this task.

- [ ] **Step 5: Build and run critical tests**

Run:

```bash
npm run build
npm run test:e2e:critical
npm run test:e2e:csv
```

Expected: build and critical tests pass. If a test fails because a selector depended on exact text or class names, update the test only after confirming the UI behavior is unchanged.

- [ ] **Step 6: Commit**

Run:

```bash
git add client/components/list-settings.vue client/components/share.vue client/components/account-dropdown.vue client/components/item-detail.vue client/components/gear-picker.vue client/components/import-csv.vue client/components/item-link.vue client/components/item-image.vue client/components/copy-list.vue client/components/speedbump.vue client/components/account.vue client/components/profile-settings.vue client/components/creator-links.vue
git commit -m "style: align secondary surfaces"
```

Expected: commit contains visual class/style changes only.

---

### Task 8: Visual QA And Final Polish

**Files:**
- Modify only files already changed by Tasks 2-7.

- [ ] **Step 1: Start dev server**

Run:

```bash
PORT=3201 DEV_SERVER_PORT=8280 npm run dev
```

Expected: local app starts on `http://localhost:3201`. If the port is busy, use the next available port and record it in the summary.

- [ ] **Step 2: Inspect required states**

Use the browser to inspect:

- Desktop editor with sidebar open.
- Item rows with normal, active link/photo/meta/star, worn, consumable, and quantity zero states.
- Gear Room modal.
- Settings popover.
- Share popover.
- Item detail view and edit mode.
- Import CSV review surface.
- Account/profile settings surfaces.
- Mobile width around 390px.
- Light, dark, and auto theme where practical.

- [ ] **Step 3: Fix visual regressions only**

Allowed fixes:

- text overflow;
- overlapping controls;
- inconsistent button height;
- unreadable contrast;
- hardcoded light surface in dark mode;
- icon hit area that changes layout;
- modal or popover that feels visually disconnected from the editor.

Not allowed in this task:

- new product features;
- store mutations;
- backend changes;
- data model changes.

- [ ] **Step 4: Final verification**

Run:

```bash
npm run build
npm run test:e2e:visual
```

Expected: build passes. Visual tests pass or produce reviewed screenshot deltas.

- [ ] **Step 5: Commit final polish**

Run:

```bash
git add client/css/_globals.scss client/css/_common.scss client/css/_list.scss client/components/sidebar.vue client/components/library-lists.vue client/components/library-items.vue client/components/category.vue client/components/item.vue client/components/modal.vue client/components/popover.vue client/components/list-settings.vue client/components/share.vue client/components/account-dropdown.vue client/components/item-detail.vue client/components/gear-picker.vue client/components/import-csv.vue client/components/item-link.vue client/components/item-image.vue client/components/copy-list.vue client/components/speedbump.vue client/components/account.vue client/components/profile-settings.vue client/components/creator-links.vue
git commit -m "style: polish visual homogeneity"
```

Expected: commit contains only final visual fixes from QA.

---

## Self-Review

Spec coverage:

- Conservative modernization is covered by Tasks 2-8.
- Editor-first sequencing is covered by Tasks 4-5 before Tasks 6-7.
- Secondary surface propagation is covered by Tasks 6-7.
- Palette, density, buttons, fields, icons, surfaces, and dark mode are covered by Tasks 2-7.
- Validation is covered by Tasks 4, 7, and 8.

Placeholder scan:

- No unfinished markers or unspecified implementation steps are intentionally left in this plan.

Risk controls:

- Tasks explicitly exclude store, persistence, CSV behavior, and backend changes.
- Item-row sprites are kept during pass 1 to protect recognition.
- Visual QA is separate from implementation tasks so final fixes remain scoped.
