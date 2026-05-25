#!/usr/bin/env node

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

const firstItem = library.items[0];
firstItem.name = 'Duplex';
firstItem.brand = 'Zpacks';
firstItem.shop = 'Zpacks';
firstItem.affiliateUrl = 'https://example.com/duplex';
firstItem.promoCode = 'DUPLEX10';

const serialized = library.save();
const loaded = new Library();
loaded.load(serialized);

assert.strictEqual(loaded.publicProfile.displayName, 'Trail Tester');
assert.strictEqual(loaded.publicProfile.visibility, 'indexable');
assert.strictEqual(loaded.publicProfile.allowSearchIndexing, true);
assert.strictEqual(loaded.creator.affiliateRules.length, 1);
assert.strictEqual(loaded.items[0].affiliateUrl, 'https://example.com/duplex');
assert.strictEqual(hasFeature(loaded.entitlements, FEATURES.CREATOR_LINKS), true);

console.log('LighterPack+ model verification passed');
