# Phase 1 Data And Local Stabilization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make local development reproducible and protect existing LighterPack user libraries with critical tests, fixtures, and backup/export tooling.

**Architecture:** Keep the existing Vue 2, Express, and MongoDB architecture. Add focused test helpers, fixtures, and scripts around the current data model instead of changing persistence behavior. Document the exact local runtime and keep data migration work to an audit.

**Tech Stack:** Node.js, Express, Vue 2, Vuex, MongoDB, Playwright, npm scripts, CommonJS utility scripts.

---

## File Structure

- Modify `README.md` to document local setup, ports, MongoDB requirements, test commands, and backup workflow.
- Modify `package.json` to add explicit scripts for e2e tests and library backup/export verification.
- Create `test/fixtures/library-rich.json` as a realistic saved library document with categories, items, links, price, worn, consumable, and zero-quantity data.
- Create `test/fixtures/library-minimal.json` as the smallest valid current library document.
- Create `test/e2e/save-load.spec.ts` for register, edit, save, reload, and data persistence coverage.
- Create `scripts/export-user-library.js` to export one user library by username from MongoDB to a JSON file.
- Create `scripts/verify-library-fixtures.js` to load fixtures through `client/dataTypes.js` and verify save/load structure stability.
- Create `docs/data-migration-audit.md` to document the current Mongo library shape and future PostgreSQL JSONB migration constraints.

## Task 1: Document Reproducible Local Development

**Files:**
- Modify: `README.md`

- [ ] **Step 1: Replace the current run section with explicit local setup**

Update `README.md` so the "How to run Lighterpack" section contains:

```markdown
How to run LighterPack locally
-----------

1. Install Node.js, npm, and MongoDB.
2. Install dependencies:

   ```bash
   npm install
   ```

3. Start MongoDB locally. The default config expects MongoDB at `localhost/lighterpack`.

   ```bash
   mongod
   ```

4. Start the development server:

   ```bash
   npm run dev
   ```

5. Open the app at:

   ```text
   http://localhost:8080
   ```

Local ports
-----------

- `8080`: webpack development server and browser entrypoint.
- `3001`: Express API server when `config/local.json` is present.
- `3000`: Express API default from `config/default.json`.

If login shows `NetworkError when attempting to fetch resource`, verify that both the webpack dev server and the Express API are running.
```

- [ ] **Step 2: Add testing and backup documentation**

Append this section below the local ports section:

```markdown
Critical checks
-----------

Run the production build:

```bash
npm run build
```

Run the Playwright end-to-end tests:

```bash
npm run test:e2e
```

Verify library fixtures:

```bash
npm run verify:fixtures
```

Export a user's library for backup:

```bash
node scripts/export-user-library.js <username> <output-file>
```

Example:

```bash
node scripts/export-user-library.js testuser ./backup-testuser-library.json
```
```

- [ ] **Step 3: Run a documentation diff review**

Run:

```bash
git diff -- README.md
```

Expected: README only documents setup, ports, critical checks, and backup/export commands. It must not describe Vue 3 or PostgreSQL migration as completed work.

- [ ] **Step 4: Commit**

```bash
git add README.md
git commit -m "docs: clarify local setup"
```

## Task 2: Add Library Fixtures And Structural Verification

**Files:**
- Create: `test/fixtures/library-minimal.json`
- Create: `test/fixtures/library-rich.json`
- Create: `scripts/verify-library-fixtures.js`
- Modify: `package.json`

- [ ] **Step 1: Create the minimal fixture**

Create `test/fixtures/library-minimal.json`:

```json
{
  "version": "0.3",
  "idMap": {},
  "items": [
    {
      "id": 3,
      "name": "",
      "description": "",
      "weight": 0,
      "authorUnit": "oz",
      "price": 0,
      "image": "",
      "imageUrl": "",
      "url": ""
    }
  ],
  "categories": [
    {
      "id": 2,
      "name": "",
      "categoryItems": [
        {
          "qty": 1,
          "worn": 0,
          "consumable": false,
          "star": 0,
          "itemId": 3
        }
      ],
      "subtotalWeight": 0,
      "subtotalWornWeight": 0,
      "subtotalConsumableWeight": 0,
      "subtotalPrice": 0,
      "subtotalConsumablePrice": 0,
      "subtotalQty": 1
    }
  ],
  "lists": [
    {
      "id": 1,
      "name": "",
      "categoryIds": [
        2
      ],
      "chart": null,
      "description": "",
      "externalId": "",
      "totalWeight": 0,
      "totalWornWeight": 0,
      "totalConsumableWeight": 0,
      "totalBaseWeight": 0,
      "totalPackWeight": 0,
      "totalPrice": 0,
      "totalConsumablePrice": 0,
      "totalQty": 1
    }
  ],
  "sequence": 3,
  "defaultListId": 1,
  "totalUnit": "oz",
  "itemUnit": "oz",
  "showSidebar": true,
  "showImages": false,
  "optionalFields": {
    "images": false,
    "price": false,
    "worn": true,
    "consumable": true,
    "listDescription": false
  },
  "currencySymbol": "$"
}
```

- [ ] **Step 2: Create the rich fixture**

Create `test/fixtures/library-rich.json`:

```json
{
  "version": "0.3",
  "idMap": {},
  "items": [
    {
      "id": 3,
      "name": "Backpack",
      "description": "Main pack",
      "weight": 880000,
      "authorUnit": "g",
      "price": 250,
      "image": "",
      "imageUrl": "",
      "url": "https://example.com/backpack"
    },
    {
      "id": 4,
      "name": "Rain jacket",
      "description": "Worn layer",
      "weight": 138000,
      "authorUnit": "g",
      "price": 40,
      "image": "",
      "imageUrl": "",
      "url": "https://example.com/jacket"
    },
    {
      "id": 5,
      "name": "Fuel canister",
      "description": "Consumable fuel",
      "weight": 394000,
      "authorUnit": "g",
      "price": 5,
      "image": "",
      "imageUrl": "",
      "url": ""
    },
    {
      "id": 6,
      "name": "Optional camera",
      "description": "Zero quantity item",
      "weight": 500000,
      "authorUnit": "g",
      "price": 0,
      "image": "",
      "imageUrl": "",
      "url": ""
    }
  ],
  "categories": [
    {
      "id": 2,
      "name": "Pack",
      "categoryItems": [
        {
          "qty": 1,
          "worn": 0,
          "consumable": false,
          "star": 1,
          "itemId": 3
        },
        {
          "qty": 0,
          "worn": 0,
          "consumable": false,
          "star": 0,
          "itemId": 6
        }
      ],
      "subtotalWeight": 880000,
      "subtotalWornWeight": 0,
      "subtotalConsumableWeight": 0,
      "subtotalPrice": 250,
      "subtotalConsumablePrice": 0,
      "subtotalQty": 1
    },
    {
      "id": 7,
      "name": "Clothing",
      "categoryItems": [
        {
          "qty": 1,
          "worn": true,
          "consumable": false,
          "star": 0,
          "itemId": 4
        }
      ],
      "subtotalWeight": 138000,
      "subtotalWornWeight": 138000,
      "subtotalConsumableWeight": 0,
      "subtotalPrice": 40,
      "subtotalConsumablePrice": 0,
      "subtotalQty": 1
    },
    {
      "id": 8,
      "name": "Cooking",
      "categoryItems": [
        {
          "qty": 1,
          "worn": 0,
          "consumable": true,
          "star": 0,
          "itemId": 5
        }
      ],
      "subtotalWeight": 394000,
      "subtotalWornWeight": 0,
      "subtotalConsumableWeight": 394000,
      "subtotalPrice": 5,
      "subtotalConsumablePrice": 5,
      "subtotalQty": 1
    }
  ],
  "lists": [
    {
      "id": 1,
      "name": "Fixture list",
      "categoryIds": [
        2,
        7,
        8
      ],
      "chart": null,
      "description": "A realistic fixture for data safety checks.",
      "externalId": "fixture-list",
      "totalWeight": 1412000,
      "totalWornWeight": 138000,
      "totalConsumableWeight": 394000,
      "totalBaseWeight": 880000,
      "totalPackWeight": 1274000,
      "totalPrice": 295,
      "totalConsumablePrice": 5,
      "totalQty": 3
    }
  ],
  "sequence": 8,
  "defaultListId": 1,
  "totalUnit": "g",
  "itemUnit": "g",
  "showSidebar": true,
  "showImages": false,
  "optionalFields": {
    "images": false,
    "price": true,
    "worn": true,
    "consumable": true,
    "listDescription": true
  },
  "currencySymbol": "$"
}
```

- [ ] **Step 3: Write the fixture verification script**

Create `scripts/verify-library-fixtures.js`:

```js
const fs = require('fs');
const path = require('path');

const { Library } = require('../client/dataTypes.js');

const fixtureDir = path.join(__dirname, '../test/fixtures');
const fixtureFiles = [
    'library-minimal.json',
    'library-rich.json',
];

function loadFixture(fileName) {
    const fixturePath = path.join(fixtureDir, fileName);
    return JSON.parse(fs.readFileSync(fixturePath, 'utf8'));
}

function verifyFixture(fileName) {
    const input = loadFixture(fileName);
    const library = new Library();
    library.load(input);
    const saved = library.save();

    if (!saved.lists.length) {
        throw new Error(`${fileName}: expected at least one list`);
    }
    if (!saved.categories.length) {
        throw new Error(`${fileName}: expected at least one category`);
    }
    if (!saved.items.length) {
        throw new Error(`${fileName}: expected at least one item`);
    }
    if (!saved.optionalFields) {
        throw new Error(`${fileName}: expected optionalFields`);
    }

    const list = saved.lists.find((candidate) => candidate.id === saved.defaultListId);
    if (!list) {
        throw new Error(`${fileName}: defaultListId does not point to a list`);
    }

    list.categoryIds.forEach((categoryId) => {
        const category = saved.categories.find((candidate) => candidate.id === categoryId);
        if (!category) {
            throw new Error(`${fileName}: missing category ${categoryId}`);
        }
        category.categoryItems.forEach((categoryItem) => {
            const item = saved.items.find((candidate) => candidate.id === categoryItem.itemId);
            if (!item) {
                throw new Error(`${fileName}: missing item ${categoryItem.itemId}`);
            }
        });
    });

    console.log(`${fileName}: ok`);
}

fixtureFiles.forEach(verifyFixture);
```

- [ ] **Step 4: Add npm scripts**

Modify `package.json` scripts to include:

```json
"test:e2e": "playwright test",
"test:e2e:critical": "playwright test test/e2e/auth.spec.ts test/e2e/list.spec.ts test/e2e/save-load.spec.ts",
"verify:fixtures": "node scripts/verify-library-fixtures.js"
```

Keep existing scripts unchanged.

- [ ] **Step 5: Run fixture verification**

Run:

```bash
npm run verify:fixtures
```

Expected:

```text
library-minimal.json: ok
library-rich.json: ok
```

- [ ] **Step 6: Commit**

```bash
git add package.json test/fixtures scripts/verify-library-fixtures.js
git commit -m "test: add library fixture checks"
```

## Task 3: Add Save/Reload E2E Coverage

**Files:**
- Create: `test/e2e/save-load.spec.ts`

- [ ] **Step 1: Write the failing save/reload test**

Create `test/e2e/save-load.spec.ts`:

```ts
import { test, expect } from '@playwright/test';

import { registerUser } from './auth-utils';

test.describe('Save and reload tests', () => {
  test('should preserve list edits after reload', async ({ page }) => {
    const now = Date.now();
    const username = `save${now}`;
    const email = `save+${now}@lighterpack.com`;
    const password = 'testtest';
    const listName = `Saved List ${now}`;
    const itemName = 'Saved Backpack';
    const itemDescription = 'Still here after reload';

    await registerUser(page, username, password, email);

    await page.getByPlaceholder('List Name').fill(listName);
    await page.locator('.lpItem .lpName').first().fill(itemName);
    await page.locator('.lpItem .lpDescription').first().fill(itemDescription);
    await page.locator('.lpItem .lpWeight').first().fill('880');
    await page.locator('.lpItem .lpQty').first().fill('2');

    await expect(async () => {
      await page.reload();
      await expect(page.getByPlaceholder('List Name')).toHaveValue(listName);
      await expect(page.locator('.lpItem .lpName').first()).toHaveValue(itemName);
      await expect(page.locator('.lpItem .lpDescription').first()).toHaveValue(itemDescription);
      await expect(page.locator('.lpItem .lpQty').first()).toHaveValue('2');
    }).toPass({ timeout: 35000 });
  });
});
```

- [ ] **Step 2: Run the save/reload test to verify current behavior**

Run:

```bash
npx playwright test test/e2e/save-load.spec.ts --project=chromium
```

Expected: PASS if the existing debounce save completes within the retry window. If it fails because the server cannot bind ports in the agent sandbox, rerun from a normal terminal with MongoDB running and record the result in the task notes.

- [ ] **Step 3: If the test fails due to selector drift, adjust only selectors**

If Playwright cannot find `.lpItem .lpWeight` or `.lpItem .lpQty`, inspect `client/components/item.vue` and update the selectors to the rendered classes shown there. Do not change application behavior in this task.

- [ ] **Step 4: Run the critical e2e suite**

Run:

```bash
npm run test:e2e:critical -- --project=chromium
```

Expected: auth, list, and save-load tests pass.

- [ ] **Step 5: Commit**

```bash
git add test/e2e/save-load.spec.ts
git commit -m "test: cover save reload flow"
```

## Task 4: Add User Library Export Script

**Files:**
- Create: `scripts/export-user-library.js`
- Modify: `README.md`

- [ ] **Step 1: Write the export script**

Create `scripts/export-user-library.js`:

```js
const fs = require('fs');
const path = require('path');
const { MongoClient } = require('mongodb');
const config = require('config');

const username = process.argv[2];
const outputPath = process.argv[3];

if (!username || !outputPath) {
    console.error('Usage: node scripts/export-user-library.js <username> <output-file>');
    process.exit(1);
}

const databaseUrl = config.get('databaseUrl');
const url = `mongodb://${databaseUrl}`;
const dbName = databaseUrl.split('/').pop();

async function main() {
    const client = new MongoClient(url);
    await client.connect();

    try {
        const db = client.db(dbName);
        const user = await db.collection('users').findOne({ username: username.toLowerCase().trim() });

        if (!user) {
            console.error(`No user found for username: ${username}`);
            process.exitCode = 2;
            return;
        }
        if (!user.library) {
            console.error(`User has no library: ${username}`);
            process.exitCode = 3;
            return;
        }

        const resolvedOutputPath = path.resolve(outputPath);
        fs.writeFileSync(resolvedOutputPath, `${JSON.stringify(user.library, null, 2)}\n`, 'utf8');
        console.log(`Exported ${username} library to ${resolvedOutputPath}`);
    } finally {
        await client.close();
    }
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
```

- [ ] **Step 2: Document the script behavior**

In `README.md`, ensure the backup section says:

```markdown
The export script writes only the user's `library` document. It does not export password hashes, tokens, email addresses, or account metadata.
```

- [ ] **Step 3: Run the script usage path**

Run:

```bash
node scripts/export-user-library.js
```

Expected exit: non-zero, with:

```text
Usage: node scripts/export-user-library.js <username> <output-file>
```

- [ ] **Step 4: Run the script against a missing user**

Run with MongoDB running:

```bash
node scripts/export-user-library.js missing-user /tmp/missing-user-library.json
```

Expected exit: `2`, with:

```text
No user found for username: missing-user
```

- [ ] **Step 5: Commit**

```bash
git add scripts/export-user-library.js README.md
git commit -m "feat: add library export script"
```

## Task 5: Document Mongo Shape And PostgreSQL JSONB Migration Audit

**Files:**
- Create: `docs/data-migration-audit.md`

- [ ] **Step 1: Create the audit document**

Create `docs/data-migration-audit.md`:

```markdown
# Data Migration Audit

## Current Storage

LighterPack currently stores user libraries inside MongoDB user documents.

Important user document fields:

- `username`
- `email`
- `password`
- `token`
- `syncToken`
- `library`
- `externalIds`

The `library` object is the user data source of truth.

## Current Library Shape

The current library document is represented by `client/dataTypes.js`.

Top-level fields:

- `version`
- `idMap`
- `items`
- `categories`
- `lists`
- `sequence`
- `defaultListId`
- `totalUnit`
- `itemUnit`
- `showSidebar`
- `showImages`
- `optionalFields`
- `currencySymbol`

Relationships:

- `lists[].categoryIds[]` points to `categories[].id`.
- `categories[].categoryItems[].itemId` points to `items[].id`.
- `defaultListId` points to `lists[].id`.

## Data Safety Risks

- Missing item references can cause category items to be pruned during load.
- IDs can be strings or numbers in older data.
- Optional fields may be absent in older library versions.
- Totals are derived and can be recalculated, but persisted values still exist in documents.
- Auth metadata and user library data currently live in the same Mongo user document.

## PostgreSQL JSONB Target

Recommended future target:

```sql
CREATE TABLE users (
  id uuid PRIMARY KEY,
  username text UNIQUE NOT NULL,
  email text UNIQUE NOT NULL,
  password_hash text NOT NULL,
  token text,
  sync_token integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE libraries (
  user_id uuid PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  data jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
```

This preserves the current `library` document model while separating account metadata from library data.

## Required Non-Regression Checks Before Migration

- Export every Mongo user library before migration.
- Load every exported library through `Library.load()`.
- Save every loaded library through `Library.save()`.
- Verify every `defaultListId`, `categoryIds`, and `itemId` reference.
- Compare item count, category count, list count, and optional field keys before and after migration.
- Run auth, save/reload, share, CSV import/export, and fixture verification tests.

## Out Of Scope For Phase 1

- Performing the migration.
- Replacing MongoDB in runtime code.
- Changing the library data model.
- Changing authentication schema.
```

- [ ] **Step 2: Review audit against current dataTypes**

Run:

```bash
rg -n "this\\.version|this\\.items|this\\.categories|this\\.lists|optionalFields|defaultListId" client/dataTypes.js
```

Expected: output confirms the audit lists the top-level library fields.

- [ ] **Step 3: Commit**

```bash
git add docs/data-migration-audit.md
git commit -m "docs: audit library data model"
```

## Task 6: Final Phase 1 Verification

**Files:**
- No new files expected.

- [ ] **Step 1: Run fixture verification**

Run:

```bash
npm run verify:fixtures
```

Expected:

```text
library-minimal.json: ok
library-rich.json: ok
```

- [ ] **Step 2: Run build**

Run:

```bash
npm run build
```

Expected: webpack compiles successfully.

- [ ] **Step 3: Run critical e2e tests**

Run with MongoDB available:

```bash
npm run test:e2e:critical -- --project=chromium
```

Expected: auth, list, and save-load tests pass.

- [ ] **Step 4: Confirm Git state**

Run:

```bash
git status -sb
```

Expected: clean working tree after all task commits.

- [ ] **Step 5: Push the branch**

Run:

```bash
git push
```

Expected: local `main` pushes to `origin/main`.
