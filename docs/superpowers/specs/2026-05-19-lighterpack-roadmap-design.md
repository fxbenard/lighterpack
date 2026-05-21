# LighterPack 6-Week Reliability Roadmap Design

## Context

LighterPack is a Vue 2, Express, and MongoDB application for managing outdoor gear lists. The current priority is to make it a reliable personal and community tool while protecting existing user lists. Recent work added database-backed auth support, Playwright coverage, and CSV import preservation for links, prices, worn state, and consumable state.

GitHub issue #226 requests that rows with quantity `0` be visually grayed out. That issue is useful, but it is one example of a broader need: improve reliability and readability without changing the core LighterPack mental model.

## Goal

Create a 6-week roadmap that prioritizes user data safety, reliable core workflows, and a conservative visual refresh.

The roadmap should make LighterPack feel trustworthy and usable in 2026 without attempting a full rewrite, a Vue 3 migration, or a database migration during this cycle.

## Guiding Principles

- Protect existing lists first.
- Prefer small, testable changes over broad rewrites.
- Keep the current list/category/item mental model.
- Make failure states visible and recoverable.
- Use tests and fixtures before changing data-sensitive behavior.
- Prepare large migrations, but do not combine them with this stabilization cycle.

## Phase 1: Stabilize Data And Local Development

Duration: weeks 1-2.

Purpose: make the project reproducible and protect existing user libraries.

Scope:

- Document local setup for Node, MongoDB, config, and dev server ports.
- Make login, register, save, reload, and share flows reproducible locally.
- Add or harden Playwright tests for auth, save/load, and public share URLs.
- Add realistic library fixtures for regression testing.
- Add a script or documented procedure to export and backup user library documents.
- Audit current Mongo document shape and identify data migration risks.
- Add a PostgreSQL JSONB migration assessment, but do not perform the migration.

Success criteria:

- A maintainer can start the app locally and run critical tests.
- Existing user library JSON can be loaded, saved, and reloaded without structure loss.
- The project has a documented backup/export path before deeper data work.

## Phase 2: Reliable User Workflows

Duration: weeks 3-4.

Purpose: make the workflows that move or expose user data predictable.

Implementation plan: `docs/superpowers/plans/2026-05-20-phase-2-csv-workflows.md`.

Scope:

- Complete CSV import/export round-trip testing.
- Preserve CSV fields for item name, category, description, quantity, weight, unit, URL, price, worn, and consumable.
- Show import preview counts and clear accepted/rejected row feedback.
- Add fixtures for CSV files with accents, quoted commas, long URLs, zero prices, worn items, and missing optional fields.
- Improve error messages for failed imports and saves.
- Verify public share rendering for lists with links, prices, worn items, and quantity `0`.
- Keep the data model unchanged unless a compatibility bug requires a small fix.

Success criteria:

- CSV import reports exactly what will be imported.
- CSV export then import preserves item count, categories, weights, URLs, prices, worn state, and consumable state.
- User-facing failures explain what happened and how to recover.

## Phase 3: Conservative Visual Refresh

Duration: weeks 5-6.

Purpose: make the existing interface clearer and more modern without changing the product model.

Implementation plan: `docs/superpowers/plans/2026-05-20-phase-3-conservative-visual-refresh.md`.

Scope:

- Improve typography, spacing, contrast, and row density.
- Gray out rows where quantity is `0` as requested in issue #226.
- Improve visual states for link, price, worn, consumable, and starred items.
- Make header controls calmer and easier to scan.
- Improve import preview readability.
- Add desktop and mobile screenshots for dense lists.
- Avoid a full product redesign or a new interaction model.

Success criteria:

- LighterPack still works like LighterPack, but feels cleaner and easier to read.
- Quantity `0` rows are visually de-emphasized without hiding data.
- Visual changes do not modify user data or persistence behavior.

## Technical Modernization

Modernization is important, but it should be prepared rather than executed during this roadmap.

### Vue 3

Vue 3 migration is likely necessary in a later project because Vue 2 and the current build stack are aging. It should not be included in this 6-week roadmap because it adds framework migration risk while the main objective is user data reliability.

During this roadmap:

- Avoid adding new Vue 2-specific patterns where possible.
- Document fragile components and store interactions.
- Increase e2e coverage before any future framework migration.
- Phase 5 implementation plan: `docs/superpowers/plans/2026-05-20-phase-5-vue3-readiness.md`.
- Phase 6 implementation plan: `docs/superpowers/plans/2026-05-21-phase-6-pre-migration-ui-isolation.md`.
- Phase 8 migration-prep plan: `docs/superpowers/plans/2026-05-21-phase-8-runtime-migration-prep.md`.

### MongoDB To PostgreSQL JSONB

MongoDB remains in place during this roadmap. PostgreSQL with JSONB is the recommended future replacement because it can preserve the current document-shaped `library` model while improving operational reliability, backups, and migration tooling.

During this roadmap:

- Audit the current Mongo library document shape.
- Define backup/export requirements.
- Identify a PostgreSQL JSONB target schema.
- Define non-regression checks for a future migration.
- Phase 4 implementation plan: `docs/superpowers/plans/2026-05-20-phase-4-mongo-access-layer.md`.

The actual database migration should be a separate project after this roadmap.

## Out Of Scope

- Full Vue 3 migration.
- Full MongoDB replacement.
- Complete product redesign.
- New account model or social features.
- Full backend rewrite.
- Replacing the existing list/category/item data model.

## Current Status

Completed work on the stabilization branch has moved beyond the original roadmap baseline:

- Phases 1-3 are implemented: local setup is reproducible, critical auth/save/share flows are covered, CSV import/export is hardened, and the conservative visual refresh is in place.
- Phase 4 is implemented: the shared Mongo access layer replaced remaining `mongojs` usage in the app and supporting scripts.
- Phases 5-6 are implemented: the client was decoupled from global runtime helpers, modal/event wiring was isolated into services, and pre-migration UI dependencies were reduced.
- Phase 7 is effectively complete: browser storage, user feedback, and application-level events now flow through explicit services instead of ad hoc browser globals or a generic event bus.
- Phase 8 migration prep is substantially complete: the runtime now uses Vue 3, Vue Router 4, Vuex 4, `vue-loader` 17, and `@vue/compiler-sfc`, with focused Playwright gates passing on the migrated flows.

Remaining technical risk is concentrated in legacy toolchain warnings rather than product behavior regressions. That follow-up is tracked separately in `docs/superpowers/tickets/2026-05-21-dependency-runtime-warnings.md`.

## Risks

- Visual work could accidentally change data behavior if mixed with store changes.
- CSV compatibility can regress if only the happy path is tested.
- Local development instability can hide real application bugs.
- Database migration planning may expand beyond the roadmap if not kept as an audit.

## Open Follow-Up Work

- Create a detailed implementation plan for Phase 1.
- Decide whether each phase should be its own GitHub milestone.
- Decide whether issue #226 should be implemented in Phase 3 or pulled earlier as a quick win after tests exist.
