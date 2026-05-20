#!/usr/bin/env node

const { escapeCsvField } = require('../server/csv.js');

function assertEqual(actual, expected, message) {
    if (actual !== expected) {
        throw new Error(`${message}: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
    }
}

assertEqual(escapeCsvField('plain'), 'plain', 'plain field');
assertEqual(escapeCsvField(''), '', 'empty field');
assertEqual(escapeCsvField(null), '', 'null field');
assertEqual(escapeCsvField('Tente, ultra légère'), '"Tente, ultra légère"', 'comma field');
assertEqual(escapeCsvField('He said "light"'), '"He said ""light"""', 'quoted field');
assertEqual(escapeCsvField('line one\nline two'), '"line one\nline two"', 'newline field');

const row = [
    'Tente, ultra légère',
    'Shelter',
    'He said "light"',
    1,
    925,
    'gram',
].map(escapeCsvField).join(',');

assertEqual(row, '"Tente, ultra légère",Shelter,"He said ""light""",1,925,gram', 'joined row');

console.log('csv export escaping: ok');
