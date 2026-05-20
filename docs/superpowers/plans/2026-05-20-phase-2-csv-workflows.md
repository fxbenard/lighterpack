# Phase 2 CSV Workflows Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make CSV import/export predictable, visible, and regression-tested for user data fields.

**Architecture:** Keep the current Vue 2, Express, MongoDB, and library document model. Add focused CSV fixtures and Node verification scripts first, then improve import parsing feedback and preview UI, then cover browser-level import/export/share behavior with Playwright.

**Tech Stack:** Vue 2, Vuex, Express, CommonJS utilities, Playwright, Node scripts.

---

## File Structure

- Create: `test/fixtures/csv/roundtrip-rich.csv`
  - Rich CSV fixture containing accents, quoted commas, long URL, zero price, worn, consumable, and quantity `0`.
- Create: `test/fixtures/csv/import-invalid.csv`
  - Invalid CSV fixture used to verify rejected-row reporting.
- Create: `scripts/verify-csv-roundtrip.js`
  - Node script that parses CSV fixtures and asserts exact imported field values.
- Modify: `package.json`
  - Add `verify:csv` so CSV checks can run without a browser.
- Modify: `client/utils/csv-import.js`
  - Return `data`, `acceptedRows`, `rejectedRows`, and `errors` while preserving the existing `data` contract.
- Modify: `client/components/import-csv.vue`
  - Show accepted/rejected counts and actionable rejected-row messages in the import preview.
- Modify: `server/views.js`
  - Centralize CSV escaping so exported rows always quote commas, quotes, and line breaks safely.
- Create: `test/e2e/csv.spec.ts`
  - Browser test for CSV import preview, import persistence, CSV export, and public share rendering.
- Modify: `README.md`
  - Document the new CSV verification command and the import/export fields it protects.

## Task 1: CSV Fixture Verification

**Files:**
- Create: `test/fixtures/csv/roundtrip-rich.csv`
- Create: `test/fixtures/csv/import-invalid.csv`
- Create: `scripts/verify-csv-roundtrip.js`
- Modify: `package.json`

- [ ] **Step 1: Add the rich round-trip fixture**

Create `test/fixtures/csv/roundtrip-rich.csv`:

```csv
Item Name,Category,desc,qty,weight,unit,url,price,worn,consumable
"Tente, ultra légère",Shelter,"Double paroi, 2 places",1,925,gram,https://example.com/tente?model=ul&color=bleu,299.95,,Consumable
Backpack (Sac à dos),Backpack & containers,Simond MT900 UL,1,880,g,https://example.com/backpack,0,,
Rain jacket,Clothing,Stored but not packed,0,210,g,https://example.com/rain-jacket,79.5,Worn,
Fuel canister,Cooking,"100g fuel, threaded",2,110,g,https://example.com/fuel,6.5,,Consumable
```

- [ ] **Step 2: Add the invalid-row fixture**

Create `test/fixtures/csv/import-invalid.csv`:

```csv
Item Name,Category,desc,qty,weight,unit,url,price,worn,consumable
Valid spoon,Cooking,Titanium spoon,1,12,g,https://example.com/spoon,11.95,,
,Cooking,Missing name,1,20,g,https://example.com/missing-name,1,,
No quantity,Cooking,Missing qty,,20,g,https://example.com/no-qty,1,,
Bad unit,Cooking,Unsupported unit,1,20,stone,https://example.com/bad-unit,1,,
```

- [ ] **Step 3: Add the verifier script**

Create `scripts/verify-csv-roundtrip.js`:

```js
#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const { parseImportCsv } = require('../client/utils/csv-import.js');

function readFixture(fileName) {
    return fs.readFileSync(path.join(__dirname, '../test/fixtures/csv', fileName), 'utf8');
}

function assertEqual(actual, expected, message) {
    if (actual !== expected) {
        throw new Error(`${message}: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
    }
}

function assertApprox(actual, expected, message) {
    if (Math.abs(actual - expected) > 0.0001) {
        throw new Error(`${message}: expected ${expected}, got ${actual}`);
    }
}

const rich = parseImportCsv(readFixture('roundtrip-rich.csv'), 'roundtrip rich');
assertEqual(rich.data.length, 4, 'rich fixture item count');

const tent = rich.data[0];
assertEqual(tent.name, 'Tente, ultra légère', 'quoted comma item name');
assertEqual(tent.category, 'Shelter', 'category');
assertEqual(tent.description, 'Double paroi, 2 places', 'quoted comma description');
assertEqual(tent.qty, 1, 'quantity');
assertEqual(tent.weight, 925, 'weight');
assertEqual(tent.unit, 'g', 'unit alias');
assertEqual(tent.url, 'https://example.com/tente?model=ul&color=bleu', 'long url');
assertApprox(tent.price, 299.95, 'price');
assertEqual(tent.worn, false, 'worn false');
assertEqual(tent.consumable, true, 'consumable true');

const backpack = rich.data[1];
assertEqual(backpack.name, 'Backpack (Sac à dos)', 'accented backpack name');
assertEqual(backpack.price, 0, 'zero price');

const rainJacket = rich.data[2];
assertEqual(rainJacket.qty, 0, 'quantity zero is preserved');
assertEqual(rainJacket.worn, true, 'worn marker');

const invalid = parseImportCsv(readFixture('import-invalid.csv'), 'import invalid');
assertEqual(invalid.data.length, 1, 'invalid fixture accepted item count');

console.log('csv roundtrip fixtures: ok');
```

- [ ] **Step 4: Add the npm script**

In `package.json`, add:

```json
"verify:csv": "node scripts/verify-csv-roundtrip.js"
```

- [ ] **Step 5: Run the verifier**

Run:

```bash
npm run verify:csv
```

Expected:

```text
csv roundtrip fixtures: ok
```

- [ ] **Step 6: Commit**

```bash
git add package.json scripts/verify-csv-roundtrip.js test/fixtures/csv/roundtrip-rich.csv test/fixtures/csv/import-invalid.csv
git commit -m "test: add csv fixture checks"
```

## Task 2: Import Rejection Feedback

**Files:**
- Modify: `client/utils/csv-import.js`
- Modify: `scripts/verify-csv-roundtrip.js`
- Modify: `client/components/import-csv.vue`

- [ ] **Step 1: Extend parser output**

Update `parseImportCsv` so it initializes:

```js
const importData = {
    data: [],
    name,
    acceptedRows: 0,
    rejectedRows: [],
    errors: [],
};
```

For each rejected row, push an object:

```js
importData.rejectedRows.push({ rowNumber, reason });
```

Keep `importData.data` unchanged for existing Vuex compatibility.

- [ ] **Step 2: Validate rejected reasons in the script**

Extend `scripts/verify-csv-roundtrip.js` to assert:

```js
assertEqual(invalid.acceptedRows, 1, 'invalid fixture accepted row count');
assertEqual(invalid.rejectedRows.length, 3, 'invalid fixture rejected row count');
assertEqual(invalid.rejectedRows[0].reason, 'missing item name', 'missing name reason');
assertEqual(invalid.rejectedRows[1].reason, 'invalid quantity', 'invalid quantity reason');
assertEqual(invalid.rejectedRows[2].reason, 'unsupported unit', 'unsupported unit reason');
```

- [ ] **Step 3: Show counts and row errors in the modal**

In `client/components/import-csv.vue`, add a summary above `#importData`:

```html
<p class="importSummary">
    {{ acceptedRowCount }} accepted<span v-if="rejectedRowCount">, {{ rejectedRowCount }} rejected</span>
</p>
<ul v-if="rejectedRowCount" class="importErrors">
    <li v-for="row in importData.rejectedRows" :key="row.rowNumber">
        Row {{ row.rowNumber }}: {{ row.reason }}
    </li>
</ul>
```

Add computed properties:

```js
acceptedRowCount() {
    return this.importData.acceptedRows || this.importItemCount;
},
rejectedRowCount() {
    return this.importData.rejectedRows ? this.importData.rejectedRows.length : 0;
},
```

- [ ] **Step 4: Run focused checks**

Run:

```bash
npm run verify:csv
npm run build
```

Expected: both commands pass.

- [ ] **Step 5: Commit**

```bash
git add client/components/import-csv.vue client/utils/csv-import.js scripts/verify-csv-roundtrip.js
git commit -m "feat: report csv import rows"
```

## Task 3: CSV Export Escaping

**Files:**
- Modify: `server/views.js`
- Create: `scripts/verify-csv-export.js`
- Modify: `package.json`

- [ ] **Step 1: Extract CSV field escaping**

In `server/views.js`, add:

```js
function escapeCsvField(field) {
    const value = field == null ? '' : `${field}`;
    if (/[",\r\n]/.test(value)) {
        return `"${value.replace(/"/g, '""')}"`;
    }
    return value;
}
```

Replace the inline export escaping loop with:

```js
out += itemRow.map(escapeCsvField).join(',');
```

- [ ] **Step 2: Add an export verifier**

Create `scripts/verify-csv-export.js` that imports or locally mirrors `escapeCsvField` and asserts commas, quotes, and line breaks are escaped.

- [ ] **Step 3: Add script and run**

Add:

```json
"verify:csv:export": "node scripts/verify-csv-export.js"
```

Run:

```bash
npm run verify:csv:export
npm run build
```

Expected: both commands pass.

- [ ] **Step 4: Commit**

```bash
git add package.json scripts/verify-csv-export.js server/views.js
git commit -m "fix: quote csv export fields"
```

## Task 4: Browser CSV Round Trip

**Files:**
- Create: `test/e2e/csv.spec.ts`
- Modify: `package.json`

- [ ] **Step 1: Add the Playwright test**

Create `test/e2e/csv.spec.ts` to:

1. Register a user.
2. Upload `test/fixtures/csv/roundtrip-rich.csv`.
3. Assert the import modal shows 4 accepted rows and no rejected rows.
4. Confirm import.
5. Wait for `/saveLibrary`.
6. Generate a share URL.
7. Verify the share page contains item names, link icons, prices, worn/consumable-visible rows, and the quantity `0` row.
8. Fetch `/csv/:externalId` and assert exported CSV includes all imported rows.

- [ ] **Step 2: Add critical CSV test script**

In `package.json`, add:

```json
"test:e2e:csv": "playwright test test/e2e/csv.spec.ts"
```

- [ ] **Step 3: Run the CSV browser test**

Run:

```bash
npm run test:e2e:csv -- --project=chromium --reporter=line
```

Expected: the CSV test passes.

- [ ] **Step 4: Commit**

```bash
git add package.json test/e2e/csv.spec.ts
git commit -m "test: cover csv browser flow"
```

## Task 5: Documentation And Final Verification

**Files:**
- Modify: `README.md`
- Modify: `docs/superpowers/specs/2026-05-19-lighterpack-roadmap-design.md`

- [ ] **Step 1: Document CSV checks**

Add to `README.md`:

```bash
npm run verify:csv
npm run verify:csv:export
npm run test:e2e:csv -- --project=chromium --reporter=line
```

State that these protect item name, category, description, quantity, weight, unit, URL, price, worn, and consumable fields.

- [ ] **Step 2: Mark Phase 2 execution path**

Update the roadmap spec with a short note linking this plan:

```markdown
Phase 2 implementation plan: `docs/superpowers/plans/2026-05-20-phase-2-csv-workflows.md`.
```

- [ ] **Step 3: Run final checks**

Run:

```bash
npm run verify:fixtures
npm run verify:csv
npm run verify:csv:export
npm run build
npm run test:e2e:critical -- --project=chromium --reporter=line
npm run test:e2e:csv -- --project=chromium --reporter=line
```

Expected: all commands pass.

- [ ] **Step 4: Commit**

```bash
git add README.md docs/superpowers/specs/2026-05-19-lighterpack-roadmap-design.md
git commit -m "docs: add csv workflow checks"
```

## Self-Review

- Spec coverage: The plan covers CSV import/export round-trip tests, field preservation, import preview counts, accepted/rejected feedback, invalid CSV fixtures, public share verification, and no data model changes.
- Placeholder scan: No task uses TBD, TODO, or unspecified implementation language.
- Type consistency: `parseImportCsv` keeps `data` and adds `acceptedRows`, `rejectedRows`, and `errors`; Vue reads those properties defensively.
