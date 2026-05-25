# Smart Gear Library Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add `brand`, `category`, and `tags` fields to Item, then use them to prevent duplication at manual add (autocomplete) and CSV import (fuzzy dedup), and enable filtering in the library sidebar.

**Architecture:** Three independent slices — data model, then Feature 1 (autocomplete), then Feature 2 (CSV dedup), then Feature 3 (library filters). Each slice is independently shippable. The fuzzy matching algorithm lives in a standalone composable `useGearMatcher.js` shared by Features 1 and 2.

**Tech Stack:** Vue 3 Options API, Vuex, vanilla JS composables (no new dependencies), Playwright E2E tests.

---

## File Map

| Action | File | Purpose |
|---|---|---|
| Modify | `client/dataTypes.js` | Add `brand`, `category`, `tags` to Item constructor |
| Modify | `client/utils/csv-import.js` | Parse optional `brand` column |
| Create | `client/composables/useGearMatcher.js` | Fuzzy match algorithm + scoring |
| Modify | `client/components/category.vue` | Autocomplete dropdown on "Add new item" |
| Modify | `client/components/import-csv.vue` | Dedup logic + review screen + post-import summary |
| Modify | `client/store/store.js` | `importCSV` mutation: merge instead of duplicate |
| Modify | `client/components/library-items.vue` | Category dropdown + tag chips filter |
| Create | `test/e2e/smart-gear-library.spec.ts` | E2E tests for all three features |
| Modify | `test/fixtures/csv/` | Add `brand-dedup.csv` fixture |

---

## Task 1: Add `brand`, `category`, `tags` to Item data model

**Files:**
- Modify: `client/dataTypes.js` (Item constructor, lines 14–28)

- [ ] **Step 1: Add fields to Item constructor**

In `client/dataTypes.js`, update the `Item` constructor:

```js
const Item = function ({ id, unit }) {
    this.id = id;
    this.name = '';
    this.description = '';
    this.weight = 0;
    this.authorUnit = 'oz';
    if (unit) {
        this.authorUnit = unit;
    }
    this.price = 0.00;
    this.image = '';
    this.imageUrl = '';
    this.url = '';
    this.brand = '';
    this.category = '';
    this.tags = [];

    return this;
};
```

- [ ] **Step 2: Verify `Item.prototype.load` handles new fields**

`load()` uses `assignIn(this, input)` — existing items without these fields will keep the constructor defaults (`''`, `''`, `[]`). No change needed. Confirm by reading lines 31–40.

- [ ] **Step 3: Verify `Library.prototype.save` persists new fields**

`save()` calls `this.items[i].save()` which returns `this` — all fields including `brand`, `category`, `tags` are included. No change needed. Confirm by reading lines around `Library.prototype.save`.

- [ ] **Step 4: Commit**

```bash
git add client/dataTypes.js
git commit -m "feat: add brand, category, tags fields to Item"
```

---

## Task 2: Create `useGearMatcher.js` composable

**Files:**
- Create: `client/composables/useGearMatcher.js`

This composable provides the fuzzy matching logic shared by autocomplete and CSV dedup.

- [ ] **Step 1: Create the composable**

```js
// client/composables/useGearMatcher.js

function normalizeStr(str) {
    return (str || '').toLowerCase().trim().replace(/\s+/g, ' ');
}

// Levenshtein distance between two strings
function levenshtein(a, b) {
    const m = a.length;
    const n = b.length;
    const dp = Array.from({ length: m + 1 }, (_, i) => [i, ...Array(n).fill(0)]);
    for (let j = 0; j <= n; j++) dp[0][j] = j;
    for (let i = 1; i <= m; i++) {
        for (let j = 1; j <= n; j++) {
            dp[i][j] = a[i - 1] === b[j - 1]
                ? dp[i - 1][j - 1]
                : 1 + Math.min(dp[i - 1][j - 1], dp[i - 1][j], dp[i][j - 1]);
        }
    }
    return dp[m][n];
}

// 0.0 (no match) to 1.0 (exact match) name similarity
function nameSimilarity(a, b) {
    const na = normalizeStr(a);
    const nb = normalizeStr(b);
    if (!na || !nb) return 0;
    if (na === nb) return 1;
    const maxLen = Math.max(na.length, nb.length);
    return 1 - levenshtein(na, nb) / maxLen;
}

// Score a parsed CSV row against a library item. Returns 0.0–1.0.
// weightMg: parsed weight already converted to mg (same unit as item.weight)
function scoreMatch(parsed, libraryItem, weightMg) {
    let score = 0;

    // Name similarity — most important signal (0–0.6)
    const nameSim = nameSimilarity(parsed.name, libraryItem.name);
    score += nameSim * 0.6;

    // Weight match ±5% (0 or 0.25)
    if (weightMg > 0 && libraryItem.weight > 0) {
        const ratio = Math.abs(weightMg - libraryItem.weight) / libraryItem.weight;
        if (ratio <= 0.05) score += 0.25;
    }

    // Brand exact match (0 or 0.1)
    if (parsed.brand && libraryItem.brand) {
        if (normalizeStr(parsed.brand) === normalizeStr(libraryItem.brand)) {
            score += 0.1;
        }
    }

    // Description similarity boost (0–0.05)
    if (parsed.description && libraryItem.description) {
        score += nameSimilarity(parsed.description, libraryItem.description) * 0.05;
    }

    return score;
}

// Thresholds
const THRESHOLD_AUTO_MERGE = 0.80;  // score >= this → merge silently
const THRESHOLD_AMBIGUOUS  = 0.60;  // score >= this → show review screen

// Find best match for a parsed row in the library items array.
// Returns { item, score, decision: 'merge'|'review'|'new' }
function findBestMatch(parsed, libraryItems, weightMg) {
    let best = null;
    let bestScore = 0;

    for (const item of libraryItems) {
        const score = scoreMatch(parsed, item, weightMg);
        if (score > bestScore) {
            bestScore = score;
            best = item;
        }
    }

    if (!best || bestScore < THRESHOLD_AMBIGUOUS) {
        return { item: null, score: bestScore, decision: 'new' };
    }
    if (bestScore >= THRESHOLD_AUTO_MERGE) {
        return { item: best, score: bestScore, decision: 'merge' };
    }
    return { item: best, score: bestScore, decision: 'review' };
}

// Autocomplete: return library items whose name fuzzy-matches the query,
// sorted by score descending. Returns up to `limit` results.
function suggestItems(query, libraryItems, categoryName, limit = 6) {
    if (!query || query.length < 2) return [];

    return libraryItems
        .map(item => {
            let score = nameSimilarity(query, item.name);
            // Boost items in same category
            if (categoryName && item.category && normalizeStr(item.category) === normalizeStr(categoryName)) {
                score += 0.1;
            }
            return { item, score };
        })
        .filter(r => r.score > 0.3)
        .sort((a, b) => b.score - a.score)
        .slice(0, limit)
        .map(r => r.item);
}

export {
    scoreMatch,
    findBestMatch,
    suggestItems,
    THRESHOLD_AUTO_MERGE,
    THRESHOLD_AMBIGUOUS,
};
```

- [ ] **Step 2: Commit**

```bash
git add client/composables/useGearMatcher.js
git commit -m "feat: add useGearMatcher composable for fuzzy item matching"
```

---

## Task 3: Parse `brand` column in CSV import

**Files:**
- Modify: `client/utils/csv-import.js`

- [ ] **Step 1: Add `brand` to the parsed row object**

In `parseImportCsv`, after the existing field extractions (around line where `consumable` is parsed), add:

```js
const brand = normalizeField(getCell(row, columnIndexes, 'brand', -1));
```

And include it in the pushed data object:

```js
importData.data.push({
    name: itemName,
    category,
    description,
    qty,
    weight,
    unit,
    url: normalizeField(getCell(row, columnIndexes, 'url', 6)),
    price: Number.isNaN(price) ? 0 : price,
    worn: parseBooleanMarker(getCell(row, columnIndexes, 'worn', 8), 'worn'),
    consumable: parseBooleanMarker(getCell(row, columnIndexes, 'consumable', 9), 'consumable'),
    brand,
});
```

Note: `fallbackIndex: -1` means the column is header-only — positional CSVs without a header won't have `brand` (returns `''`). This preserves backward compatibility.

- [ ] **Step 2: Add `brand-dedup.csv` test fixture**

Create `test/fixtures/csv/brand-dedup.csv`:

```csv
Item Name,Category,Desc,Qty,Weight,Unit,URL,Price,Worn,Consumable,Brand
Sleeping Bag,Sleep,20 degree down bag,1,28,oz,,0,false,false,Sea to Summit
Tent Poles,Shelter,Carbon poles,1,12,oz,,0,false,false,
Rain Jacket,Clothing,Hardshell waterproof,1,12,oz,,0,false,false,Arc'teryx
```

- [ ] **Step 3: Commit**

```bash
git add client/utils/csv-import.js test/fixtures/csv/brand-dedup.csv
git commit -m "feat: parse optional brand column in CSV import"
```

---

## Task 4: Autocomplete in category "Add new item"

**Files:**
- Modify: `client/components/category.vue`

- [ ] **Step 1: Add autocomplete state and computed to category.vue script**

Add to the `data()` return:

```js
newItemName: '',
suggestions: [],
showSuggestions: false,
```

Add `import { suggestItems } from '../composables/useGearMatcher.js';` at the top of `<script>`.

Add a method `onNewItemInput(evt)`:

```js
onNewItemInput(evt) {
    this.newItemName = evt.target.value;
    this.suggestions = suggestItems(
        this.newItemName,
        this.library.items,
        this.category.name,
    );
    this.showSuggestions = this.suggestions.length > 0;
},
```

Add a method `selectSuggestion(item)`:

```js
selectSuggestion(item) {
    // Reuse existing library item — add it to this category without creating a new one
    this.$store.commit('addItemToCategory', { itemId: item.id, categoryId: this.category.id, dropIndex: this.category.categoryItems.length });
    this.newItemName = '';
    this.suggestions = [];
    this.showSuggestions = false;
},
```

Add a method `dismissSuggestions()`:

```js
dismissSuggestions() {
    // Delay to allow click on suggestion to fire first
    setTimeout(() => { this.showSuggestions = false; }, 150);
},
```

Modify `newItem()` to pass the typed name:

```js
newItem() {
    this.$store.commit('newItem', { category: this.category, _isNew: true, name: this.newItemName });
    this.newItemName = '';
    this.suggestions = [];
    this.showSuggestions = false;
},
```

- [ ] **Step 2: Update store `newItem` mutation to accept optional name**

In `client/store/store.js`, update the `newItem` mutation:

```js
newItem(state, { category, _isNew, name }) {
    const item = state.library.newItem({ category, _isNew });
    if (name) item.name = name;
    state.library.getListById(state.library.defaultListId).calculateTotals();
},
```

- [ ] **Step 3: Add autocomplete UI to category.vue template**

Replace the existing "Add new item" footer link with:

```html
<li class="lpFooter lpItemsFooter">
    <span class="lpAddItemCell" style="position:relative">
        <input
            v-if="showSuggestions || newItemName"
            v-model="newItemName"
            type="text"
            class="lpSilent lpAddItemInput"
            placeholder="Item name..."
            @input="onNewItemInput"
            @keydown.enter.prevent="newItem"
            @keydown.escape="dismissSuggestions"
            @blur="dismissSuggestions"
        />
        <a v-else class="lpAdd lpAddItem" @click="showAddInput"><i class="lpSprite lpSpriteAdd" />Add new item</a>
        <ul v-if="showSuggestions" class="lpSuggestions">
            <li
                v-for="item in suggestions"
                :key="item.id"
                class="lpSuggestion"
                @mousedown.prevent="selectSuggestion(item)"
            >
                <span class="lpSuggestionName">{{ item.name }}</span>
                <span v-if="item.brand" class="lpSuggestionBrand">{{ item.brand }}</span>
                <span class="lpSuggestionWeight">{{ displayWeight(item.weight, item.authorUnit) }} {{ item.authorUnit }}</span>
            </li>
        </ul>
    </span>
    <!-- existing price/weight/qty subtotal spans unchanged -->
    <span v-if="library.optionalFields['price']" class="lpPriceCell lpNumber lpSubtotal">
        {{ displayPrice(category.subtotalPrice, library.currencySymbol) }}
    </span>
    <span class="lpWeightCell lpNumber lpSubtotal">
        <span class="lpDisplaySubtotal">{{ displayWeight(category.subtotalWeight, library.totalUnit) }}</span>
        <span class="lpSubtotalUnit">{{ library.totalUnit }}</span>
    </span>
    <span class="lpQtyCell lpSubtotal">
        <span class="lpQtySubtotal">{{ category.subtotalQty }}</span>
    </span>
    <span class="lpRemoveCell" />
</li>
```

Add `showAddInput()` method:

```js
showAddInput() {
    this.showSuggestions = false;
    this.newItemName = '';
    // Focus the input on next tick
    this.$nextTick(() => {
        const input = this.$el.querySelector('.lpAddItemInput');
        if (input) input.focus();
    });
},
```

- [ ] **Step 4: Add suggestion styles to category.vue `<style>`**

```scss
.lpAddItemInput {
    border: none;
    border-bottom: 1px solid $color-border;
    background: transparent;
    color: $color-text;
    font-size: $fontSize-base;
    padding: 2px 4px;
    width: 180px;
    &:focus { outline: none; border-bottom-color: $color-accent; }
}

.lpSuggestions {
    background: $color-surface;
    border: 1px solid $color-border;
    border-radius: $radius-sm;
    box-shadow: 0 4px 12px rgba(0,0,0,0.10);
    left: 0;
    list-style: none;
    margin: 0;
    padding: 4px 0;
    position: absolute;
    top: 100%;
    width: 260px;
    z-index: 50;
}

.lpSuggestion {
    align-items: center;
    cursor: pointer;
    display: flex;
    gap: 8px;
    padding: 6px 10px;
    &:hover { background: rgba(var(--color-accent-rgb), 0.07); }
}

.lpSuggestionName { flex: 1; font-size: $fontSize-sm; }
.lpSuggestionBrand { color: $color-text-muted; font-size: $fontSize-sm; }
.lpSuggestionWeight { color: $color-text-muted; font-size: $fontSize-sm; white-space: nowrap; }
```

- [ ] **Step 5: Commit**

```bash
git add client/components/category.vue client/store/store.js
git commit -m "feat: autocomplete suggestions on add new item"
```

---

## Task 5: CSV dedup — match and review screen

**Files:**
- Modify: `client/components/import-csv.vue`
- Modify: `client/store/store.js`

- [ ] **Step 1: Add dedup logic to `import-csv.vue` — annotate import data with decisions**

Add at the top of `<script>`:

```js
import { findBestMatch } from '../composables/useGearMatcher.js';
const weightUtils = require('../utils/weight.js');
```

Add a `computeDedup(importData, libraryItems)` function (before `export default`):

```js
function computeDedup(importData, libraryItems) {
    let mergeCount = 0;
    let reviewCount = 0;

    importData.data = importData.data.map(row => {
        const weightMg = weightUtils.WeightToMg(parseFloat(row.weight), row.unit);
        const match = findBestMatch(row, libraryItems, weightMg);
        if (match.decision === 'merge') mergeCount++;
        if (match.decision === 'review') reviewCount++;
        return { ...row, _match: match };
    });

    importData.mergeCount = mergeCount;
    importData.reviewCount = reviewCount;
    return importData;
}
```

In the `validateImport` method, after `csvImportUtils.parseImportCsv`, add:

```js
validateImport(input, name) {
    this.importData = csvImportUtils.parseImportCsv(input, name);
    this.importData = computeDedup(this.importData, this.library.items);

    if (!this.importData.data.length) {
        showGlobalAlert('Unable to load spreadsheet - please verify the format.');
    } else {
        this.shown = true;
    }
},
```

- [ ] **Step 2: Add review screen UI to import-csv.vue template**

Add a dedup summary line after the existing `importSummary` badges:

```html
<p v-if="importData.mergeCount || importData.reviewCount" class="importSummary">
    <span v-if="importData.mergeCount" class="importBadge">{{ importData.mergeCount }} will merge with existing gear</span>
    <span v-if="importData.reviewCount" class="importBadge isAmbiguous">{{ importData.reviewCount }} need your review</span>
</p>
```

Add a review section below `#importData` for ambiguous items, visible only when `reviewCount > 0`:

```html
<div v-if="importData.reviewCount" class="importReview">
    <h3>Review these items</h3>
    <div v-for="(row, index) in ambiguousRows" :key="index" class="importReviewRow">
        <div class="importReviewCol">
            <p class="importReviewLabel">Imported</p>
            <p class="importReviewName">{{ row.name }}</p>
            <p class="importReviewMeta">{{ row.weight }} {{ row.unit }}<span v-if="row.brand"> · {{ row.brand }}</span></p>
        </div>
        <div class="importReviewCol">
            <p class="importReviewLabel">Existing match</p>
            <p class="importReviewName">{{ row._match.item.name }}</p>
            <p class="importReviewMeta">{{ displayWeight(row._match.item.weight, row._match.item.authorUnit) }} {{ row._match.item.authorUnit }}<span v-if="row._match.item.brand"> · {{ row._match.item.brand }}</span></p>
        </div>
        <div class="importReviewActions">
            <button class="lpButton lpButtonSm" @click="resolveReview(index, 'merge')">Merge</button>
            <button class="lpButton lpButtonSm lpButtonSecondary" @click="resolveReview(index, 'new')">Keep both</button>
        </div>
    </div>
</div>
```

- [ ] **Step 3: Add `ambiguousRows` computed and `resolveReview` method**

Add to `computed`:

```js
ambiguousRows() {
    if (!this.importData.data) return [];
    return this.importData.data.filter(row => row._match && row._match.decision === 'review');
},
```

Add to `methods`:

```js
resolveReview(rowIndex, decision) {
    const ambiguous = this.importData.data.filter(row => row._match && row._match.decision === 'review');
    const row = ambiguous[rowIndex];
    if (row) row._match.decision = decision;
},
displayWeight,
```

Import `displayWeight` at top: `import { useUtils } from '../composables/useUtils.js';` and destructure `const { displayWeight } = useUtils();` before `export default`.

- [ ] **Step 4: Add `isAmbiguous` badge style and review styles to import-csv.vue `<style>`**

```scss
.importBadge.isAmbiguous {
    background: #fff3cd;
    border-color: #e6c84a;
    color: #7a5c00;
}

.importReview {
    margin-bottom: 20px;
    h3 { font-size: 14px; font-weight: 700; margin: 0 0 10px; }
}

.importReviewRow {
    align-items: center;
    border: 1px solid #d7dccd;
    border-radius: 6px;
    display: flex;
    gap: 12px;
    margin-bottom: 8px;
    padding: 10px;
}

.importReviewCol { flex: 1; }
.importReviewLabel { color: #888; font-size: 11px; font-weight: 700; margin: 0 0 2px; text-transform: uppercase; }
.importReviewName { font-size: 13px; font-weight: 600; margin: 0 0 2px; }
.importReviewMeta { color: #888; font-size: 12px; margin: 0; }
.importReviewActions { display: flex; flex-direction: column; gap: 6px; }
.lpButtonSm { font-size: 12px; padding: 4px 10px; }
.lpButtonSecondary { background: transparent; border: 1px solid $color-border; color: $color-text; }
```

- [ ] **Step 5: Update `importCSV` Vuex mutation to respect `_match.decision`**

In `client/store/store.js`, update the `importCSV` mutation to handle `merge` decisions:

```js
importCSV(state, importData) {
    const list = state.library.newList({});
    let category;
    const newCategories = {};
    let item;
    let categoryItem;
    let hasPrice = false;
    let hasWorn = false;
    let hasConsumable = false;
    let mergedCount = 0;
    let newCount = 0;

    list.name = importData.name;

    importData.data.forEach((row) => {
        if (newCategories[row.category]) {
            category = newCategories[row.category];
        } else {
            category = state.library.newCategory({ list });
            newCategories[row.category] = category;
        }
        category.name = row.category;

        const decision = row._match ? row._match.decision : 'new';

        if (decision === 'merge' && row._match.item) {
            // Reuse existing item — just add it to this category
            item = state.library.getItemById(row._match.item.id);
            category.addItem({ itemId: item.id, _isNew: false });
            mergedCount++;
        } else {
            // Create new item as before
            item = state.library.newItem({ category, _isNew: false });
            item.name = row.name;
            item.description = row.description;
            item.url = row.url;
            item.price = row.price;
            if (row.brand) item.brand = row.brand;
            item.weight = weightUtils.WeightToMg(parseFloat(row.weight), row.unit);
            item.authorUnit = row.unit;
            newCount++;
        }

        categoryItem = category.getCategoryItemById(item.id);
        if (categoryItem) {
            categoryItem.qty = parseFloat(row.qty);
            categoryItem.worn = row.worn;
            categoryItem.consumable = row.consumable;
        }

        if (item.price) hasPrice = true;
        if (categoryItem && categoryItem.worn) hasWorn = true;
        if (categoryItem && categoryItem.consumable) hasConsumable = true;
    });

    if (hasPrice) state.library.optionalFields.price = true;
    if (hasWorn) state.library.optionalFields.worn = true;
    if (hasConsumable) state.library.optionalFields.consumable = true;

    state.library.defaultListId = list.id;
    state.library.getListById(list.id).calculateTotals();

    // Show post-import summary
    if (mergedCount > 0) {
        state.globalAlerts.push({
            id: `${Date.now()}-${Math.random()}`,
            message: `Import complete: ${mergedCount} item${mergedCount > 1 ? 's' : ''} merged with existing gear, ${newCount} new item${newCount !== 1 ? 's' : ''} added.`,
        });
    }
},
```

Note: `weightUtils` is already required at the top of `store.js` — verify with `grep -n "weightUtils\|require.*weight"` and add `const weightUtils = require('../utils/weight.js');` if missing.

- [ ] **Step 6: Commit**

```bash
git add client/components/import-csv.vue client/store/store.js
git commit -m "feat: fuzzy dedup on CSV import with review screen"
```

---

## Task 6: Library sidebar — category and tag filters

**Files:**
- Modify: `client/components/library-items.vue`

- [ ] **Step 1: Add `GEAR_CATEGORIES` constant (shared with item editing)**

At the top of `library-items.vue` `<script>`, add:

```js
export const GEAR_CATEGORIES = [
    'Shelter', 'Sleep', 'Clothing', 'Water', 'Food', 'Cook',
    'Navigation', 'Safety', 'Hygiene', 'Essentials', 'Other',
];
```

- [ ] **Step 2: Add filter state to `data()`**

```js
filterCategory: '',
filterTags: [],
tagInput: '',
```

- [ ] **Step 3: Update `filteredItems` computed to apply category and tag filters**

After the existing text search block (which produces `filteredItems`), add:

```js
if (this.filterCategory) {
    filteredItems = filteredItems.filter(item =>
        (item.category || '').toLowerCase() === this.filterCategory.toLowerCase()
    );
}
if (this.filterTags.length) {
    filteredItems = filteredItems.filter(item =>
        this.filterTags.every(tag => (item.tags || []).map(t => t.toLowerCase()).includes(tag.toLowerCase()))
    );
}
```

- [ ] **Step 4: Add filter UI to library-items.vue template**

Add before `<input id="librarySearch" ...>`:

```html
<div class="lpLibraryFilters">
    <select v-model="filterCategory" class="lpLibraryFilterSelect">
        <option value="">All categories</option>
        <option v-for="cat in gearCategories" :key="cat" :value="cat">{{ cat }}</option>
    </select>
    <div class="lpTagFilter">
        <span
            v-for="tag in filterTags"
            :key="tag"
            class="lpTagChip"
        >{{ tag }}<button class="lpTagChipRemove" @click="removeFilterTag(tag)">×</button></span>
        <input
            v-model="tagInput"
            type="text"
            class="lpTagInput"
            placeholder="Filter by tag..."
            @keydown.enter.prevent="addFilterTag"
        />
    </div>
</div>
```

Add to `computed`:

```js
gearCategories() {
    return GEAR_CATEGORIES;
},
```

Add to `methods`:

```js
addFilterTag() {
    const tag = this.tagInput.trim();
    if (tag && !this.filterTags.includes(tag)) {
        this.filterTags.push(tag);
    }
    this.tagInput = '';
},
removeFilterTag(tag) {
    this.filterTags = this.filterTags.filter(t => t !== tag);
},
```

- [ ] **Step 5: Add filter styles to library-items.vue `<style>`**

```scss
.lpLibraryFilters {
    display: flex;
    flex-direction: column;
    gap: 6px;
    margin-bottom: 10px;
}

.lpLibraryFilterSelect {
    background: $color-bg;
    border: 1px solid $color-border;
    border-radius: $radius-sm;
    color: $color-text;
    font-size: $fontSize-sm;
    padding: 4px 6px;
    width: 100%;
    &:focus { border-color: $color-accent; outline: none; }
}

.lpTagFilter {
    align-items: center;
    border: 1px solid $color-border;
    border-radius: $radius-sm;
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
    min-height: 28px;
    padding: 3px 6px;
    &:focus-within { border-color: $color-accent; }
}

.lpTagChip {
    align-items: center;
    background: rgba(var(--color-accent-rgb), 0.12);
    border-radius: 999px;
    color: $color-text;
    display: flex;
    font-size: $fontSize-sm;
    gap: 4px;
    padding: 2px 8px;
}

.lpTagChipRemove {
    background: none;
    border: none;
    color: $color-text-muted;
    cursor: pointer;
    font-size: 14px;
    line-height: 1;
    padding: 0;
    &:hover { color: $color-text; }
}

.lpTagInput {
    background: transparent;
    border: none;
    color: $color-text;
    flex: 1;
    font-size: $fontSize-sm;
    min-width: 80px;
    padding: 2px 0;
    &:focus { outline: none; }
    &::placeholder { color: $color-text-muted; }
}
```

- [ ] **Step 6: Commit**

```bash
git add client/components/library-items.vue
git commit -m "feat: category and tag filters in library sidebar"
```

---

## Task 7: E2E tests

**Files:**
- Create: `test/e2e/smart-gear-library.spec.ts`

- [ ] **Step 1: Write E2E test file**

```typescript
import { test, expect } from '@playwright/test';
import path from 'path';
import { registerUser } from './auth-utils';

const isSuccessfulSave = (response: any) => response.url().includes('/saveLibrary') && response.ok();

test.describe('Smart Gear Library', () => {

    test('autocomplete suggests existing library items when typing', async ({ page }) => {
        const now = Date.now();
        await registerUser(page, `sgl${now}`, 'testtest', `sgl+${now}@lighterpack.com`);

        // Import a list to populate the library
        const csvPath = path.join(process.cwd(), 'test/fixtures/csv/brand-dedup.csv');
        await page.setInputFiles('#csv', csvPath);
        await expect(page.locator('#importValidate')).toBeVisible();
        const importSave = page.waitForResponse(isSuccessfulSave, { timeout: 35000 });
        await page.locator('#importConfirm').click();
        await importSave;

        // Create a new list
        await page.locator('.lpAddList, [data-action="new-list"]').first().click();

        // Click "Add new item" in a category to show input
        const addItemLink = page.locator('.lpAddItem').first();
        await addItemLink.click();

        // Type partial name of an existing item
        const input = page.locator('.lpAddItemInput').first();
        await input.type('Sleep');

        // Suggestions dropdown should appear
        await expect(page.locator('.lpSuggestions')).toBeVisible();
        await expect(page.locator('.lpSuggestion').first()).toContainText('Sleeping Bag');
    });

    test('CSV import with brand column deduplicates matching items', async ({ page }) => {
        const now = Date.now();
        await registerUser(page, `dedup${now}`, 'testtest', `dedup+${now}@lighterpack.com`);

        // First import to populate library
        const csvPath = path.join(process.cwd(), 'test/fixtures/csv/brand-dedup.csv');
        await page.setInputFiles('#csv', csvPath);
        await expect(page.locator('#importValidate')).toBeVisible();
        const firstSave = page.waitForResponse(isSuccessfulSave, { timeout: 35000 });
        await page.locator('#importConfirm').click();
        await firstSave;

        // Second import of same file — should detect duplicates
        await page.setInputFiles('#csv', csvPath);
        await expect(page.locator('#importValidate')).toBeVisible();
        await expect(page.locator('#importValidate')).toContainText('will merge with existing gear');
    });

    test('library sidebar filters by category', async ({ page }) => {
        const now = Date.now();
        await registerUser(page, `filter${now}`, 'testtest', `filter+${now}@lighterpack.com`);

        const csvPath = path.join(process.cwd(), 'test/fixtures/csv/brand-dedup.csv');
        await page.setInputFiles('#csv', csvPath);
        await expect(page.locator('#importValidate')).toBeVisible();
        const importSave = page.waitForResponse(isSuccessfulSave, { timeout: 35000 });
        await page.locator('#importConfirm').click();
        await importSave;

        // Select "Sleep" category filter
        await page.locator('.lpLibraryFilterSelect').selectOption('Sleep');

        // Only Sleep items should be visible
        const visibleItems = page.locator('.lpLibraryItem');
        await expect(visibleItems).toHaveCount(1);
        await expect(visibleItems.first()).toContainText('Sleeping Bag');
    });

});
```

- [ ] **Step 2: Run the tests to confirm they fail (expected at this stage)**

```bash
npx playwright test test/e2e/smart-gear-library.spec.ts --reporter=line
```

Expected: tests fail (features not yet wired end-to-end).

- [ ] **Step 3: Run the full suite to confirm no regressions**

```bash
npx playwright test test/e2e/csv.spec.ts test/e2e/list.spec.ts test/e2e/save-load.spec.ts --reporter=line
```

Expected: all pass.

- [ ] **Step 4: Run smart-gear-library tests again after all tasks complete**

```bash
npx playwright test test/e2e/smart-gear-library.spec.ts --reporter=line
```

Expected: all 3 tests pass.

- [ ] **Step 5: Commit**

```bash
git add test/e2e/smart-gear-library.spec.ts
git commit -m "test: e2e tests for smart gear library features"
```

---

## Self-Review Checklist

- [x] Spec requirement: `brand`, `category`, `tags` on Item → Task 1
- [x] Spec requirement: CSV `brand` column → Task 3
- [x] Spec requirement: autocomplete at manual add → Task 4
- [x] Spec requirement: fuzzy dedup at CSV import → Task 5
- [x] Spec requirement: review screen for ambiguous matches → Task 5 Step 2–3
- [x] Spec requirement: post-import summary → Task 5 Step 5 (`globalAlerts`)
- [x] Spec requirement: library filter by category → Task 6
- [x] Spec requirement: library filter by tags → Task 6
- [x] Spec requirement: rétrocompatibilité → `brand`/`category`/`tags` default to empty, `_match` check in store mutation
- [x] `useGearMatcher` used in both Task 4 (autocomplete) and Task 5 (dedup) — no duplication
- [x] `weightUtils` needed in store.js mutation — note added to check/add require
- [x] `GEAR_CATEGORIES` defined in library-items.vue — not shared with category filter for now (YAGNI)
