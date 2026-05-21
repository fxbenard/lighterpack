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
assertEqual(invalid.acceptedRows, 1, 'invalid fixture accepted row count');
assertEqual(invalid.rejectedRows.length, 3, 'invalid fixture rejected row count');
assertEqual(invalid.rejectedRows[0].reason, 'missing item name', 'missing name reason');
assertEqual(invalid.rejectedRows[1].reason, 'invalid quantity', 'invalid quantity reason');
assertEqual(invalid.rejectedRows[2].reason, 'unsupported unit', 'unsupported unit reason');

console.log('csv roundtrip fixtures: ok');
