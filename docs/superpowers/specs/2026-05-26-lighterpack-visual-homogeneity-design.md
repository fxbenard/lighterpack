# LighterPack Visual Homogeneity Design

## Context

LighterPack is being modernized into LighterPack+ while keeping the original product model: fast gear lists, category totals, dense item rows, shared links, and a familiar spreadsheet-like editing flow. Recent work added LighterPack+ profile and public sharing surfaces, shared gear room workflows, richer item detail views, refreshed modals, and dark mode variables.

The current visual risk is inconsistency. Some surfaces still look like historical LighterPack, while newer surfaces use larger cards, softer modals, custom local colors, and different button or icon treatments. The goal is not a full redesign. The goal is to make the existing app feel coherent, modern, and trustworthy without losing users who already know how LighterPack works.

## Competitive Reference

Current backpacking gear tools show the market expectation:

- Packstack emphasizes gear inventory, lifecycle tracking, pack list building, sharing, and weight analysis.
- Hikt emphasizes gear closet, mobile sync, collaborative lists, analytics, and smart insights.
- PackWizard emphasizes fast gear list creation, public lists, gear database lookup, and retailer pricing.

LighterPack+ should not copy their dashboard-heavy or SaaS-like presentation. Its differentiator remains speed, density, openness, and familiarity. The visual direction should make LighterPack feel like a clean 2026 version of itself.

## Goal

Create a conservative, coherent visual system for LighterPack+ and apply it in two passes:

1. Stabilize the historical editor surface first.
2. Propagate the same visual grammar to secondary surfaces.

The result should preserve existing workflows while making buttons, fields, spacing, icon sizes, themes, and interaction states consistent across the application.

## Non-Goals

- Do not turn the editor into a card-based SaaS dashboard.
- Do not replace the core list/category/item mental model.
- Do not redesign chart behavior.
- Do not introduce a complete component library in this pass.
- Do not replace every historical sprite icon at once.
- Do not change persistence, list totals, CSV behavior, or public sharing semantics as part of visual work.

## Design Direction

The selected direction is a conservative modernization.

Principles:

- Keep LighterPack immediately recognizable.
- Preserve dense utility and fast scanning.
- Make spacing slightly more breathable without reducing the product to large cards.
- Use a disciplined color system instead of local decorative colors.
- Move toward modern icons progressively.
- Make light and dark mode equal citizens.
- Let the editor define the visual language; secondary surfaces must follow it.

The intended feel is: light by default, practical, calm, precise, and outdoor-aware without becoming rustic or decorative.

## Density

Use a comfortable-compact density.

Targets:

- Item rows: approximately 44-48px minimum height.
- Category headers: compact but with clearer vertical rhythm than the legacy table styling.
- Icon hit areas: at least 32px where layout allows.
- Buttons: stable heights by size rather than ad hoc padding.
- Popovers: compact menus, not mini landing pages.
- Modals: readable tool surfaces, not hero-style marketing panels.

This pass should not add a user-facing density toggle. The token choices should leave room for a future compact/comfortable toggle if it becomes necessary.

## Color System

Use a hybrid disciplined palette.

Functional roles:

- Green: primary action, selected state, active state, LighterPack+ identity.
- Blue: links, sharing, informational actions.
- Orange: warning, import/review attention, non-destructive caution.
- Red: destructive action, validation error, irreversible danger.
- Neutral surfaces: editor background, category panels, row separators, fields, popovers, and modals.

Rules:

- Prefer CSS custom properties for theme-aware colors.
- Avoid hardcoded whites, blacks, and shadows inside components.
- Avoid using accent color as decoration when it does not communicate state or function.
- Keep dark mode contrast and hierarchy equivalent to light mode.

## Typography

Keep the existing system font stack for compatibility and performance.

Rules:

- No viewport-scaled font sizes inside tool surfaces.
- No negative letter spacing in compact UI.
- Headings inside modals, popovers, sidebar panels, and editor sections should be appropriately compact.
- Uppercase labels may remain for category names and small field labels, but spacing must be consistent.
- Numeric values should continue using tabular number behavior where totals, weights, prices, and quantities need alignment.

## Radius And Surfaces

Use restrained radii.

Targets:

- Small controls and chips: 4px.
- Buttons and fields: 6-8px.
- Category surfaces and compact panels: 8px.
- Modals and larger tool panels: up to 12px.

The current 24px modal radius is too far from the historical editor and should be reduced during the secondary-surface pass.

Rules:

- Do not nest cards inside cards.
- Category blocks can have a bordered surface, but should not become decorative cards.
- Modals and popovers should share surface, border, shadow, and focus rules with the rest of the app.

## Buttons

Define shared button variants before broad visual changes.

Variants:

- Primary: green filled button for the main affirmative action.
- Secondary: neutral surface or outline for alternate actions.
- Ghost: toolbar, menu, and subtle contextual actions.
- Danger: red destructive action, usually not the visual default.
- Icon button: square hit area for modern SVG actions.

Rules:

- Same variant means same size, radius, focus ring, hover, disabled, and active behavior.
- Avoid button classes that differ only because they were implemented in different components.
- Inputs and buttons in the same row should share height.
- Existing `lpButton` can remain as the compatibility class, but it should map to the shared button rules.

## Icons

Use progressive modern icon adoption.

Rules:

- Historical item-row sprites may remain temporarily to protect user recognition.
- New surfaces and new actions should use modern SVG icons.
- Replaced icons must preserve meaning: link remains link, photo remains photo, star remains star, worn and consumable stay visually distinct.
- Standard icon size: 16px.
- Important toolbar/action icons may use 20px only when the surrounding hit area remains stable.
- Icon buttons should provide a stable 32px hit area where layout permits.

This avoids a disruptive full icon replacement while preventing new surfaces from extending the sprite-era visual language.

## Pass 1: Historical Editor

The first implementation pass applies the foundation to the editor before secondary surfaces.

Surfaces:

- Main list editor.
- Category blocks.
- Item rows.
- Category headers and footers.
- Sidebar list and gear sections.
- Add new list/category/item actions.
- Gear Room entry.
- Item quick actions: photo, link, meta, worn, consumable, star, remove.
- Totals and list summary where needed.

Expected changes:

- Stabilize row height, column rhythm, and responsive constraints.
- Normalize hover, active, disabled, and focus states.
- Improve icon hit areas and contrast.
- Make category surfaces cleaner without changing the category/item model.
- Align sidebar buttons and links with editor button rules.
- Preserve visibility and meaning of quantity zero, worn, consumable, star, link, photo, and remove states.
- Avoid changing drag/drop semantics or list calculation behavior.

Out of scope for pass 1:

- Full mobile redesign.
- Full chart redesign.
- Replacing every sprite.
- Public profile/list polish.
- Modal redesign beyond fixes required by editor consistency.

## Pass 2: Secondary Surfaces

After the editor sets the visual language, apply the same system to supporting surfaces.

Surfaces:

- `modal.vue`.
- `popover.vue` and hover popovers.
- `list-settings`.
- `share`.
- `account-dropdown`.
- `item-detail`.
- `gear-picker`.
- `import-csv`.
- `account`.
- `profile-settings`.
- `creator-links`.
- Simple modals: item link, item image, copy list, speedbump.

Expected changes:

- Reduce oversized modal styling and align with editor density.
- Normalize modal and popover surface, border, radius, shadow, title, body, and action rules.
- Replace local button and field treatments with shared variants.
- Remove hardcoded local colors where theme variables can express the role.
- Use modern SVG icons for newer actions and menu controls.
- Make import/review states use the functional orange/red/neutral palette.
- Ensure dark mode works without special-case component patches.

Secondary surfaces should not appear more designed than the editor. If a modal looks visually richer but less coherent with the list editor, the modal should be simplified.

## Implementation Strategy

Use approach B: design tokens plus targeted passes.

Suggested sequence:

1. Audit existing style duplication and hardcoded colors in editor-related files.
2. Expand or refine theme variables in `client/css/_globals.scss`.
3. Normalize shared button, field, focus, and icon sizing rules in common styles.
4. Apply pass 1 to editor and sidebar surfaces.
5. Run build and visual QA.
6. Apply pass 2 to modals, popovers, and settings surfaces.
7. Run build, targeted tests, and visual QA across light and dark themes.

Keep edits scoped. Avoid mixing visual normalization with store behavior, data model work, or new product features.

## Validation

Build/code validation:

- Run `npm run build`.
- Run targeted lint only when the touched files are appropriate for the existing lint setup.
- Run critical Playwright coverage if markup or interaction behavior changes in tested flows.

Visual QA:

- Desktop with sidebar open.
- Desktop with modals and popovers open.
- Mobile/tablet for overlap and overflow checks.
- Light theme.
- Dark theme.
- Auto theme where practical.

Design checklist:

- Buttons of the same role look and behave the same.
- Fields use the same height, border, focus, and disabled rules.
- Icons use consistent size and hit area.
- Green, blue, orange, and red map to function, not decoration.
- Text fits within buttons, rows, and panels.
- No nested cards.
- No hardcoded light-only surfaces in dark mode.
- Existing LighterPack editor workflows remain recognizable.

## Risks

- A visual pass can accidentally alter behavior if markup is changed too aggressively.
- Replacing sprites too quickly can reduce recognition for existing users.
- Increasing density too much can harm scan speed; increasing spacing too much can harm existing power users.
- Secondary surfaces can drift if they keep local style definitions.
- Dark mode regressions are likely if local colors remain in Vue component styles.

## Success Criteria

- Existing users still recognize and can use the editor without relearning the product.
- The app feels cleaner, calmer, and more modern across the main editor and secondary surfaces.
- Buttons, fields, icons, focus states, hover states, and color roles are consistent.
- Light and dark themes both feel intentional.
- The visual system is documented enough for future LighterPack+ features to follow it without inventing local styles.
