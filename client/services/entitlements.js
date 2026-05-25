const PLAN_FREE = 'free';
const PLAN_SUPPORTER = 'supporter';
const PLAN_CREATOR = 'creator';

const FEATURES = {
    PUBLIC_PROFILE: 'publicProfile',
    PROFILE_CUSTOMIZATION: 'profileCustomization',
    MANAGED_BACKUPS: 'managedBackups',
    CREATOR_LINKS: 'creatorLinks',
    CREATOR_INSIGHTS: 'creatorInsights',
};

const SUPPORTER_FEATURES = [
    FEATURES.PUBLIC_PROFILE,
    FEATURES.PROFILE_CUSTOMIZATION,
    FEATURES.MANAGED_BACKUPS,
];

const PLAN_FEATURES = {
    [PLAN_FREE]: [],
    [PLAN_SUPPORTER]: SUPPORTER_FEATURES,
    [PLAN_CREATOR]: [
        ...SUPPORTER_FEATURES,
        FEATURES.CREATOR_LINKS,
        FEATURES.CREATOR_INSIGHTS,
    ],
};

function normalizePlan(plan) {
    if (plan === PLAN_SUPPORTER || plan === PLAN_CREATOR) {
        return plan;
    }

    return PLAN_FREE;
}

function getPlanFeatures(plan) {
    return [...PLAN_FEATURES[normalizePlan(plan)]];
}

function hasFeature(entitlements, feature) {
    const plan = entitlements && entitlements.plan;
    const features = entitlements && Array.isArray(entitlements.features)
        ? entitlements.features
        : [];

    return getPlanFeatures(plan).includes(feature) || features.includes(feature);
}

module.exports = {
    PLAN_FREE,
    PLAN_SUPPORTER,
    PLAN_CREATOR,
    FEATURES,
    normalizePlan,
    getPlanFeatures,
    hasFeature,
};
