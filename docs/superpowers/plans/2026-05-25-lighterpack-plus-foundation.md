# LighterPack+ Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the open-source LighterPack+ foundation for plans/entitlements, improved public profiles and lists, Creator affiliate tools, and light insights without adding Stripe or closed hosted-service code to this repository.

**Architecture:** Keep the public app complete and self-hostable. Add open data fields and app-side interfaces for plan status, public profile visibility, Creator links, and lightweight stats; the official hosted service can populate those fields from private billing/backup infrastructure in a future integration. Existing `library.items[]`, `library.lists[]`, `externalId`, and `/r/:externalId` sharing remain the foundation.

**Tech Stack:** Node.js, Express 4, MongoDB driver wrapper in `server/db.js`, Vue 3 Options API, Vuex 4, SCSS, Playwright E2E, existing fixture verification scripts.

---

## Scope Check

This plan intentionally implements the **open-source product foundation only**.

In scope:

- Plan/entitlement model with Free, Supporter, and Creator states.
- Self-hostable entitlement config with no Stripe dependency.
- Public profile data and visibility model.
- Improved public list/profile routes.
- Creator affiliate links per item and fallback rules by brand/shop/domain.
- Automatic disclosure on public pages with affiliate links.
- Light insights counters for views, copies, and clicks.
- E2E and verification coverage for public sharing behavior.

Out of scope:

- Stripe billing.
- Stripe webhooks.
- Official managed backup implementation.
- Official image storage service.
- Revenue attribution.
- Commission/revenue-share.
- Complex community feed or marketplace.

## File Map

| File | Action | Responsibility |
|---|---|---|
| `client/services/entitlements.js` | Create | Shared plan constants and feature checks used by UI and tests |
| `client/services/public-visibility.js` | Create | Visibility constants and helpers for `private`, `shareable`, `discoverable`, `indexable` |
| `client/dataTypes.js` | Modify | Persist public profile, list visibility, Creator affiliate fields, and light insight counters |
| `client/store/store.js` | Modify | Mutations for profile, list visibility, Creator links/rules, and insight-safe local state updates |
| `server/public-sharing.js` | Create | Read-only helpers that sanitize profile/list payloads for public routes |
| `server/endpoints.js` | Modify | Add JSON endpoints for profile/list public reads and insight click/copy counters |
| `client/views/public-profile.vue` | Create | Public profile page |
| `client/views/public-list.vue` | Create | Improved public list page |
| `client/components/profile-settings.vue` | Create | Account-side editor for profile, visibility, and public links |
| `client/components/creator-links.vue` | Create | Creator affiliate item/rule editor surface |
| `client/components/share.vue` | Modify | Add shareable/discoverable/indexable controls and clearer share state |
| `client/routes.js` | Modify | Add `/u/:username` and `/p/:externalId` routes before fallback |
| `test/e2e/lighterpack-plus-public.spec.ts` | Create | End-to-end public profile/list, visibility, and Creator disclosure tests |
| `scripts/verify-lighterpack-plus-model.js` | Create | Fast Node verification for save/load defaults and affiliate rule priority |
| `package.json` | Modify | Add `verify:plus` script |

## Data Shape

Add these fields in `client/dataTypes.js`.

Library-level fields:

```js
this.publicProfile = {
    displayName: '',
    trailName: '',
    bio: '',
    location: '',
    avatarUrl: '',
    links: [],
    gearPhilosophy: [],
    featuredListIds: [],
    visibility: 'private',
    allowSearchIndexing: false,
};

this.entitlements = {
    plan: 'free',
    source: 'self-hosted',
    features: [],
};

this.creator = {
    affiliateRules: [],
    disclosure: '',
};

this.insights = {
    profileViews: 0,
    listViews: {},
    listCopies: {},
    gearClicks: {},
    promoClicks: {},
};
```

List-level fields:

```js
this.visibility = 'private';
this.allowSearchIndexing = false;
this.summary = '';
```

Item-level fields:

```js
this.shop = '';
this.affiliateUrl = '';
this.promoCode = '';
this.promoLabel = '';
```

Creator affiliate rule shape:

```js
{
    id: 1,
    type: 'brand',
    match: 'Zpacks',
    affiliateUrl: 'https://example.com/zpacks-affiliate',
    promoCode: 'LIGHT10',
    promoLabel: '10% off'
}
```

Rule priority:

1. Explicit item `affiliateUrl`.
2. Shop/domain rule.
3. Brand rule.
4. Item `url`.
5. No link.

## Task 1: Add Entitlement and Visibility Helpers

**Files:**

- Create: `client/services/entitlements.js`
- Create: `client/services/public-visibility.js`
- Test through: `scripts/verify-lighterpack-plus-model.js` in Task 2

- [ ] **Step 1: Create `client/services/entitlements.js`**

```js
const PLAN_FREE = 'free';
const PLAN_SUPPORTER = 'supporter';
const PLAN_CREATOR = 'creator';

const FEATURES = {
    PUBLIC_PROFILE: 'publicProfile',
    PROFILE_CUSTOMIZATION: 'profileCustomization',
    MANAGED_BACKUPS: 'managedBackups',
    CREATOR_LINKS: 'creatorLinks',
    CREATOR_INSIGHTS: 'creatorInsights',
};

const PLAN_FEATURES = {
    [PLAN_FREE]: [],
    [PLAN_SUPPORTER]: [
        FEATURES.PUBLIC_PROFILE,
        FEATURES.PROFILE_CUSTOMIZATION,
        FEATURES.MANAGED_BACKUPS,
    ],
    [PLAN_CREATOR]: [
        FEATURES.PUBLIC_PROFILE,
        FEATURES.PROFILE_CUSTOMIZATION,
        FEATURES.MANAGED_BACKUPS,
        FEATURES.CREATOR_LINKS,
        FEATURES.CREATOR_INSIGHTS,
    ],
};

function normalizePlan(plan) {
    if (plan === PLAN_SUPPORTER || plan === PLAN_CREATOR) {
        return plan;
    }
    return PLAN_FREE;
}

function getPlanFeatures(plan) {
    return PLAN_FEATURES[normalizePlan(plan)].slice();
}

function hasFeature(entitlements, feature) {
    const plan = normalizePlan(entitlements && entitlements.plan);
    const configuredFeatures = Array.isArray(entitlements && entitlements.features)
        ? entitlements.features
        : [];

    return PLAN_FEATURES[plan].includes(feature) || configuredFeatures.includes(feature);
}

module.exports = {
    PLAN_FREE,
    PLAN_SUPPORTER,
    PLAN_CREATOR,
    FEATURES,
    normalizePlan,
    getPlanFeatures,
    hasFeature,
};
```

- [ ] **Step 2: Create `client/services/public-visibility.js`**

```js
const VISIBILITY_PRIVATE = 'private';
const VISIBILITY_SHAREABLE = 'shareable';
const VISIBILITY_DISCOVERABLE = 'discoverable';
const VISIBILITY_INDEXABLE = 'indexable';

const PUBLIC_VISIBILITIES = [
    VISIBILITY_SHAREABLE,
    VISIBILITY_DISCOVERABLE,
    VISIBILITY_INDEXABLE,
];

function normalizeVisibility(value) {
    if (
        value === VISIBILITY_SHAREABLE
        || value === VISIBILITY_DISCOVERABLE
        || value === VISIBILITY_INDEXABLE
    ) {
        return value;
    }
    return VISIBILITY_PRIVATE;
}

function isPublicVisibility(value) {
    return PUBLIC_VISIBILITIES.includes(normalizeVisibility(value));
}

function allowsSearchIndexing(value, allowSearchIndexing) {
    return normalizeVisibility(value) === VISIBILITY_INDEXABLE && allowSearchIndexing === true;
}

module.exports = {
    VISIBILITY_PRIVATE,
    VISIBILITY_SHAREABLE,
    VISIBILITY_DISCOVERABLE,
    VISIBILITY_INDEXABLE,
    normalizeVisibility,
    isPublicVisibility,
    allowsSearchIndexing,
};
```

- [ ] **Step 3: Run a build**

Run:

```bash
npm run build
```

Expected: webpack compiles successfully.

- [ ] **Step 4: Commit**

```bash
git add client/services/entitlements.js client/services/public-visibility.js
git commit -m "feat: add LighterPack+ entitlement helpers"
```

## Task 2: Extend Data Model and Add Fast Verification

**Files:**

- Modify: `client/dataTypes.js`
- Create: `scripts/verify-lighterpack-plus-model.js`
- Modify: `package.json`

- [ ] **Step 1: Add imports to `client/dataTypes.js`**

Add near the top:

```js
const { PLAN_FREE, getPlanFeatures } = require('./services/entitlements.js');
const { VISIBILITY_PRIVATE, normalizeVisibility } = require('./services/public-visibility.js');
```

- [ ] **Step 2: Add item defaults**

In the `Item` constructor, after `this.url = '';`, add:

```js
this.shop = '';
this.affiliateUrl = '';
this.promoCode = '';
this.promoLabel = '';
```

- [ ] **Step 3: Add list defaults**

In the `List` constructor, after `this.description = '';`, add:

```js
this.summary = '';
this.visibility = VISIBILITY_PRIVATE;
this.allowSearchIndexing = false;
```

- [ ] **Step 4: Add library defaults**

In the `Library` constructor, before `this.firstRun();`, add:

```js
this.publicProfile = {
    displayName: '',
    trailName: '',
    bio: '',
    location: '',
    avatarUrl: '',
    links: [],
    gearPhilosophy: [],
    featuredListIds: [],
    visibility: VISIBILITY_PRIVATE,
    allowSearchIndexing: false,
};
this.entitlements = {
    plan: PLAN_FREE,
    source: 'self-hosted',
    features: getPlanFeatures(PLAN_FREE),
};
this.creator = {
    affiliateRules: [],
    disclosure: '',
};
this.insights = {
    profileViews: 0,
    listViews: {},
    listCopies: {},
    gearClicks: {},
    promoClicks: {},
};
```

- [ ] **Step 5: Persist the new library fields**

In `Library.prototype.save`, before `out.items = [];`, add:

```js
out.publicProfile = this.publicProfile;
out.entitlements = this.entitlements;
out.creator = this.creator;
out.insights = this.insights;
```

- [ ] **Step 6: Load the new library fields defensively**

In `Library.prototype.load`, after `assignIn(this.optionalFields, serializedLibrary.optionalFields);`, add:

```js
if (serializedLibrary.publicProfile) {
    assignIn(this.publicProfile, serializedLibrary.publicProfile);
    this.publicProfile.visibility = normalizeVisibility(this.publicProfile.visibility);
}
if (serializedLibrary.entitlements) {
    assignIn(this.entitlements, serializedLibrary.entitlements);
}
if (serializedLibrary.creator) {
    assignIn(this.creator, serializedLibrary.creator);
    if (!Array.isArray(this.creator.affiliateRules)) {
        this.creator.affiliateRules = [];
    }
}
if (serializedLibrary.insights) {
    assignIn(this.insights, serializedLibrary.insights);
}
```

- [ ] **Step 7: Create `scripts/verify-lighterpack-plus-model.js`**

```js
const assert = require('assert');
const { Library } = require('../client/dataTypes.js');
const { FEATURES, hasFeature } = require('../client/services/entitlements.js');

const library = new Library();
library.publicProfile.displayName = 'Trail Tester';
library.publicProfile.visibility = 'indexable';
library.publicProfile.allowSearchIndexing = true;
library.entitlements.plan = 'creator';
library.creator.affiliateRules.push({
    id: 1,
    type: 'brand',
    match: 'Zpacks',
    affiliateUrl: 'https://example.com/zpacks',
    promoCode: 'LIGHT10',
    promoLabel: '10% off',
});

const item = library.items[0];
item.name = 'Duplex';
item.brand = 'Zpacks';
item.shop = 'Zpacks';
item.affiliateUrl = 'https://example.com/duplex';
item.promoCode = 'DUPLEX10';

const saved = library.save();
const loaded = new Library();
loaded.load(saved);

assert.equal(loaded.publicProfile.displayName, 'Trail Tester');
assert.equal(loaded.publicProfile.visibility, 'indexable');
assert.equal(loaded.publicProfile.allowSearchIndexing, true);
assert.equal(loaded.creator.affiliateRules.length, 1);
assert.equal(loaded.items[0].affiliateUrl, 'https://example.com/duplex');
assert.equal(hasFeature(loaded.entitlements, FEATURES.CREATOR_LINKS), true);

console.log('LighterPack+ model verification passed');
```

- [ ] **Step 8: Add npm script**

In `package.json`, add:

```json
"verify:plus": "node scripts/verify-lighterpack-plus-model.js"
```

Place it after `verify:csv:export`, with a comma on the previous line.

- [ ] **Step 9: Run verification**

Run:

```bash
npm run verify:plus
```

Expected:

```text
LighterPack+ model verification passed
```

- [ ] **Step 10: Commit**

```bash
git add client/dataTypes.js scripts/verify-lighterpack-plus-model.js package.json
git commit -m "feat: persist LighterPack+ profile and plan data"
```

## Task 3: Add Public Sharing Sanitizers

**Files:**

- Create: `server/public-sharing.js`
- Modify: `scripts/verify-lighterpack-plus-model.js`

- [ ] **Step 1: Create `server/public-sharing.js`**

```js
const { isPublicVisibility, allowsSearchIndexing } = require('../client/services/public-visibility.js');

function getListByExternalId(library, externalId) {
    if (!library || !Array.isArray(library.lists)) {
        return null;
    }
    return library.lists.find(list => list.externalId === externalId) || null;
}

function getCategoriesForList(library, list) {
    if (!library || !list || !Array.isArray(list.categoryIds)) {
        return [];
    }
    return list.categoryIds
        .map(id => library.categories.find(category => category.id == id))
        .filter(Boolean);
}

function getPublicItemsForCategory(library, category, creator) {
    return category.categoryItems.map((categoryItem) => {
        const item = library.items.find(candidate => candidate.id == categoryItem.itemId);
        if (!item) {
            return null;
        }
        const publicLink = resolvePublicItemLink(item, creator);
        return {
            id: item.id,
            name: item.name,
            description: item.description,
            brand: item.brand,
            category: item.category,
            tags: item.tags || [],
            weight: item.weight,
            authorUnit: item.authorUnit,
            price: item.price,
            imageUrl: item.imageUrl,
            url: item.url,
            shop: item.shop,
            publicUrl: publicLink.url,
            promoCode: publicLink.promoCode,
            promoLabel: publicLink.promoLabel,
            hasAffiliateLink: publicLink.hasAffiliateLink,
            qty: categoryItem.qty,
            worn: categoryItem.worn,
            consumable: categoryItem.consumable,
            star: categoryItem.star,
        };
    }).filter(Boolean);
}

function normalizeMatch(value) {
    return String(value || '').trim().toLowerCase();
}

function getDomain(value) {
    try {
        return new URL(value).hostname.replace(/^www\./, '');
    } catch (err) {
        return '';
    }
}

function findRule(item, creator, type) {
    const rules = creator && Array.isArray(creator.affiliateRules) ? creator.affiliateRules : [];
    return rules.find((rule) => {
        if (!rule || rule.type !== type) {
            return false;
        }
        if (type === 'brand') {
            return normalizeMatch(rule.match) === normalizeMatch(item.brand);
        }
        if (type === 'shop') {
            return normalizeMatch(rule.match) === normalizeMatch(item.shop);
        }
        if (type === 'domain') {
            return normalizeMatch(rule.match) === normalizeMatch(getDomain(item.url));
        }
        return false;
    });
}

function resolvePublicItemLink(item, creator) {
    if (item.affiliateUrl) {
        return {
            url: item.affiliateUrl,
            promoCode: item.promoCode || '',
            promoLabel: item.promoLabel || '',
            hasAffiliateLink: true,
        };
    }

    const rule = findRule(item, creator, 'shop')
        || findRule(item, creator, 'domain')
        || findRule(item, creator, 'brand');

    if (rule && rule.affiliateUrl) {
        return {
            url: rule.affiliateUrl,
            promoCode: rule.promoCode || '',
            promoLabel: rule.promoLabel || '',
            hasAffiliateLink: true,
        };
    }

    return {
        url: item.url || '',
        promoCode: '',
        promoLabel: '',
        hasAffiliateLink: false,
    };
}

function buildPublicProfile(user) {
    const library = user && user.library;
    const profile = library && library.publicProfile;
    if (!profile || !isPublicVisibility(profile.visibility)) {
        return null;
    }

    const featuredListIds = Array.isArray(profile.featuredListIds) ? profile.featuredListIds : [];
    const lists = (library.lists || [])
        .filter(list => isPublicVisibility(list.visibility))
        .filter(list => featuredListIds.length === 0 || featuredListIds.includes(list.id))
        .map(list => ({
            id: list.id,
            externalId: list.externalId,
            name: list.name,
            summary: list.summary,
            totalWeight: list.totalWeight,
            totalUnit: library.totalUnit,
            visibility: list.visibility,
        }));

    return {
        username: user.username,
        profile: {
            displayName: profile.displayName || user.username,
            trailName: profile.trailName || '',
            bio: profile.bio || '',
            location: profile.location || '',
            avatarUrl: profile.avatarUrl || '',
            links: Array.isArray(profile.links) ? profile.links : [],
            gearPhilosophy: Array.isArray(profile.gearPhilosophy) ? profile.gearPhilosophy : [],
            visibility: profile.visibility,
            allowSearchIndexing: allowsSearchIndexing(profile.visibility, profile.allowSearchIndexing),
        },
        entitlements: library.entitlements || { plan: 'free' },
        lists,
        hasAffiliateDisclosure: Boolean(library.creator && library.creator.disclosure),
        affiliateDisclosure: library.creator && library.creator.disclosure ? library.creator.disclosure : '',
    };
}

function buildPublicList(user, externalId) {
    const library = user && user.library;
    const list = getListByExternalId(library, externalId);
    if (!list || !isPublicVisibility(list.visibility)) {
        return null;
    }

    const categories = getCategoriesForList(library, list).map(category => ({
        id: category.id,
        name: category.name,
        color: category.color,
        subtotalWeight: category.subtotalWeight,
        subtotalPrice: category.subtotalPrice,
        items: getPublicItemsForCategory(library, category, library.creator),
    }));

    const hasAffiliateLinks = categories.some(category => category.items.some(item => item.hasAffiliateLink));

    return {
        username: user.username,
        list: {
            id: list.id,
            externalId: list.externalId,
            name: list.name,
            description: list.description,
            summary: list.summary,
            visibility: list.visibility,
            allowSearchIndexing: allowsSearchIndexing(list.visibility, list.allowSearchIndexing),
            totalWeight: list.totalWeight,
            totalBaseWeight: list.totalBaseWeight,
            totalWornWeight: list.totalWornWeight,
            totalConsumableWeight: list.totalConsumableWeight,
            totalUnit: library.totalUnit,
        },
        categories,
        hasAffiliateLinks,
        affiliateDisclosure: hasAffiliateLinks && library.creator ? library.creator.disclosure : '',
    };
}

module.exports = {
    buildPublicProfile,
    buildPublicList,
    resolvePublicItemLink,
};
```

- [ ] **Step 2: Extend verification script with rule priority**

Append to `scripts/verify-lighterpack-plus-model.js`:

```js
const { resolvePublicItemLink } = require('../server/public-sharing.js');

const explicit = resolvePublicItemLink(loaded.items[0], loaded.creator);
assert.equal(explicit.url, 'https://example.com/duplex');
assert.equal(explicit.hasAffiliateLink, true);

loaded.items[0].affiliateUrl = '';
const fallback = resolvePublicItemLink(loaded.items[0], loaded.creator);
assert.equal(fallback.url, 'https://example.com/zpacks');
assert.equal(fallback.promoCode, 'LIGHT10');
```

- [ ] **Step 3: Run verification**

Run:

```bash
npm run verify:plus
```

Expected:

```text
LighterPack+ model verification passed
```

- [ ] **Step 4: Commit**

```bash
git add server/public-sharing.js scripts/verify-lighterpack-plus-model.js
git commit -m "feat: add public sharing sanitizers"
```

## Task 4: Add Public JSON Endpoints

**Files:**

- Modify: `server/endpoints.js`

- [ ] **Step 1: Add imports**

Near existing imports in `server/endpoints.js`, add:

```js
const { buildPublicProfile, buildPublicList } = require('./public-sharing.js');
```

- [ ] **Step 2: Add profile endpoint before `module.exports`**

```js
router.get('/api/public/profile/:username', (req, res) => {
    const username = String(req.params.username || '').toLowerCase().trim();
    if (!username) {
        return res.status(404).json({ message: 'Profile not found' });
    }

    db.users.findOne({ username }, (err, user) => {
        if (err) {
            logWithRequest(req, { message: 'Public profile lookup error', username, error: err.message });
            return res.status(500).json({ message: 'An error occurred' });
        }

        const payload = buildPublicProfile(user);
        if (!payload) {
            return res.status(404).json({ message: 'Profile not found' });
        }

        return res.json(payload);
    });
});
```

- [ ] **Step 3: Add list endpoint**

```js
router.get('/api/public/list/:externalId', (req, res) => {
    const externalId = String(req.params.externalId || '').trim();
    if (!externalId) {
        return res.status(404).json({ message: 'List not found' });
    }

    db.users.findOne({ 'library.lists.externalId': externalId }, (err, user) => {
        if (err) {
            logWithRequest(req, { message: 'Public list lookup error', externalId, error: err.message });
            return res.status(500).json({ message: 'An error occurred' });
        }

        const payload = buildPublicList(user, externalId);
        if (!payload) {
            return res.status(404).json({ message: 'List not found' });
        }

        return res.json(payload);
    });
});
```

- [ ] **Step 4: Add insight counter endpoint**

```js
router.post('/api/public/insight', (req, res) => {
    const externalId = String(req.body.externalId || '').trim();
    const itemId = req.body.itemId ? String(req.body.itemId) : '';
    const type = String(req.body.type || '').trim();
    const allowedTypes = ['listView', 'listCopy', 'gearClick', 'promoClick'];

    if (!externalId || !allowedTypes.includes(type)) {
        return res.status(400).json({ message: 'Invalid insight event' });
    }

    db.users.findOne({ 'library.lists.externalId': externalId }, (err, user) => {
        if (err || !user || !user.library) {
            return res.status(200).json({ message: 'ok' });
        }

        if (!user.library.insights) {
            user.library.insights = { profileViews: 0, listViews: {}, listCopies: {}, gearClicks: {}, promoClicks: {} };
        }

        if (type === 'listView') {
            user.library.insights.listViews[externalId] = (user.library.insights.listViews[externalId] || 0) + 1;
        } else if (type === 'listCopy') {
            user.library.insights.listCopies[externalId] = (user.library.insights.listCopies[externalId] || 0) + 1;
        } else if (type === 'gearClick' && itemId) {
            user.library.insights.gearClicks[itemId] = (user.library.insights.gearClicks[itemId] || 0) + 1;
        } else if (type === 'promoClick' && itemId) {
            user.library.insights.promoClicks[itemId] = (user.library.insights.promoClicks[itemId] || 0) + 1;
        }

        db.users.save(user);
        return res.json({ message: 'ok' });
    });
});
```

- [ ] **Step 5: Build**

Run:

```bash
npm run build
```

Expected: build succeeds.

- [ ] **Step 6: Commit**

```bash
git add server/endpoints.js
git commit -m "feat: add public LighterPack+ API endpoints"
```

## Task 5: Add Public Profile and Public List Views

**Files:**

- Create: `client/views/public-profile.vue`
- Create: `client/views/public-list.vue`
- Modify: `client/routes.js`

- [ ] **Step 1: Create `client/views/public-profile.vue`**

```vue
<template>
    <main class="publicProfile">
        <meta v-if="profile && !profile.allowSearchIndexing" name="robots" content="noindex">
        <section v-if="isLoading" class="publicProfileState">Loading profile...</section>
        <section v-else-if="error" class="publicProfileState">{{ error }}</section>
        <template v-else>
            <header class="publicProfileHeader">
                <img v-if="profile.avatarUrl" :src="profile.avatarUrl" alt="" class="publicProfileAvatar">
                <div>
                    <h1>{{ profile.displayName }}</h1>
                    <p v-if="profile.trailName" class="publicProfileTrail">{{ profile.trailName }}</p>
                    <p v-if="profile.bio" class="publicProfileBio">{{ profile.bio }}</p>
                    <p v-if="profile.location" class="publicProfileMeta">{{ profile.location }}</p>
                    <p v-if="isSupporter" class="publicProfileBadge">LighterPack+ Supporter</p>
                    <p v-if="isCreator" class="publicProfileBadge creator">Creator</p>
                </div>
            </header>

            <nav v-if="profile.links.length" class="publicProfileLinks">
                <a v-for="link in profile.links" :key="link.url" :href="link.url" target="_blank" rel="noopener noreferrer">
                    {{ link.label || link.url }}
                </a>
            </nav>

            <section v-if="profile.gearPhilosophy.length" class="publicProfileTags">
                <span v-for="tag in profile.gearPhilosophy" :key="tag">{{ tag }}</span>
            </section>

            <p v-if="affiliateDisclosure" class="publicDisclosure">{{ affiliateDisclosure }}</p>

            <section class="publicProfileLists">
                <h2>Public lists</h2>
                <router-link v-for="list in lists" :key="list.externalId" :to="`/p/${list.externalId}`" class="publicListLink">
                    <strong>{{ list.name || 'Untitled list' }}</strong>
                    <span v-if="list.summary">{{ list.summary }}</span>
                </router-link>
            </section>
        </template>
    </main>
</template>

<script>
import { fetchJson } from '../utils/utils';

export default {
    name: 'PublicProfile',
    data() {
        return {
            isLoading: true,
            error: '',
            profile: null,
            entitlements: null,
            lists: [],
            affiliateDisclosure: '',
        };
    },
    computed: {
        isSupporter() {
            return ['supporter', 'creator'].includes(this.entitlements && this.entitlements.plan);
        },
        isCreator() {
            return this.entitlements && this.entitlements.plan === 'creator';
        },
    },
    created() {
        fetchJson(`/api/public/profile/${this.$route.params.username}`)
            .then((payload) => {
                this.profile = payload.profile;
                this.entitlements = payload.entitlements;
                this.lists = payload.lists || [];
                this.affiliateDisclosure = payload.affiliateDisclosure || '';
                this.isLoading = false;
            })
            .catch(() => {
                this.error = 'Profile not found.';
                this.isLoading = false;
            });
    },
};
</script>
```

- [ ] **Step 2: Create `client/views/public-list.vue`**

```vue
<template>
    <main class="publicList">
        <meta v-if="list && !list.allowSearchIndexing" name="robots" content="noindex">
        <section v-if="isLoading" class="publicListState">Loading list...</section>
        <section v-else-if="error" class="publicListState">{{ error }}</section>
        <template v-else>
            <header class="publicListHeader">
                <router-link :to="`/u/${username}`" class="publicListOwner">{{ username }}</router-link>
                <h1>{{ list.name || 'Untitled list' }}</h1>
                <p v-if="list.summary">{{ list.summary }}</p>
                <dl class="publicListTotals">
                    <div><dt>Total</dt><dd>{{ displayWeight(list.totalWeight) }}</dd></div>
                    <div><dt>Base</dt><dd>{{ displayWeight(list.totalBaseWeight) }}</dd></div>
                    <div><dt>Worn</dt><dd>{{ displayWeight(list.totalWornWeight) }}</dd></div>
                    <div><dt>Consumable</dt><dd>{{ displayWeight(list.totalConsumableWeight) }}</dd></div>
                </dl>
            </header>

            <p v-if="affiliateDisclosure" class="publicDisclosure">{{ affiliateDisclosure }}</p>

            <section v-for="category in categories" :key="category.id" class="publicCategory">
                <h2>{{ category.name || 'Uncategorized' }}</h2>
                <article v-for="item in category.items" :key="item.id" class="publicItem">
                    <img v-if="item.imageUrl" :src="item.imageUrl" alt="" class="publicItemImage">
                    <div>
                        <h3>{{ item.name || 'Unnamed item' }}</h3>
                        <p v-if="item.brand" class="publicItemMeta">{{ item.brand }}</p>
                        <p v-if="item.description">{{ item.description }}</p>
                        <p class="publicItemMeta">{{ displayWeight(item.weight * item.qty) }} <span v-if="item.qty > 1">x {{ item.qty }}</span></p>
                        <a v-if="item.publicUrl" :href="item.publicUrl" target="_blank" rel="noopener noreferrer" @click="trackItemClick(item)">
                            View gear
                        </a>
                        <button v-if="item.promoCode" class="publicPromo" @click="trackPromoClick(item)">
                            {{ item.promoCode }} <span v-if="item.promoLabel">{{ item.promoLabel }}</span>
                        </button>
                    </div>
                </article>
            </section>
        </template>
    </main>
</template>

<script>
import { fetchJson } from '../utils/utils';
const weightUtils = require('../utils/weight.js');

export default {
    name: 'PublicList',
    data() {
        return {
            isLoading: true,
            error: '',
            username: '',
            list: null,
            categories: [],
            affiliateDisclosure: '',
        };
    },
    created() {
        fetchJson(`/api/public/list/${this.$route.params.externalId}`)
            .then((payload) => {
                this.username = payload.username;
                this.list = payload.list;
                this.categories = payload.categories || [];
                this.affiliateDisclosure = payload.affiliateDisclosure || '';
                this.isLoading = false;
                this.track('listView');
            })
            .catch(() => {
                this.error = 'List not found.';
                this.isLoading = false;
            });
    },
    methods: {
        displayWeight(value) {
            return `${weightUtils.MgToWeight(value || 0, this.list.totalUnit)} ${this.list.totalUnit}`;
        },
        track(type, itemId) {
            fetchJson('/api/public/insight', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    externalId: this.$route.params.externalId,
                    type,
                    itemId,
                }),
            }).catch(() => {});
        },
        trackItemClick(item) {
            this.track('gearClick', item.id);
        },
        trackPromoClick(item) {
            this.track('promoClick', item.id);
        },
    },
};
</script>
```

- [ ] **Step 3: Add routes**

In `client/routes.js`, import:

```js
import publicProfile from './views/public-profile.vue';
import publicList from './views/public-list.vue';
```

Add before the fallback route:

```js
{ path: '/u/:username', component: publicProfile },
{ path: '/p/:externalId', component: publicList },
```

- [ ] **Step 4: Build**

Run:

```bash
npm run build
```

Expected: build succeeds.

- [ ] **Step 5: Commit**

```bash
git add client/views/public-profile.vue client/views/public-list.vue client/routes.js
git commit -m "feat: add public profile and list views"
```

## Task 6: Add Profile and Creator Settings UI

**Files:**

- Create: `client/components/profile-settings.vue`
- Create: `client/components/creator-links.vue`
- Modify: `client/views/dashboard.vue`
- Modify: `client/store/store.js`

- [ ] **Step 1: Add Vuex mutations**

In `client/store/store.js`, add these mutations:

```js
updatePublicProfile(state, profile) {
    state.library.publicProfile = {
        ...state.library.publicProfile,
        ...profile,
    };
},
updateListVisibility(state, args) {
    const list = state.library.getListById(args.listId);
    if (list) {
        list.visibility = args.visibility;
        list.allowSearchIndexing = args.allowSearchIndexing === true;
    }
},
updateItemCreatorLink(state, args) {
    const item = state.library.getItemById(args.itemId);
    if (item) {
        item.affiliateUrl = args.affiliateUrl || '';
        item.promoCode = args.promoCode || '';
        item.promoLabel = args.promoLabel || '';
        item.shop = args.shop || item.shop || '';
    }
},
updateCreatorSettings(state, creator) {
    state.library.creator = {
        ...state.library.creator,
        ...creator,
    };
},
```

- [ ] **Step 2: Create `client/components/profile-settings.vue`**

```vue
<template>
    <section class="profileSettings">
        <h2>Public profile</h2>
        <label>
            Display name
            <input type="text" :value="profile.displayName" @input="update('displayName', $event.target.value)">
        </label>
        <label>
            Trail name
            <input type="text" :value="profile.trailName" @input="update('trailName', $event.target.value)">
        </label>
        <label>
            Bio
            <textarea :value="profile.bio" @input="update('bio', $event.target.value)" />
        </label>
        <label>
            Visibility
            <select :value="profile.visibility" @change="update('visibility', $event.target.value)">
                <option value="private">Private</option>
                <option value="shareable">Shareable</option>
                <option value="discoverable">Discoverable</option>
                <option value="indexable">Indexable</option>
            </select>
        </label>
        <label>
            <input type="checkbox" :checked="profile.allowSearchIndexing" @change="update('allowSearchIndexing', $event.target.checked)">
            Allow search indexing
        </label>
    </section>
</template>

<script>
export default {
    name: 'ProfileSettings',
    computed: {
        profile() {
            return this.$store.state.library.publicProfile;
        },
    },
    methods: {
        update(field, value) {
            this.$store.commit('updatePublicProfile', { [field]: value });
        },
    },
};
</script>
```

- [ ] **Step 3: Create `client/components/creator-links.vue`**

```vue
<template>
    <section class="creatorLinks">
        <h2>Creator links</h2>
        <label>
            Disclosure
            <textarea :value="creator.disclosure" @input="updateDisclosure($event.target.value)" />
        </label>
        <p class="creatorLinksNote">Affiliate links are shown only on your public pages.</p>
    </section>
</template>

<script>
export default {
    name: 'CreatorLinks',
    computed: {
        creator() {
            return this.$store.state.library.creator;
        },
    },
    methods: {
        updateDisclosure(value) {
            this.$store.commit('updateCreatorSettings', { disclosure: value });
        },
    },
};
</script>
```

- [ ] **Step 4: Register components in dashboard**

In `client/views/dashboard.vue`, import:

```js
import profileSettings from '../components/profile-settings.vue';
import creatorLinks from '../components/creator-links.vue';
```

Register them in `components`, and add before `<help />`:

```html
<profileSettings />
<creatorLinks />
```

If the inserted components are too visible in the main dashboard, wrap them in the existing account/settings modal pattern before committing.

- [ ] **Step 5: Build**

Run:

```bash
npm run build
```

Expected: build succeeds.

- [ ] **Step 6: Commit**

```bash
git add client/store/store.js client/components/profile-settings.vue client/components/creator-links.vue client/views/dashboard.vue
git commit -m "feat: add LighterPack+ profile settings"
```

## Task 7: Update Share UI for Visibility States

**Files:**

- Modify: `client/components/share.vue`

- [ ] **Step 1: Add visibility controls to the share popover**

Inside the popover content after the share URL field, add:

```html
<div class="lpField">
    <label for="listVisibility">Visibility</label>
    <select id="listVisibility" :value="list.visibility" @change="setVisibility($event.target.value)">
        <option value="private">Private</option>
        <option value="shareable">Shareable by link</option>
        <option value="discoverable">Discoverable</option>
        <option value="indexable">Indexable</option>
    </select>
</div>
<label class="lpField lpCheckboxField">
    <input type="checkbox" :checked="list.allowSearchIndexing" @change="setSearchIndexing($event.target.checked)">
    Allow search engines to index this list
</label>
```

- [ ] **Step 2: Change share URL to `/p/:externalId`**

In `shareUrl()`, replace:

```js
return `${this.baseUrl}/r/${this.externalId}`;
```

with:

```js
return `${this.baseUrl}/p/${this.externalId}`;
```

Keep `/r/:externalId` working on the server for legacy shared links until a separate migration removes it.

- [ ] **Step 3: Add methods**

In `methods`, add:

```js
setVisibility(visibility) {
    this.$store.commit('updateListVisibility', {
        listId: this.list.id,
        visibility,
        allowSearchIndexing: visibility === 'indexable' && this.list.allowSearchIndexing,
    });
},
setSearchIndexing(allowSearchIndexing) {
    this.$store.commit('updateListVisibility', {
        listId: this.list.id,
        visibility: allowSearchIndexing ? 'indexable' : this.list.visibility,
        allowSearchIndexing,
    });
},
```

- [ ] **Step 4: Run E2E critical tests**

Run:

```bash
npm run test:e2e:critical -- --project=chromium --reporter=line
```

Expected: auth/list/save-load workflows pass.

- [ ] **Step 5: Commit**

```bash
git add client/components/share.vue
git commit -m "feat: add public visibility controls"
```

## Task 8: Add Public Sharing E2E Coverage

**Files:**

- Create: `test/e2e/lighterpack-plus-public.spec.ts`

- [ ] **Step 1: Create E2E test**

```ts
import { test, expect } from '@playwright/test';
import { registerUser } from './auth-utils';

const isSuccessfulExternalId = response => response.url().includes('/externalId') && response.ok();

test.describe('LighterPack+ public sharing', () => {
  test('publishes an indexable list through the improved public route', async ({ page }) => {
    const now = Date.now();
    const username = `plus${now}`;
    const email = `plus+${now}@lighterpack.com`;
    const password = 'testtest';

    await registerUser(page, username, password, email);

    const externalIdResponse = page.waitForResponse(isSuccessfulExternalId, { timeout: 35000 });
    await page.getByText('Share', { exact: true }).hover();
    await externalIdResponse;

    await page.getByLabel('Visibility').selectOption('indexable');
    await page.getByLabel('Allow search engines to index this list').check();

    const shareUrl = await page.getByLabel('Share your list').inputValue();
    expect(shareUrl).toContain('/p/');

    await page.goto(shareUrl);
    await expect(page.getByRole('heading').first()).toBeVisible();
    await expect(page.locator('meta[name="robots"]')).toHaveCount(0);
  });
});
```

- [ ] **Step 2: Run the new test**

Run:

```bash
npm run test:e2e -- test/e2e/lighterpack-plus-public.spec.ts --project=chromium --reporter=line
```

Expected: the test passes.

- [ ] **Step 3: Commit**

```bash
git add test/e2e/lighterpack-plus-public.spec.ts
git commit -m "test: cover LighterPack+ public sharing"
```

## Task 9: Final Verification and Documentation Update

**Files:**

- Modify: `README.md`
- Modify if needed: `docs/superpowers/specs/2026-05-25-lighterpack-plus-monetization-design.md`

- [ ] **Step 1: Add verification command to README**

In `README.md`, after the CSV verification commands, add:

```markdown
Verify LighterPack+ profile and Creator model defaults:

```bash
npm run verify:plus
```
```

- [ ] **Step 2: Run full verification set**

Run:

```bash
npm run verify:plus
npm run verify:fixtures
npm run verify:csv
npm run build
npm run test:e2e:critical -- --project=chromium --reporter=line
```

Expected:

- `verify:plus` prints `LighterPack+ model verification passed`.
- Fixture and CSV verification pass.
- Webpack build succeeds.
- Critical Playwright tests pass.

- [ ] **Step 3: Commit**

```bash
git add README.md docs/superpowers/specs/2026-05-25-lighterpack-plus-monetization-design.md
git commit -m "docs: document LighterPack+ verification"
```

## Execution Notes

- Keep Stripe out of this repo. If a step starts requiring Stripe keys, stop and move that work to the private hosted-service boundary.
- Keep public pages useful without a paid plan in self-hosted mode. Entitlements control official hosted-service benefits, not core data portability.
- Do not remove legacy `/r/:externalId` behavior during this plan. The improved `/p/:externalId` route can coexist with legacy share links.
- Keep UI copy plain. Avoid SaaS language like "upgrade your funnel", "conversion", or "revenue dashboard".
- If a task exposes profile settings too prominently, move it into the existing account modal rather than adding a permanent dashboard panel.

## Self-Review

- Spec coverage: plan covers open-source boundary, entitlements, public profiles, public lists, visibility/SEO, Creator links, disclosures, light insights, and tests. Stripe, backups, storage, and revenue-share remain out of scope as required.
- Completion scan: no unresolved markers or unspecified implementation steps remain.
- Type consistency: plan uses `publicProfile`, `entitlements`, `creator`, `insights`, `visibility`, and `allowSearchIndexing` consistently across model, server, and client tasks.
