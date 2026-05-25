<style lang="scss">
@import "../css/_globals";

.lpPublicList {
    margin: 0 auto;
    max-width: 1000px;
    padding: 32px 20px;
}

.lpPublicListTotals,
.lpPublicListCategories {
    display: grid;
    gap: 16px;
}

.lpPublicListTotals {
    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
    margin: 24px 0;
}

.lpPublicListTotal,
.lpPublicListItem {
    background: $color-surface;
    border: 1px solid $color-border;
    border-radius: $radius-sm;
    padding: 12px;
}

.lpPublicListItem {
    align-items: flex-start;
    display: grid;
    gap: 12px;
    grid-template-columns: 96px 1fr;
    margin: 10px 0;
}

.lpPublicListItemImage {
    height: 96px;
    object-fit: cover;
    width: 96px;
}

.lpPublicListItemActions {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
}

.lpPublicDisclosure {
    background: $color-surface;
    border-left: 3px solid $color-accent;
    margin: 24px 0;
    padding: 12px 16px;
}
</style>

<template>
    <main class="lpPublicList">
        <meta v-if="list && !list.allowSearchIndexing" name="robots" content="noindex" />

        <p v-if="isLoading">Loading...</p>
        <p v-else-if="error">{{ error }}</p>
        <template v-else-if="list">
            <p v-if="username">
                By <router-link :to="`/u/${username}`">{{ username }}</router-link>
            </p>
            <h1>{{ list.name }}</h1>
            <p v-if="list.summary">{{ list.summary }}</p>

            <section class="lpPublicListTotals">
                <div class="lpPublicListTotal">
                    <strong>Total</strong>
                    <div>{{ displayWeight(list.totalWeight) }} {{ totalUnit }}</div>
                </div>
                <div class="lpPublicListTotal">
                    <strong>Base</strong>
                    <div>{{ displayWeight(list.totalBaseWeight) }} {{ totalUnit }}</div>
                </div>
                <div class="lpPublicListTotal">
                    <strong>Worn</strong>
                    <div>{{ displayWeight(list.totalWornWeight) }} {{ totalUnit }}</div>
                </div>
                <div class="lpPublicListTotal">
                    <strong>Consumable</strong>
                    <div>{{ displayWeight(list.totalConsumableWeight) }} {{ totalUnit }}</div>
                </div>
            </section>

            <aside v-if="affiliateDisclosure" class="lpPublicDisclosure">
                {{ affiliateDisclosure }}
            </aside>

            <section class="lpPublicListCategories">
                <article v-for="category in categories" :key="category.id || category.name">
                    <h2>{{ category.name }}</h2>
                    <div v-for="item in category.items" :key="item.id || item.name" class="lpPublicListItem">
                        <img v-if="item.imageUrl" class="lpPublicListItemImage" :src="item.imageUrl" :alt="item.name" />
                        <div v-else></div>
                        <div>
                            <h3>{{ item.name }}</h3>
                            <p v-if="item.brand">{{ item.brand }}</p>
                            <p v-if="item.description">{{ item.description }}</p>
                            <p>{{ displayItemWeight(item) }} {{ totalUnit }}</p>
                            <div class="lpPublicListItemActions">
                                <a v-if="item.publicUrl" :href="item.publicUrl" target="_blank" rel="noopener noreferrer" @click="trackItemClick(item)">View gear</a>
                                <button v-if="item.promoCode" type="button" @click="trackPromoClick(item)">
                                    {{ item.promoCode }}
                                </button>
                            </div>
                        </div>
                    </div>
                </article>
            </section>
        </template>
    </main>
</template>

<script>
import { fetchJson } from '../utils/utils';
const weightUtils = require('../utils/weight.js');

export default {
    name: 'PublicList',
    data() {
        return {
            isLoading: true,
            error: null,
            username: null,
            list: null,
            totalUnit: 'oz',
            categories: [],
            affiliateDisclosure: null,
        };
    },
    created() {
        fetchJson(`/api/public/list/${this.$route.params.externalId}`)
            .then((payload) => {
                this.username = payload.username;
                this.list = payload.list;
                this.totalUnit = payload.totalUnit || (payload.list && payload.list.totalUnit) || 'oz';
                this.categories = payload.categories || [];
                this.affiliateDisclosure = payload.affiliateDisclosure;
                this.updateDocumentMeta();
                this.track('listView');
            })
            .catch((err) => {
                this.error = err && err.status === 404 ? 'List not found.' : 'Unable to load this list.';
            })
            .finally(() => {
                this.isLoading = false;
            });
    },
    methods: {
        displayWeight(value) {
            return weightUtils.MgToWeight(value || 0, this.totalUnit);
        },
        displayItemWeight(item) {
            return this.displayWeight((item.weight || 0) * (item.qty || 1));
        },
        track(type, itemId) {
            if (!this.list || !this.list.externalId) {
                return Promise.resolve();
            }

            return fetchJson('/api/public/insight', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    externalId: this.list.externalId,
                    type,
                    itemId,
                }),
            }).catch(() => {});
        },
        trackItemClick(item) {
            this.track('gearClick', item.id);
        },
        trackPromoClick(item) {
            this.track('promoClick', item.id);
        },
        updateDocumentMeta() {
            if (!this.list) {
                return;
            }
            document.title = `${this.list.name || 'Public list'} - LighterPack+`;
            let robots = document.querySelector('meta[name="robots"]');
            if (!this.list.allowSearchIndexing) {
                if (!robots) {
                    robots = document.createElement('meta');
                    robots.setAttribute('name', 'robots');
                    document.head.appendChild(robots);
                }
                robots.setAttribute('content', 'noindex');
            } else if (robots) {
                robots.remove();
            }
        },
    },
};
</script>
