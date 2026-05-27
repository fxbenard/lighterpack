# Shared Gear Room — Design Spec

**Date**: 2026-05-25  
**Branch**: feat/share-design  
**Status**: approved

---

## Problem

Every time a user creates a new list or adds an item, `library.newItem()` creates a distinct `Item` object with a new ID. The result: the same physical piece of gear appears as multiple independent items — one per list — with no shared identity. Editing one copy doesn't update the others. The gear sidebar fills with duplicates.

Competitors (Lighterpack.com, PackStack) model gear as a central library of unique items that lists *reference*, not copy.

---

## Key Insight

The data model is already correct. `Category.categoryItems[]` stores `{ itemId, qty, worn, consumable }` — references, not copies. The bug is entirely in the UX entry points: `newItem()` is called unconditionally on every "+", bypassing the existing shared-item infrastructure.

---

## Approach: Shared Items (minimal changes)

No data model changes. Fix the workflow entry points and suppression semantics.

---

## Architecture

### What changes

| Component | Before | After |
|-----------|--------|-------|
| `+` in a category | immediately creates a blank item | opens gear-picker modal |
| Drag sidebar → list | `addItemToCategory` (already correct) | unchanged |
| Item-detail modal | no "Add to list" action | adds "Add to list ▾" dropdown |
| Delete from list | `library.removeItem()` — removes everywhere | `category.removeItem()` — removes from list only |
| Gear Room | existing sidebar | sidebar unchanged + dedicated modal via "Gear Room" button |

### What does not change

- `library.items[]` data structure
- `categoryItems[{ itemId, qty, worn, consumable }]` references
- `addItemToCategory` mutation
- `removeItem` mutation (still used for "Delete gear")
- `copyList` — copies references (same `itemId`), no duplication
- Drag & drop

---

## New Component: `gear-picker.vue`

A lightweight modal replacing the direct `newItem` call on "+".

**Trigger**: click "+" in any category header.

**UI:**
```
┌─────────────────────────────────┐
│  Add gear to [Category name]    │
│  ┌─────────────────────────┐    │
│  │ 🔍 Search gear...       │    │
│  └─────────────────────────┘    │
│                                 │
│  Knife (Couteau)    40g  Simond │
│  Sleeping Bag       800g  Zpacks│
│  Tarp                55g        │
│                                 │
│  ──────────────────────────     │
│  [+ Create new item]            │
└─────────────────────────────────┘
```

**Behavior:**
- Search filters in real-time on name + brand
- Click existing item → `store.commit('addItemToCategory', { itemId, categoryId })` → close modal
- Click "Create new item" → `store.commit('newItem', { category, _isNew: true })` → close modal
- Items already present in this category appear dimmed (informational, not blocked)

---

## Suppression: Two Distinct Actions

**New mutation `removeItemFromList`:**
```js
removeItemFromList(state, { itemId, categoryId }) {
    const category = state.library.getCategoryById(categoryId);
    category.removeItem(itemId);
    state.library.getListById(state.library.defaultListId).calculateTotals();
}
```

**UX in item-detail modal (view mode):**

```
[Add to list ▾]  [Edit gear]
[Remove from list]  [Delete gear]
```

| Action | Mutation | Effect |
|--------|----------|--------|
| Remove from list | `removeItemFromList` (new) | `category.removeItem(id)` only — item stays in gear room |
| Delete gear | `removeItem` (existing, unchanged) | removes from `library.items[]` + all categories everywhere |

- "Remove from list" is visible only when the item is in the current list
- "Delete gear" uses the existing speedbump confirmation
- In the sidebar gear room context: only "Delete gear" exists

---

## Gear Room Modal + "Add to list" button

**Access**: a "Gear Room" button in the sidebar header opens `library-items.vue` inside a full `modal.vue` — no rewrite of `library-items.vue`.

**"Add to list ▾" in item-detail modal:**
- Dropdown lists the categories of the current list
- Selecting a category → `addItemToCategory(itemId, categoryId)`
- "Remove from list" appears only if the item is currently in the active list
- "Add to list ▾" dims categories that already contain this item (guard against double-reference)

**Sidebar button placement:**
```
┌──────────────────────────────┐
│ Gear              [Gear Room]│  ← new button in sidebar header
│ ┌────────────────────────┐   │
│ │ Filter by tag...       │   │
```

---

## Complete Data Flow

**Adding an item to a list:**
```
Click "+"        → gear-picker.vue opens
  ├── Pick existing  → addItemToCategory(itemId, categoryId)
  └── "Create new"   → newItem({ category, _isNew: true })
                        item created in library.items[]
                        AND referenced in categoryItems[]

Drag sidebar → list  → addItemToCategory (unchanged)

item-detail "Add to list ▾"  → addItemToCategory
```

**Editing an item:**
```
Edit in item-detail  → updateItem(item)
                        propagates to all lists (single source of truth)
                        no mutation change needed
```

**Deleting:**
```
"Remove from list"  → removeItemFromList(itemId, categoryId)
                       item remains in library.items[]

"Delete gear"       → removeItem(item)  (unchanged)
                       removes from library.items[] + all categories
```

---

## Files Touched

| File | Change |
|------|--------|
| `client/components/gear-picker.vue` | new component |
| `client/components/category.vue` | replace `newItem` commit with gear-picker open |
| `client/components/item-detail.vue` | add "Add to list ▾" + "Remove from list" |
| `client/components/sidebar.vue` | add "Gear Room" button → modal |
| `client/store/store.js` | add `removeItemFromList` mutation |

---

## Out of Scope

- Per-list item overrides (name, weight) — could be a follow-up (Approach C)
- Deduplication of existing data (migration of existing duplicate items)
- Gear room advanced filters (tags, categories) — sidebar already handles this
