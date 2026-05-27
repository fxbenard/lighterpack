#!/usr/bin/env node

const assert = require('assert');

const { Library } = require('../client/dataTypes.js');
const { FEATURES, hasFeature } = require('../client/services/entitlements.js');
const { resolvePublicItemLink } = require('../server/public-sharing.js');

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
library.creator.affiliateRules.push({
    id: 2,
    type: 'domain',
    match: 'zpacks.com',
    affiliateUrl: 'https://example.com/domain-zpacks',
});
library.creator.affiliateRules.push({
    id: 3,
    type: 'shop',
    match: 'Zpacks',
    affiliateUrl: 'https://example.com/shop-zpacks',
});

const firstItem = library.items[0];
firstItem.name = 'Duplex';
firstItem.brand = 'Zpacks';
firstItem.shop = 'Zpacks';
firstItem.url = 'https://www.zpacks.com/products/duplex-tent';
firstItem.affiliateUrl = 'https://example.com/duplex';
firstItem.promoCode = 'DUPLEX10';

const serialized = library.save();
const loaded = new Library();
loaded.load(serialized);

assert.strictEqual(loaded.publicProfile.displayName, 'Trail Tester');
assert.strictEqual(loaded.publicProfile.visibility, 'indexable');
assert.strictEqual(loaded.publicProfile.allowSearchIndexing, true);
assert.strictEqual(loaded.creator.affiliateRules.length, 3);
assert.strictEqual(loaded.items[0].affiliateUrl, 'https://example.com/duplex');
assert.strictEqual(hasFeature(loaded.entitlements, FEATURES.CREATOR_LINKS), true);

let publicLink = resolvePublicItemLink(loaded.items[0], loaded.creator);
assert.strictEqual(publicLink.url, 'https://example.com/duplex');
assert.strictEqual(publicLink.hasAffiliateLink, true);

loaded.items[0].affiliateUrl = '';
publicLink = resolvePublicItemLink(loaded.items[0], loaded.creator);
assert.strictEqual(publicLink.url, 'https://example.com/shop-zpacks');
assert.strictEqual(publicLink.hasAffiliateLink, true);

loaded.items[0].shop = '';
publicLink = resolvePublicItemLink(loaded.items[0], loaded.creator);
assert.strictEqual(publicLink.url, 'https://example.com/domain-zpacks');

loaded.items[0].url = '';
publicLink = resolvePublicItemLink(loaded.items[0], loaded.creator);
assert.strictEqual(publicLink.url, 'https://example.com/zpacks');
assert.strictEqual(publicLink.promoCode, 'LIGHT10');

console.log('LighterPack+ model verification passed');
