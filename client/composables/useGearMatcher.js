// client/composables/useGearMatcher.js

function normalizeStr(str) {
    return (str || '').toLowerCase().trim().replace(/\s+/g, ' ');
}

// Levenshtein distance between two strings
function levenshtein(a, b) {
    const m = a.length;
    const n = b.length;
    const dp = Array.from({ length: m + 1 }, (_, i) => [i, ...Array(n).fill(0)]);
    for (let j = 0; j <= n; j++) dp[0][j] = j;
    for (let i = 1; i <= m; i++) {
        for (let j = 1; j <= n; j++) {
            dp[i][j] = a[i - 1] === b[j - 1]
                ? dp[i - 1][j - 1]
                : 1 + Math.min(dp[i - 1][j - 1], dp[i - 1][j], dp[i][j - 1]);
        }
    }
    return dp[m][n];
}

// 0.0 (no match) to 1.0 (exact match) name similarity
function nameSimilarity(a, b) {
    const na = normalizeStr(a);
    const nb = normalizeStr(b);
    if (!na || !nb) return 0;
    if (na === nb) return 1;
    const maxLen = Math.max(na.length, nb.length);
    return 1 - levenshtein(na, nb) / maxLen;
}

// Score a parsed CSV row against a library item. Returns 0.0–1.0.
// weightMg: parsed weight already converted to mg (same unit as item.weight)
function scoreMatch(parsed, libraryItem, weightMg) {
    let score = 0;

    // Name similarity — most important signal (0–0.6)
    const nameSim = nameSimilarity(parsed.name, libraryItem.name);
    score += nameSim * 0.6;

    // Weight match ±5% (0 or 0.25)
    if (weightMg > 0 && libraryItem.weight > 0) {
        const ratio = Math.abs(weightMg - libraryItem.weight) / libraryItem.weight;
        if (ratio <= 0.05) score += 0.25;
    }

    // Brand exact match (0 or 0.1)
    if (parsed.brand && libraryItem.brand) {
        if (normalizeStr(parsed.brand) === normalizeStr(libraryItem.brand)) {
            score += 0.1;
        }
    }

    // Description similarity boost (0–0.05)
    if (parsed.description && libraryItem.description) {
        score += nameSimilarity(parsed.description, libraryItem.description) * 0.05;
    }

    return score;
}

// Thresholds
const THRESHOLD_AUTO_MERGE = 0.80;  // score >= this → merge silently
const THRESHOLD_AMBIGUOUS  = 0.60;  // score >= this → show review screen

// Find best match for a parsed row in the library items array.
// Returns { item, score, decision: 'merge'|'review'|'new' }
function findBestMatch(parsed, libraryItems, weightMg) {
    let best = null;
    let bestScore = 0;

    for (const item of libraryItems) {
        const score = scoreMatch(parsed, item, weightMg);
        if (score > bestScore) {
            bestScore = score;
            best = item;
        }
    }

    if (!best || bestScore < THRESHOLD_AMBIGUOUS) {
        return { item: null, score: bestScore, decision: 'new' };
    }
    if (bestScore >= THRESHOLD_AUTO_MERGE) {
        return { item: best, score: bestScore, decision: 'merge' };
    }
    return { item: best, score: bestScore, decision: 'review' };
}

// Autocomplete: return library items whose name fuzzy-matches the query,
// sorted by score descending. Returns up to `limit` results.
function suggestItems(query, libraryItems, categoryName, limit = 6) {
    if (!query || query.length < 2) return [];

    return libraryItems
        .map(item => {
            let score = nameSimilarity(query, item.name);
            // Boost items in same category
            if (categoryName && item.category && normalizeStr(item.category) === normalizeStr(categoryName)) {
                score += 0.1;
            }
            return { item, score };
        })
        .filter(r => r.score > 0.3)
        .sort((a, b) => b.score - a.score)
        .slice(0, limit)
        .map(r => r.item);
}

export {
    scoreMatch,
    findBestMatch,
    suggestItems,
    THRESHOLD_AUTO_MERGE,
    THRESHOLD_AMBIGUOUS,
};
