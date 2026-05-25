# Shared Gear Room Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make gear items shared across lists — add a gear-picker modal to replace the direct "new item" flow, expose "Add to list" and "Remove from list" actions in item-detail, and add a "Gear Room" button in the sidebar.

**Architecture:** `library.items[]` is already the single source of truth and `categoryItems[{ itemId, qty, worn, consumable }]` already stores references. The fix is entirely in UX entry points: the `+` button opens a picker instead of creating a blank item immediately, and item-detail exposes the correct remove/add semantics. No data model changes.

**Tech Stack:** Vue 2, Vuex, SCSS (design tokens via `_globals.scss`), existing `openDialog`/`registerDialogOpener` dialog service, existing `modal.vue` wrapper.

---

## File Map

| File | Action | Responsibility |
|------|--------|----------------|
| `client/components/gear-picker.vue` | **Create** | Modal: search existing gear, pick or create new |
| `client/components/item-detail.vue` | **Modify** | Add "Remove from list" + "Add to list ▾" + "Delete gear" |
| `client/components/category.vue` | **Modify** | Replace direct `newItem` call with `openDialog('gearPicker', ...)` |
| `client/components/sidebar.vue` | **Modify** | Add "Gear Room" button → opens library-items in modal |
| `client/views/dashboard.vue` | **Modify** | Register `gear-picker` component globally (like `item-detail`) |
| `client/store/store.js` | **Modify** | Add `deleteItem` mutation (full library delete, distinct from remove-from-list) |
| `client/services/dialogs.js` | **Read-only** | Understand `openDialog`/`registerDialogOpener` API |

---

## Task 1: Rename delete semantics in item-detail + add "Delete gear"

**Context:** Currently `item-detail.vue` has one button labelled "🗑 Delete" that calls `removeItemFromCategory` — which removes from the current list only (correct behaviour). We need to:
1. Rename it to "Remove from list" (clarifies it doesn't delete the gear globally)
2. Add a separate "Delete gear" button that calls `removeItem` (removes from `library.items[]` everywhere)

**Files:**
- Modify: `client/components/item-detail.vue` (footer section ~line 431-438)
- Modify: `client/store/store.js` (no change needed — `removeItem` mutation already exists at line 122)

- [ ] **Step 1: Read the current footer template**

Read `client/components/item-detail.vue` lines 431–439. The current footer is:
```html
<div class="itemDetailFooter">
    <a class="itemDetailDelete" @click="removeItem">
        🗑 Delete
    </a>
    <div class="itemDetailSpacer" />
    <button class="lpButton itemDetailEdit" @click="startEdit">
        ✎ Edit Gear
    </button>
</div>
```

- [ ] **Step 2: Replace footer with two-action layout**

Replace the footer block with:
```html
<div class="itemDetailFooter">
    <a v-if="category" class="itemDetailRemove" @click="removeFromList">
        ↩ Remove from list
    </a>
    <a class="itemDetailDelete" @click="deleteGear">
        🗑 Delete gear
    </a>
    <div class="itemDetailSpacer" />
    <button class="lpButton itemDetailEdit" @click="startEdit">
        ✎ Edit Gear
    </button>
</div>
```

- [ ] **Step 3: Update the script methods**

Find the existing `removeItem()` method (~line 671) and replace it with two methods:

```js
removeFromList() {
    this.$store.commit('removeItemFromCategory', {
        itemId: this.item.id,
        category: this.category,
    });
    this.close();
},
deleteGear() {
    openSpeedbump({
        message: `Delete "${this.item.name || 'this item'}" from your gear room? It will be removed from all lists.`,
        confirmText: 'Delete gear',
        onConfirm: () => {
            this.$store.commit('removeItem', this.item);
            this.close();
        },
    });
},
```

- [ ] **Step 4: Verify `openSpeedbump` is already imported**

Check line ~540 of item-detail.vue. It should already import from `'../services/speedbump'`. If not, add:
```js
import { openSpeedbump } from '../services/speedbump';
```

- [ ] **Step 5: Add SCSS for `itemDetailRemove`**

In the `<style>` block of item-detail.vue, add alongside `.itemDetailDelete`:
```scss
.itemDetailRemove {
    color: $color-text-muted;
    cursor: pointer;
    font-size: $fontSize-sm;
    text-decoration: none;

    &:hover {
        color: $color-text;
    }
}
```

- [ ] **Step 6: Build and verify**

```bash
cd /Users/fxbenard/Documents/Dev/lighterpack && npm run build 2>&1 | tail -20
```
Expected: build succeeds with no errors.

- [ ] **Step 7: Commit**

```bash
git add client/components/item-detail.vue
git commit -m "feat: split remove-from-list and delete-gear in item-detail"
```

---

## Task 2: Add "Add to list ▾" dropdown in item-detail (view mode)

**Context:** When item-detail is opened from the sidebar (library-items), `category` is `null`. We add an "Add to list ▾" dropdown that shows all categories of the current list and calls `addItemToCategory`.

**Files:**
- Modify: `client/components/item-detail.vue`

- [ ] **Step 1: Add `addToListOpen` to data()**

In `data()` (~line 555), add:
```js
addToListOpen: false,
```

- [ ] **Step 2: Add `currentListCategories` computed**

In the `computed` block (~line 579), add:
```js
currentListCategories() {
    const library = this.$store.state.library;
    const list = library.getListById(library.defaultListId);
    if (!list) return [];
    return list.categoryIds.map(id => library.getCategoryById(id)).filter(Boolean);
},
isInCurrentList() {
    const library = this.$store.state.library;
    const list = library.getListById(library.defaultListId);
    if (!list) return false;
    for (const catId of list.categoryIds) {
        const cat = library.getCategoryById(catId);
        if (cat && cat.getCategoryItemById(this.item.id)) return true;
    }
    return false;
},
```

- [ ] **Step 3: Add `addToCategory` method**

In `methods`, add:
```js
addToCategory(category) {
    this.$store.commit('addItemToCategory', {
        itemId: this.item.id,
        categoryId: category.id,
        dropIndex: category.categoryItems.length,
    });
    this.addToListOpen = false;
},
```

- [ ] **Step 4: Add "Add to list" button + dropdown to footer template**

Replace the view-mode footer (from Task 1) with:
```html
<div class="itemDetailFooter">
    <a v-if="category" class="itemDetailRemove" @click="removeFromList">
        ↩ Remove from list
    </a>
    <div v-else class="itemDetailAddToList">
        <button class="itemDetailAddBtn" @click="addToListOpen = !addToListOpen">
            + Add to list ▾
        </button>
        <ul v-if="addToListOpen" class="itemDetailAddDropdown">
            <li
                v-for="cat in currentListCategories"
                :key="cat.id"
                :class="['itemDetailAddOption', { dimmed: cat.getCategoryItemById(item.id) }]"
                @click="addToCategory(cat)"
            >
                {{ cat.name || 'Unnamed category' }}
            </li>
        </ul>
    </div>
    <a class="itemDetailDelete" @click="deleteGear">
        🗑 Delete gear
    </a>
    <div class="itemDetailSpacer" />
    <button class="lpButton itemDetailEdit" @click="startEdit">
        ✎ Edit Gear
    </button>
</div>
```

- [ ] **Step 5: Add SCSS for the dropdown**

```scss
.itemDetailAddToList {
    position: relative;
}

.itemDetailAddBtn {
    background: none;
    border: 1px solid $color-accent;
    border-radius: $radius-sm;
    color: $color-accent;
    cursor: pointer;
    font-size: $fontSize-sm;
    padding: 4px 10px;

    &:hover {
        background: rgba($color-accent, 0.08);
    }
}

.itemDetailAddDropdown {
    background: $color-surface;
    border: 1px solid $color-border;
    border-radius: $radius-sm;
    bottom: 100%;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
    left: 0;
    list-style: none;
    margin: 0 0 4px;
    padding: 4px 0;
    position: absolute;
    min-width: 160px;
    z-index: 10;
}

.itemDetailAddOption {
    cursor: pointer;
    font-size: $fontSize-sm;
    padding: 6px 14px;

    &:hover {
        background: $color-bg;
    }

    &.dimmed {
        color: $color-text-muted;
        cursor: default;
        pointer-events: none;
    }
}
```

- [ ] **Step 6: Reset `addToListOpen` on modal close**

In the `close()` method, add:
```js
this.addToListOpen = false;
```

- [ ] **Step 7: Build and verify**

```bash
npm run build 2>&1 | tail -20
```
Expected: no errors.

- [ ] **Step 8: Commit**

```bash
git add client/components/item-detail.vue
git commit -m "feat: add-to-list dropdown in item-detail view mode"
```

---

## Task 3: Create `gear-picker.vue`

**Context:** A new modal component that lists all items in `library.items[]`, allows search by name/brand, and lets the user either pick an existing item (→ `addItemToCategory`) or create a new blank item (→ `newItem`). It is opened via `openDialog('gearPicker', { category })`.

**Files:**
- Create: `client/components/gear-picker.vue`
- Modify: `client/views/dashboard.vue` (register component + register dialog opener)

- [ ] **Step 1: Read how item-detail registers itself**

Read `client/components/item-detail.vue` lines 595–615 to understand the `registerDialogOpener` / `unregisterDialogOpener` pattern. It looks like:
```js
mounted() {
    registerDialogOpener('itemDetail', ({ item, categoryItem, category }) => {
        this.item = { ...item };
        ...
        this.$refs.modal.show();
    });
},
beforeDestroy() {
    unregisterDialogOpener('itemDetail');
},
```

- [ ] **Step 2: Read dashboard.vue to understand component registration**

Read `client/views/dashboard.vue` lines 1–50 to see how item-detail is imported and registered. Copy the same pattern for gear-picker.

- [ ] **Step 3: Create `gear-picker.vue`**

Create `client/components/gear-picker.vue` with the following full content:

```vue
<style lang="scss">
@import "../css/_globals";

#gearPickerDialog.lpModal {
    border-radius: $radius-md;
    max-height: 80vh;
    overflow-y: auto;
    padding: 0;
    width: min(480px, 92vw);
}

.gearPicker {
    display: flex;
    flex-direction: column;
}

.gearPickerHeader {
    background: $color-accent;
    border-radius: $radius-md $radius-md 0 0;
    color: #fff;
    padding: 16px 20px;
}

.gearPickerTitle {
    font-size: $fontSize-md;
    font-weight: $fontWeight-bold;
    margin: 0;
}

.gearPickerSubtitle {
    font-size: $fontSize-sm;
    margin: 2px 0 0;
    opacity: 0.8;
}

.gearPickerSearch {
    background: $color-bg;
    border: 1px solid $color-border;
    border-radius: $radius-sm;
    color: $color-text;
    font-size: $fontSize-sm;
    margin: 14px 16px 0;
    padding: 8px 12px;
    width: calc(100% - 32px);

    &:focus {
        border-color: $color-accent;
        outline: none;
    }

    &::placeholder {
        color: $color-text-muted;
    }
}

.gearPickerList {
    flex: 1;
    list-style: none;
    margin: 8px 0 0;
    overflow-y: auto;
    padding: 0 0 8px;
}

.gearPickerItem {
    align-items: center;
    border-bottom: 1px solid $color-border;
    cursor: pointer;
    display: flex;
    gap: 10px;
    padding: 10px 16px;

    &:last-child {
        border-bottom: none;
    }

    &:hover {
        background: $color-bg;
    }

    &.alreadyAdded {
        cursor: default;
        opacity: 0.45;
        pointer-events: none;
    }
}

.gearPickerItemName {
    flex: 1;
    font-size: $fontSize-sm;
    font-weight: $fontWeight-bold;
}

.gearPickerItemBrand {
    color: $color-text-muted;
    font-size: $fontSize-xs;
}

.gearPickerItemWeight {
    color: $color-text-muted;
    font-size: $fontSize-xs;
    white-space: nowrap;
}

.gearPickerEmpty {
    color: $color-text-muted;
    font-size: $fontSize-sm;
    padding: 20px 16px;
    text-align: center;
}

.gearPickerFooter {
    border-top: 1px solid $color-border;
    padding: 12px 16px;
}

.gearPickerCreate {
    background: none;
    border: 1px dashed $color-border;
    border-radius: $radius-sm;
    color: $color-accent;
    cursor: pointer;
    font-size: $fontSize-sm;
    padding: 8px 14px;
    width: 100%;

    &:hover {
        border-color: $color-accent;
        background: rgba($color-accent, 0.06);
    }
}
</style>

<template>
    <modal id="gearPickerDialog" ref="modal" @hide="reset">
        <div class="gearPicker">
            <div class="gearPickerHeader">
                <p class="gearPickerTitle">Add gear</p>
                <p class="gearPickerSubtitle">to {{ categoryName }}</p>
            </div>

            <input
                v-model="search"
                class="gearPickerSearch"
                type="text"
                placeholder="Search by name or brand..."
                autofocus
            >

            <ul class="gearPickerList">
                <li
                    v-for="item in filteredItems"
                    :key="item.id"
                    :class="['gearPickerItem', { alreadyAdded: isAlreadyInCategory(item) }]"
                    @click="pickItem(item)"
                >
                    <span class="gearPickerItemName">{{ item.name || 'Unnamed item' }}</span>
                    <span v-if="item.brand" class="gearPickerItemBrand">{{ item.brand }}</span>
                    <span class="gearPickerItemWeight">{{ formatWeight(item.weight, item.authorUnit) }}</span>
                </li>
                <li v-if="filteredItems.length === 0" class="gearPickerEmpty">
                    No matching gear found.
                </li>
            </ul>

            <div class="gearPickerFooter">
                <button class="gearPickerCreate" @click="createNew">
                    + Create new item{{ search ? ` "${search}"` : '' }}
                </button>
            </div>
        </div>
    </modal>
</template>

<script>
import modal from './modal.vue';
import { registerDialogOpener, unregisterDialogOpener } from '../services/dialogs';
import { useUtils } from '../composables/useUtils.js';

const { displayWeight } = useUtils();

export default {
    name: 'GearPicker',
    components: { modal },
    data() {
        return {
            search: '',
            category: null,
        };
    },
    computed: {
        library() {
            return this.$store.state.library;
        },
        categoryName() {
            return this.category ? (this.category.name || 'category') : 'list';
        },
        filteredItems() {
            const q = this.search.toLowerCase();
            return this.library.items.filter(item =>
                !q ||
                (item.name && item.name.toLowerCase().includes(q)) ||
                (item.brand && item.brand.toLowerCase().includes(q))
            );
        },
    },
    mounted() {
        registerDialogOpener('gearPicker', ({ category }) => {
            this.category = category || null;
            this.search = '';
            this.$refs.modal.show();
        });
    },
    beforeDestroy() {
        unregisterDialogOpener('gearPicker');
    },
    methods: {
        formatWeight(weight, unit) {
            return `${displayWeight(weight, unit)} ${unit}`;
        },
        isAlreadyInCategory(item) {
            if (!this.category) return false;
            return !!this.category.getCategoryItemById(item.id);
        },
        pickItem(item) {
            if (!this.category || this.isAlreadyInCategory(item)) return;
            this.$store.commit('addItemToCategory', {
                itemId: item.id,
                categoryId: this.category.id,
                dropIndex: this.category.categoryItems.length,
            });
            this.$refs.modal.hide();
        },
        createNew() {
            this.$store.commit('newItem', {
                category: this.category,
                _isNew: true,
                name: this.search || '',
            });
            this.$refs.modal.hide();
        },
        reset() {
            this.search = '';
            this.category = null;
        },
    },
};
</script>
```

- [ ] **Step 4: Register gear-picker in dashboard.vue**

Read `client/views/dashboard.vue` to find where `item-detail` is imported and added to `components: {}`. Add gear-picker in the same pattern:

```js
import gearPicker from '../components/gear-picker.vue';
// in components: { ..., gearPicker }
```

And add `<gearPicker />` in the template next to `<itemDetail />`.

- [ ] **Step 5: Build and verify**

```bash
npm run build 2>&1 | tail -20
```
Expected: no errors.

- [ ] **Step 6: Commit**

```bash
git add client/components/gear-picker.vue client/views/dashboard.vue
git commit -m "feat: gear-picker modal component"
```

---

## Task 4: Wire category.vue `+` button to gear-picker

**Context:** Currently `category.vue` shows an inline input + autocomplete. The input calls `newItem` directly on Enter. We keep the autocomplete suggestions (they are useful for quick lookup) but make "Add new item" open the gear-picker modal instead of creating a blank item directly. The flow: click "Add new item" → gear-picker opens → user picks existing OR creates new (with the name pre-filled from what was typed).

**Files:**
- Modify: `client/components/category.vue`

- [ ] **Step 1: Import openDialog in category.vue**

At the top of the `<script>` section of `category.vue`, add:
```js
import { openDialog } from '../services/dialogs';
```

- [ ] **Step 2: Replace `newItem()` method**

Find the `newItem()` method (~line 142) and replace it:

```js
newItem() {
    openDialog('gearPicker', { category: this.category });
    this.newItemName = '';
    this.showSuggestions = false;
    this.showInput = false;
},
```

This means pressing Enter in the input, or clicking the `+` icon, opens the gear-picker with the category pre-set.

- [ ] **Step 3: Keep `selectSuggestion` unchanged**

`selectSuggestion` already calls `addItemToCategory` — this is exactly the shared-item behaviour. No change needed.

- [ ] **Step 4: Build and verify**

```bash
npm run build 2>&1 | tail -20
```
Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add client/components/category.vue
git commit -m "feat: open gear-picker on category + button"
```

---

## Task 5: Add "Gear Room" button in sidebar

**Context:** `sidebar.vue` currently renders `<libraryItems />` inline in the sidebar. We add a "Gear Room" button in the sidebar header that opens `library-items.vue` inside a `modal.vue`. The sidebar continues to show library-items inline for drag & drop — the modal is an *additional* access point.

**Files:**
- Modify: `client/components/sidebar.vue`

- [ ] **Step 1: Add `gearRoomOpen` data**

In the `<script>` section, add to `data()` (create it if it only uses `setup()`):

Since sidebar.vue uses Options API with `setup()`, add alongside `computed`:
```js
data() {
    return {
        gearRoomOpen: false,
    };
},
```

- [ ] **Step 2: Add modal import**

Add at the top of `<script>`:
```js
import modal from './modal.vue';
```
Add `modal` to `components: { ..., modal }`.

- [ ] **Step 3: Add button and modal to template**

In the template, find `<libraryItems />` and add the button in the section header before it:

```html
<section>
    <h2>
        Gear
        <button class="lpGearRoomBtn" @click="gearRoomOpen = true">⊞ Gear Room</button>
    </h2>
    <libraryItems />
</section>

<modal v-if="gearRoomOpen" id="gearRoomDialog" @hide="gearRoomOpen = false">
    <libraryItems />
</modal>
```

- [ ] **Step 4: Add SCSS for the button**

```scss
.lpGearRoomBtn {
    background: none;
    border: 1px solid $color-border;
    border-radius: $radius-sm;
    color: $color-text-muted;
    cursor: pointer;
    float: right;
    font-size: $fontSize-xs;
    padding: 2px 8px;

    &:hover {
        border-color: $color-accent;
        color: $color-accent;
    }
}

#gearRoomDialog.lpModal {
    width: min(520px, 92vw);
    max-height: 80vh;
    overflow-y: auto;
}
```

- [ ] **Step 5: Build and verify**

```bash
npm run build 2>&1 | tail -20
```
Expected: no errors.

- [ ] **Step 6: Commit**

```bash
git add client/components/sidebar.vue
git commit -m "feat: gear room modal button in sidebar"
```

---

## Self-Review Checklist

- [x] **Spec §gear-picker** → Task 3 (new component) + Task 4 (wires category +)
- [x] **Spec §remove from list** → Task 1 (rename button, keep `removeItemFromCategory`)
- [x] **Spec §delete gear** → Task 1 (`deleteGear` method with speedbump)
- [x] **Spec §add to list ▾** → Task 2 (dropdown in item-detail)
- [x] **Spec §gear room modal** → Task 5 (sidebar button)
- [x] **Spec §drag & drop unchanged** → not touched in any task
- [x] **Spec §copyList unchanged** → not touched
- [x] **Type consistency** — `addItemToCategory` called with `{ itemId, categoryId, dropIndex }` in Tasks 2, 3, 4 (consistent with store.js line 162)
- [x] **No placeholders** — all steps have concrete code
