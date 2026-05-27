const {
    isPublicVisibility,
    allowsSearchIndexing,
} = require('../client/services/public-visibility.js');

function getLibrary(user) {
    if (!user || !user.library) {
        return null;
    }

    return user.library;
}

function normalizeString(value) {
    return typeof value === 'string' ? value.trim() : '';
}

function normalizeHostname(value) {
    const url = normalizeString(value);
    if (!url) {
        return '';
    }

    try {
        return new URL(url).hostname.replace(/^www\./i, '').toLowerCase();
    } catch (err) {
        return '';
    }
}

function matchesText(value, match) {
    return normalizeString(value).toLowerCase() === normalizeString(match).toLowerCase();
}

function sanitizeEntitlements(entitlements) {
    const source = entitlements || {};

    return {
        plan: source.plan || 'free',
        source: source.source || 'self-hosted',
        features: Array.isArray(source.features) ? source.features.slice() : [],
    };
}

function sanitizeProfile(profile) {
    const source = profile || {};

    return {
        displayName: source.displayName || '',
        trailName: source.trailName || '',
        bio: source.bio || '',
        location: source.location || '',
        avatarUrl: source.avatarUrl || '',
        links: Array.isArray(source.links) ? source.links.slice() : [],
        gearPhilosophy: Array.isArray(source.gearPhilosophy) ? source.gearPhilosophy.slice() : [],
        visibility: source.visibility,
        allowSearchIndexing: allowsSearchIndexing(source.visibility, source.allowSearchIndexing),
    };
}

function sanitizeListSummary(list) {
    return {
        id: list.id,
        externalId: list.externalId || '',
        name: list.name || '',
        summary: list.summary || '',
        description: list.description || '',
        visibility: list.visibility,
        allowSearchIndexing: allowsSearchIndexing(list.visibility, list.allowSearchIndexing),
        totalWeight: Number(list.totalWeight) || 0,
        totalWornWeight: Number(list.totalWornWeight) || 0,
        totalConsumableWeight: Number(list.totalConsumableWeight) || 0,
        totalBaseWeight: Number(list.totalBaseWeight) || 0,
        totalPackWeight: Number(list.totalPackWeight) || 0,
        totalPrice: Number(list.totalPrice) || 0,
        totalConsumablePrice: Number(list.totalConsumablePrice) || 0,
        totalQty: Number(list.totalQty) || 0,
    };
}

function publicListsForProfile(library) {
    const profile = library.publicProfile || {};
    const featuredListIds = Array.isArray(profile.featuredListIds) ? profile.featuredListIds : [];
    const featuredOnly = featuredListIds.length > 0;
    const featuredLookup = featuredListIds.reduce((lookup, id) => {
        lookup[String(id)] = true;
        return lookup;
    }, {});

    return (library.lists || [])
        .filter(list => isPublicVisibility(list.visibility))
        .filter(list => !featuredOnly || featuredLookup[String(list.id)] || featuredLookup[String(list.externalId)])
        .map(sanitizeListSummary);
}

function findListByExternalId(library, externalId) {
    return (library.lists || []).find(list => list.externalId && list.externalId === externalId) || null;
}

function findById(collection, id) {
    return (collection || []).find(entry => entry.id == id) || null;
}

function resolvePublicItemLink(item, creator) {
    if (!item) {
        return {
            url: '',
            promoCode: '',
            promoLabel: '',
            hasAffiliateLink: false,
        };
    }

    if (normalizeString(item.affiliateUrl)) {
        return {
            url: normalizeString(item.affiliateUrl),
            promoCode: item.promoCode || '',
            promoLabel: item.promoLabel || '',
            hasAffiliateLink: true,
        };
    }

    const rules = creator && Array.isArray(creator.affiliateRules) ? creator.affiliateRules : [];
    const hostname = normalizeHostname(item.url);
    const shopRule = rules.find((candidate) => {
        if (!candidate || !normalizeString(candidate.affiliateUrl)) {
            return false;
        }
        if (candidate.type === 'shop') {
            return matchesText(item.shop, candidate.match);
        }
        return false;
    });
    const domainRule = rules.find((candidate) => {
        if (!candidate || !normalizeString(candidate.affiliateUrl)) {
            return false;
        }
        if (candidate.type === 'domain') {
            return hostname && matchesText(hostname, candidate.match);
        }
        return false;
    });
    const brandRule = rules.find((candidate) => {
        if (!candidate || !normalizeString(candidate.affiliateUrl)) {
            return false;
        }
        if (candidate.type === 'brand') {
            return matchesText(item.brand, candidate.match);
        }
        return false;
    });
    const rule = shopRule || domainRule || brandRule;

    if (rule) {
        return {
            url: normalizeString(rule.affiliateUrl),
            promoCode: rule.promoCode || '',
            promoLabel: rule.promoLabel || '',
            hasAffiliateLink: true,
        };
    }

    return {
        url: normalizeString(item.url),
        promoCode: '',
        promoLabel: '',
        hasAffiliateLink: false,
    };
}

function sanitizeCategoryItem(library, categoryItem, creator) {
    const item = findById(library.items, categoryItem.itemId);
    if (!item) {
        return null;
    }
    const publicLink = resolvePublicItemLink(item, creator);

    return Object.assign({
        id: item.id,
        name: item.name || '',
        description: item.description || '',
        weight: Number(item.weight) || 0,
        authorUnit: item.authorUnit || library.itemUnit || '',
        price: Number(item.price) || 0,
        image: item.image || '',
        imageUrl: item.imageUrl || '',
        shop: item.shop || '',
        brand: item.brand || '',
        tags: Array.isArray(item.tags) ? item.tags.slice() : [],
        publicUrl: publicLink.url,
        promoCode: publicLink.promoCode,
        promoLabel: publicLink.promoLabel,
        hasAffiliateLink: publicLink.hasAffiliateLink,
        qty: Number(categoryItem.qty) || 0,
        worn: categoryItem.worn || 0,
        consumable: categoryItem.consumable === true,
        star: categoryItem.star || 0,
    });
}

function buildPublicCategories(library, list, creator) {
    return (list.categoryIds || []).map((categoryId) => {
        const category = findById(library.categories, categoryId);
        if (!category) {
            return null;
        }

        const items = (category.categoryItems || [])
            .map(categoryItem => sanitizeCategoryItem(library, categoryItem, creator))
            .filter(Boolean);

        return {
            id: category.id,
            name: category.name || '',
            subtotalWeight: Number(category.subtotalWeight) || 0,
            subtotalWornWeight: Number(category.subtotalWornWeight) || 0,
            subtotalConsumableWeight: Number(category.subtotalConsumableWeight) || 0,
            subtotalPrice: Number(category.subtotalPrice) || 0,
            subtotalConsumablePrice: Number(category.subtotalConsumablePrice) || 0,
            subtotalQty: Number(category.subtotalQty) || 0,
            items,
        };
    }).filter(Boolean);
}

function buildPublicProfile(user) {
    const library = getLibrary(user);
    const profile = library && library.publicProfile;

    if (!profile || !isPublicVisibility(profile.visibility)) {
        return null;
    }

    return {
        username: user.username || '',
        profile: sanitizeProfile(profile),
        entitlements: sanitizeEntitlements(library.entitlements),
        lists: publicListsForProfile(library),
        affiliateDisclosure: library.creator && library.creator.disclosure ? library.creator.disclosure : '',
        hasAffiliateDisclosure: Boolean(library.creator && library.creator.disclosure),
    };
}

function buildPublicList(user, externalId) {
    const library = getLibrary(user);
    const list = library && findListByExternalId(library, externalId);

    if (!list || !isPublicVisibility(list.visibility)) {
        return null;
    }

    const creator = library.creator || {};
    const categories = buildPublicCategories(library, list, creator);
    const hasAffiliateLinks = categories.some(category => category.items.some(item => item.hasAffiliateLink));

    const payload = {
        username: user.username || '',
        list: sanitizeListSummary(list),
        totalUnit: library.totalUnit || '',
        itemUnit: library.itemUnit || '',
        currencySymbol: library.currencySymbol || '$',
        categories,
        hasAffiliateLinks,
    };

    if (hasAffiliateLinks) {
        payload.affiliateDisclosure = creator.disclosure || '';
    }

    return payload;
}

module.exports = {
    buildPublicProfile,
    buildPublicList,
    resolvePublicItemLink,
};
