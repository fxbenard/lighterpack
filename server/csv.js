function escapeCsvField(field) {
    const value = field == null ? '' : `${field}`;
    if (/[",\r\n]/.test(value)) {
        return `"${value.replace(/"/g, '""')}"`;
    }
    return value;
}

module.exports = {
    escapeCsvField,
};
