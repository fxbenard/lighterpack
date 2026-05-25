# Smart Gear Library — Design Spec
_2026-05-24_

## Context

LighterPack users accumulate duplicate items across lists — the same sleeping bag recreated every time a new list is started or a CSV imported. The library sidebar exists but doesn't prevent duplication. This feature closes that gap without breaking the existing data model or UX for current users.

---

## Goals

- Prevent item duplication at two entry points: manual add and CSV import
- Enrich item metadata to enable accurate matching and better library organisation
- Remain fully backward-compatible: no existing item or list is modified

---

## Data Model Changes

Three new optional fields added to `Item` in `dataTypes.js`:

| Field | Type | Default | Notes |
|---|---|---|---|
| `brand` | string | `""` | Manufacturer/brand name |
| `category` | string | `""` | Closed list — same values as list categories (Shelter, Sleep, Cook…) |
| `tags` | string[] | `[]` | Free-form tags (material, usage, season…) |

All three default to empty — existing items are untouched. `Library.save()` already uses `assignIn` so the new fields are persisted automatically once set.

---

## Feature 1 — Autocomplete at Manual Add

**Trigger:** User starts typing an item name in the "add item" input inside a list category.

**Behaviour:**
- A dropdown appears below the input, showing library items whose name fuzzy-matches the typed string.
- Match score is boosted by `brand` and `category` alignment (same category as the current list category scores higher).
- Selecting a suggestion inserts a reference to the existing item — no new item created.
- Ignoring suggestions and pressing Enter creates a new item as today.

**Scope:** UI change in [item.vue](client/components/item.vue) and [category.vue](client/components/category.vue). No backend change required — library items are already in Vuex store.

---

## Feature 2 — Smart Dedup at CSV Import

**Trigger:** User uploads a CSV file via the existing import flow ([import-csv.vue](client/components/import-csv.vue)).

**New CSV column:** `brand` (optional). Existing CSVs without it continue to work unchanged.

**Dedup logic (post-parse, before insert):**
1. For each parsed item, compute a match score against all existing library items:
   - Name fuzzy match (Levenshtein distance, normalised case/whitespace)
   - Weight match within ±5%
   - Brand exact match (if both present)
   - Description similarity (optional boost)
2. Score ≥ threshold → **automatic merge**: parsed item is discarded, existing item reused.
3. Score in ambiguous range → **review screen**: user sees side-by-side and picks merge or keep-both.
4. No match → new item created normally.

**Post-import summary:** A toast/alert shows "X items merged with existing gear, Y new items added."

**Scope:** Logic added to import pipeline in [import-csv.vue](client/components/import-csv.vue). New `useGearMatcher.js` composable for the matching algorithm.

---

## Feature 3 — Library Filter by Category and Tags

**Location:** Sidebar library ([library-items.vue](client/components/library-items.vue)), above the existing search input.

**Controls:**
- Category dropdown (closed list, same values as list categories + "All")
- Tag chips — active tags shown as chips with ×, new tags added via text input

**Behaviour:** Filters are additive (AND). Existing text search still works alongside filters. All filters default to "All" / empty — no change in default view.

---

## Out of Scope

- Bulk brand/tag editing on existing items (manual per-item only)
- Brand as a separate entity/model (it's a plain string field)
- Compartment-based organisation (explicitly deferred)
- Community/discovery features (separate future feature)

---

## Backward Compatibility

- `brand`, `category`, `tags` are additive fields — empty by default
- CSV import without `brand` column behaves identically to today
- Library sidebar default view is unchanged
- No migration script needed

---

## Open Questions

_None — all resolved during brainstorming._
