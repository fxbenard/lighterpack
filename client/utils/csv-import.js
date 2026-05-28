const unitAliases = {
    ounce: 'oz',
    ounces: 'oz',
    oz: 'oz',
    pound: 'lb',
    pounds: 'lb',
    lb: 'lb',
    lbs: 'lb',
    gram: 'g',
    grams: 'g',
    g: 'g',
    kilogram: 'kg',
    kilograms: 'kg',
    kg: 'kg',
    kgs: 'kg',
};

function parseCsvRows(strData) {
    const strDelimiter = ',';
    const arrData = [[]];
    let arrMatches = null;

    const objPattern = new RegExp(
        (
            `(\\${strDelimiter}|\\r?\\n|\\r|^)`
            + '(?:"([^"]*(?:""[^"]*)*)"|'
            + `([^"\\${strDelimiter}\\r\\n]*))`
        ), 'gi',
    );

    arrMatches = objPattern.exec(strData);
    while (arrMatches) {
        const strMatchedDelimiter = arrMatches[1];
        if (strMatchedDelimiter.length && (strMatchedDelimiter !== strDelimiter)) {
            arrData.push([]);
        }

        let strMatchedValue;
        if (arrMatches[2]) {
            strMatchedValue = arrMatches[2].replace(new RegExp('""', 'g'), '"');
        } else {
            strMatchedValue = arrMatches[3];
        }

        arrData[arrData.length - 1].push(strMatchedValue);
        arrMatches = objPattern.exec(strData);
    }

    return arrData;
}

function normalizeField(value) {
    return typeof value === 'string' ? value.trim() : '';
}

function normalizeHeader(value) {
    return normalizeField(value).replace(/^\uFEFF/, '').toLowerCase();
}

function parseNumber(value) {
    const normalizedValue = normalizeField(value).replace(',', '.');
    if (!normalizedValue) return NaN;
    return parseFloat(normalizedValue);
}

function parseBooleanMarker(value, expectedValue) {
    const normalizedValue = normalizeField(value).toLowerCase();
    return normalizedValue === expectedValue || normalizedValue === 'yes' || normalizedValue === 'true' || normalizedValue === '1';
}

function getCell(row, indexes, key, fallbackIndex) {
    const index = typeof indexes[key] === 'undefined' ? fallbackIndex : indexes[key];
    return typeof row[index] === 'undefined' ? '' : row[index];
}

function getColumnIndexes(row) {
    const indexes = {};

    row.forEach((cell, index) => {
        indexes[normalizeHeader(cell)] = index;
    });

    return indexes;
}

function isBlankRow(row) {
    return row.every((cell) => normalizeField(cell) === '');
}

function rejectRow(importData, rowNumber, reason) {
    importData.rejectedRows.push({ rowNumber, reason });
}

function parseImportCsv(input, name) {
    const csv = parseCsvRows(input);
    const firstRow = csv[0] || [];
    const hasHeader = normalizeHeader(firstRow[0]) === 'item name';
    const columnIndexes = hasHeader ? getColumnIndexes(firstRow) : {};
    const rows = hasHeader ? csv.slice(1) : csv;
    const importData = {
        data: [],
        name,
        acceptedRows: 0,
        rejectedRows: [],
        errors: [],
    };

    rows.forEach((row, index) => {
        const rowNumber = index + (hasHeader ? 2 : 1);
        if (isBlankRow(row)) return;
        if (row.length < 6) {
            rejectRow(importData, rowNumber, 'missing required columns');
            return;
        }

        const itemName = normalizeField(getCell(row, columnIndexes, 'item name', 0));
        const category = normalizeField(getCell(row, columnIndexes, 'category', 1));
        const description = normalizeField(getCell(row, columnIndexes, 'desc', 2) || getCell(row, columnIndexes, 'description', 2));
        const qty = parseNumber(getCell(row, columnIndexes, 'qty', 3));
        const weight = parseNumber(getCell(row, columnIndexes, 'weight', 4));
        const unit = unitAliases[normalizeField(getCell(row, columnIndexes, 'unit', 5)).toLowerCase()];
        const price = parseNumber(getCell(row, columnIndexes, 'price', 7));
        const brand = normalizeField(getCell(row, columnIndexes, 'brand', -1));

        if (!itemName) {
            rejectRow(importData, rowNumber, 'missing item name');
            return;
        }
        if (Number.isNaN(qty)) {
            rejectRow(importData, rowNumber, 'invalid quantity');
            return;
        }
        if (Number.isNaN(weight)) {
            rejectRow(importData, rowNumber, 'invalid weight');
            return;
        }
        if (typeof unit === 'undefined') {
            rejectRow(importData, rowNumber, 'unsupported unit');
            return;
        }

        const imageUrl = normalizeField(getCell(row, columnIndexes, 'image_url', -1));
        importData.data.push({
            name: itemName,
            category,
            description,
            qty,
            weight,
            unit,
            url: normalizeField(getCell(row, columnIndexes, 'url', 6)),
            price: Number.isNaN(price) ? 0 : price,
            worn: parseBooleanMarker(getCell(row, columnIndexes, 'worn', 8), 'worn'),
            consumable: parseBooleanMarker(getCell(row, columnIndexes, 'consumable', 9), 'consumable'),
            brand,
            imageUrl: imageUrl || undefined,
        });
        importData.acceptedRows += 1;
    });

    return importData;
}

module.exports = {
    parseCsvRows,
    parseImportCsv,
};
