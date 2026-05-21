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

function findById(collection, id) {
    return collection.find((candidate) => candidate.id === id);
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

    const defaultList = findById(saved.lists, saved.defaultListId);
    if (!defaultList) {
        throw new Error(`${fileName}: defaultListId does not point to a list`);
    }

    saved.lists.forEach((list) => {
        list.categoryIds.forEach((categoryId) => {
            const category = findById(saved.categories, categoryId);
            if (!category) {
                throw new Error(`${fileName}: list ${list.id} references missing category ${categoryId}`);
            }
        });
    });

    saved.categories.forEach((category) => {
        category.categoryItems.forEach((categoryItem) => {
            const item = findById(saved.items, categoryItem.itemId);
            if (!item) {
                throw new Error(`${fileName}: category ${category.id} references missing item ${categoryItem.itemId}`);
            }
        });
    });

    console.log(`${fileName}: ok`);
}

fixtureFiles.forEach(verifyFixture);
