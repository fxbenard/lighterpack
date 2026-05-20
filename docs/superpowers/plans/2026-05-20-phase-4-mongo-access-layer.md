# Phase 4 Mongo Access Layer Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove the remaining `mongojs` dependency path and standardize backend and maintenance scripts on a single MongoDB access layer without changing the LighterPack data model or user-visible behavior.

**Architecture:** Keep MongoDB as the persistence engine and keep the current document-shaped `user.library` model. Expand `server/db.js` into a small compatibility layer that supports both the legacy callback shape already used by routes and a more explicit helper API for scripts. Migrate server call sites first, then migrate standalone scripts, then delete `mongojs`.

**Tech Stack:** Node.js, Express, MongoDB official driver, Playwright, existing fixture verification scripts.

---

## File Structure

- Modify: `server/db.js`
  - Expand the wrapper so it exposes explicit helpers for `findMany`, `findOne`, `save`, `deleteOne`, `deleteMany`, and database readiness.
- Modify: `server/auth.js`
  - Switch auth lookups to explicit single-user reads where only one user is expected.
- Modify: `server/endpoints.js`
  - Replace broad `find(...)[0]` patterns with the explicit wrapper API and preserve existing responses.
- Modify: `server/moderation-endpoints.js`
  - Migrate moderation lookups and writes to the same wrapper API.
- Modify: `server/views.js`
  - Use the same explicit read helpers for shared-list rendering and CSV export routes.
- Create: `scripts/_mongo.js`
  - Provide a script-focused Mongo helper with clean connect/close semantics for one-off maintenance commands.
- Modify: `scripts/fix-uppercase-users.js`
- Modify: `scripts/find-duplicates.js`
- Modify: `scripts/compare-rendered-totals.js`
- Modify: `scripts/fix-users-with-dangling-spaces.js`
- Modify: `scripts/load-all-libraries.js`
  - Migrate each script off `mongojs` and onto `scripts/_mongo.js`.
- Modify: `package.json`
  - Remove `mongojs` after all call sites are migrated.
- Modify: `package-lock.json`
  - Reflect dependency removal.
- Modify: `docs/superpowers/specs/2026-05-19-lighterpack-roadmap-design.md`
  - Link this plan from the modernization section.

### Task 1: Expand The Shared Mongo Wrapper

**Files:**
- Modify: `server/db.js`

- [ ] **Step 1: Add a focused verification script placeholder**

Document the target verification command up front:

```bash
node -e "const db=require('./server/db.js'); db.ready.then(() => db.users.findOne({ username: '__missing__' }, (err, user) => { console.log(err ? 'ERR' : 'OK', user === null); process.exit(err ? 1 : 0); }));"
```

Expected: `OK true`

- [ ] **Step 2: Add explicit helper methods while preserving callbacks**

Refactor `server/db.js` toward this shape:

```js
function normalizeId(value) {
    return typeof value === 'string' ? new ObjectId(value) : value;
}

function collection(name) {
    return {
        find(query, callback) {
            _db.collection(name).find(query).toArray()
                .then((docs) => callback(null, docs))
                .catch((err) => callback(err, null));
        },
        findMany(query) {
            return _db.collection(name).find(query).toArray();
        },
        findOne(query, callback) {
            const op = _db.collection(name).findOne(query);
            if (!callback) {
                return op;
            }
            return op.then((doc) => callback(null, doc))
                .catch((err) => callback(err, null));
        },
        save(doc, callback) {
            const { _id, ...rest } = doc;
            const filter = _id ? { _id: normalizeId(_id) } : { _id: new ObjectId() };
            return _db.collection(name).findOneAndUpdate(
                filter,
                { $set: rest },
                { upsert: true, returnDocument: 'after' }
            )
                .then((result) => {
                    if (!doc._id && result?._id) {
                        doc._id = result._id;
                    }
                    if (callback) {
                        callback(null, result);
                    }
                    return result;
                })
                .catch((err) => {
                    if (callback) {
                        callback(err);
                        return null;
                    }
                    throw err;
                });
        },
        deleteOne(filter) {
            return _db.collection(name).deleteOne(filter._id ? { _id: normalizeId(filter._id) } : filter);
        },
        deleteMany(filter) {
            return _db.collection(name).deleteMany(filter);
        },
        remove(doc, justOne, callback) {
            const filter = doc._id ? { _id: normalizeId(doc._id) } : doc;
            const op = justOne ? this.deleteOne(filter) : this.deleteMany(filter);
            return op.then((result) => {
                if (callback) {
                    callback(null, result);
                }
                return result;
            }).catch((err) => {
                if (callback) {
                    callback(err);
                    return null;
                }
                throw err;
            });
        },
    };
}
```

- [ ] **Step 3: Export a readiness promise for scripts and future tests**

Add a readiness export:

```js
const ready = connect();

ready.catch((err) => {
    console.error('MongoDB connection failed:', err);
    process.exit(1);
});

module.exports = {
    ready,
    users: collection('users'),
    libraries: collection('libraries'),
};
```

- [ ] **Step 4: Run the focused wrapper verification**

Run:

```bash
node -e "const db=require('./server/db.js'); db.ready.then(() => db.users.findOne({ username: '__missing__' }, (err, user) => { console.log(err ? 'ERR' : 'OK', user === null); process.exit(err ? 1 : 0); }));"
```

Expected: `OK true`

- [ ] **Step 5: Commit**

```bash
git add server/db.js
git commit -m "refactor: expand mongo wrapper"
```

### Task 2: Migrate Server Reads To Explicit Single-User Access

**Files:**
- Modify: `server/auth.js`
- Modify: `server/endpoints.js`
- Modify: `server/moderation-endpoints.js`
- Modify: `server/views.js`

- [ ] **Step 1: Replace single-record callback arrays in auth**

Convert patterns like this:

```js
db.users.find({ token: req.cookies.lp }, (err, users) => {
    if (!users || !users.length) {
        return res.status(404).json({ message: 'Please log in again.' });
    }
    callback(req, res, users[0]);
});
```

Into this:

```js
db.users.findOne({ token: req.cookies.lp }, (err, user) => {
    if (!user) {
        return res.status(404).json({ message: 'Please log in again.' });
    }
    callback(req, res, user);
});
```

- [ ] **Step 2: Replace single-record callback arrays in endpoints and moderation**

Apply the same migration anywhere the code immediately uses `users[0]`, including:

```js
db.users.findOne({ username }, (err, user) => {
    if (err) {
        return res.status(500).json({ message: 'An error occurred' });
    }
    if (!user) {
        return res.status(400).json({ message: 'An error occurred' });
    }
    // existing behavior unchanged
});
```

- [ ] **Step 3: Keep share-list collision checks on multi-read API**

Do not change routes that legitimately need a list of matches, such as:

```js
db.users.find({ 'library.lists.externalId': id }, (err, users) => {
    if (!users.length) {
        // generate and save new external id
    }
});
```

- [ ] **Step 4: Run targeted browser verification only for affected flows**

Run:

```bash
npx playwright test test/e2e/list.spec.ts --project=chromium --reporter=line
npx playwright test test/e2e/save-load.spec.ts --project=chromium --reporter=line
```

Expected: both commands pass

- [ ] **Step 5: Commit**

```bash
git add server/auth.js server/endpoints.js server/moderation-endpoints.js server/views.js test/e2e/save-load.spec.ts
git commit -m "refactor: tighten mongo reads"
```

### Task 3: Migrate Standalone Maintenance Scripts

**Files:**
- Create: `scripts/_mongo.js`
- Modify: `scripts/fix-uppercase-users.js`
- Modify: `scripts/find-duplicates.js`
- Modify: `scripts/compare-rendered-totals.js`
- Modify: `scripts/fix-users-with-dangling-spaces.js`
- Modify: `scripts/load-all-libraries.js`

- [ ] **Step 1: Add a script-local Mongo helper with explicit lifecycle**

Create `scripts/_mongo.js`:

```js
const { MongoClient } = require('mongodb');
const config = require('config');

const databaseUrl = config.get('databaseUrl');
const url = `mongodb://${databaseUrl}`;
const dbName = databaseUrl.split('/').pop();

async function withDb(run) {
    const client = new MongoClient(url);
    await client.connect();

    try {
        return await run(client.db(dbName));
    } finally {
        await client.close();
    }
}

module.exports = {
    withDb,
};
```

- [ ] **Step 2: Convert one simple script first**

Refactor `scripts/fix-uppercase-users.js` from `mongojs` callbacks to:

```js
const { withDb } = require('./_mongo');

withDb(async (db) => {
    const users = await db.collection('users')
        .find({ username: { $regex: '[A-Z]' } })
        .toArray();

    for (const user of users) {
        user.username = user.username.toLowerCase();
        await db.collection('users').replaceOne({ _id: user._id }, user);
    }
}).catch((err) => {
    console.error(err);
    process.exit(1);
});
```

- [ ] **Step 3: Convert the remaining scripts without broad rewrites**

Use the same `withDb(async (db) => { ... })` pattern for the remaining `mongojs` scripts. Keep their logic intact; only change data access and lifecycle management.

- [ ] **Step 4: Run script-level smoke checks**

Run:

```bash
node scripts/load-all-libraries.js
node scripts/find-duplicates.js
```

Expected: scripts start, query MongoDB via the official driver, and exit without `mongojs` errors

- [ ] **Step 5: Commit**

```bash
git add scripts/_mongo.js scripts/fix-uppercase-users.js scripts/find-duplicates.js scripts/compare-rendered-totals.js scripts/fix-users-with-dangling-spaces.js scripts/load-all-libraries.js
git commit -m "refactor: migrate mongo scripts"
```

### Task 4: Remove `mongojs` And Lock The Dependency Surface

**Files:**
- Modify: `package.json`
- Modify: `package-lock.json`

- [ ] **Step 1: Remove the dependency**

Update `package.json` by deleting:

```json
"mongojs": "^2.2.2"
```

- [ ] **Step 2: Refresh the lockfile**

Run:

```bash
npm install
```

Expected: `mongojs` and its nested legacy `mongodb@2.x` tree disappear from `package-lock.json`

- [ ] **Step 3: Prove the package is fully gone**

Run:

```bash
rg -n "mongojs" package.json package-lock.json server scripts
```

Expected: no dependency or application code references remain in those paths

- [ ] **Step 4: Commit**

```bash
git add package.json package-lock.json
git commit -m "refactor: drop mongojs dependency"
```

### Task 5: Final Verification And Documentation

**Files:**
- Modify: `docs/superpowers/specs/2026-05-19-lighterpack-roadmap-design.md`

- [ ] **Step 1: Link this plan from the roadmap**

Add under `MongoDB To PostgreSQL JSONB`:

```markdown
Phase 4 implementation plan: `docs/superpowers/plans/2026-05-20-phase-4-mongo-access-layer.md`.
```

- [ ] **Step 2: Run only the targeted checks for this phase**

Run:

```bash
node scripts/verify-library-fixtures.js
npx playwright test test/e2e/list.spec.ts --project=chromium --reporter=line
npx playwright test test/e2e/save-load.spec.ts --project=chromium --reporter=line
```

Expected: all commands pass

- [ ] **Step 3: Commit**

```bash
git add docs/superpowers/specs/2026-05-19-lighterpack-roadmap-design.md
git commit -m "docs: add phase 4 mongo plan"
```

## Self-Review

- Spec coverage: This plan covers the roadmap’s Mongo audit direction, the full `mongojs` removal path, and targeted non-regression checks without pulling Vue 3 or PostgreSQL into the same effort.
- Placeholder scan: Each task names exact files, commands, and verification scope. The script migration task intentionally keeps logic stable and limits change to persistence access.
- Type consistency: The wrapper API is consistently described as `find`, `findMany`, `findOne`, `save`, `deleteOne`, `deleteMany`, and `remove`.
