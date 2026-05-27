const VISIBILITY_PRIVATE = 'private';
const VISIBILITY_SHAREABLE = 'shareable';
const VISIBILITY_DISCOVERABLE = 'discoverable';
const VISIBILITY_INDEXABLE = 'indexable';

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
    return normalizeVisibility(value) !== VISIBILITY_PRIVATE;
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
