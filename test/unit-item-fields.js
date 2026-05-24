/**
 * Unit test: Item constructor must expose brand, category, tags fields.
 * Run with: node test/unit-item-fields.js
 */

const { Item } = require('../client/dataTypes.js');

let passed = 0;
let failed = 0;

function assert(description, condition) {
    if (condition) {
        console.log(`  PASS  ${description}`);
        passed++;
    } else {
        console.error(`  FAIL  ${description}`);
        failed++;
    }
}

console.log('\n--- Item constructor defaults ---');

const item = new Item({ id: 1 });

assert('brand defaults to empty string', item.brand === '');
assert('category defaults to empty string', item.category === '');
assert('tags defaults to empty array', Array.isArray(item.tags) && item.tags.length === 0);

console.log('\n--- Item.prototype.load backward compatibility ---');

const item2 = new Item({ id: 2 });
// Simulate loading old data that has no brand/category/tags
item2.load({ id: 2, name: 'Old Item', weight: 100 });

assert('brand survives load of old data (keeps default)', item2.brand === '');
assert('category survives load of old data (keeps default)', item2.category === '');
assert('tags survives load of old data (keeps default)', Array.isArray(item2.tags) && item2.tags.length === 0);

console.log('\n--- Item.prototype.load with new fields ---');

const item3 = new Item({ id: 3 });
item3.load({ id: 3, name: 'New Item', brand: 'Zpacks', category: 'shelter', tags: ['ultralight', 'dcf'] });

assert('brand loaded from new data', item3.brand === 'Zpacks');
assert('category loaded from new data', item3.category === 'shelter');
assert('tags loaded from new data', Array.isArray(item3.tags) && item3.tags[0] === 'ultralight');

console.log('\n--- Item.prototype.save includes new fields ---');

const item4 = new Item({ id: 4 });
item4.brand = 'Hyperlite';
item4.category = 'pack';
item4.tags = ['waterproof'];
const saved = item4.save();

assert('save includes brand', saved.brand === 'Hyperlite');
assert('save includes category', saved.category === 'pack');
assert('save includes tags', Array.isArray(saved.tags) && saved.tags[0] === 'waterproof');

console.log(`\nResults: ${passed} passed, ${failed} failed\n`);
process.exit(failed > 0 ? 1 : 0);
