<style lang="scss">
@import "../css/_globals";

#itemDetailDialog.lpModal {
    border-radius: $radius-md;
    max-height: 90vh;
    overflow-y: auto;
    padding: 0;
    width: min(480px, 92vw);
}

.itemDetail {
    display: flex;
    flex-direction: column;
}

.itemDetailHeader {
    align-items: flex-start;
    background: $color-accent;
    border-radius: $radius-md $radius-md 0 0;
    color: #fff;
    display: flex;
    gap: 16px;
    padding: 20px;

    .itemDetailThumb {
        border-radius: $radius-sm;
        flex-shrink: 0;
        height: 72px;
        object-fit: cover;
        width: 72px;
    }

    .itemDetailThumbPlaceholder {
        align-items: center;
        background: rgba(255, 255, 255, 0.15);
        border-radius: $radius-sm;
        color: rgba(255, 255, 255, 0.5);
        display: flex;
        flex-shrink: 0;
        font-size: 28px;
        height: 72px;
        justify-content: center;
        width: 72px;
    }

    .itemDetailHeaderInfo {
        flex: 1;
        min-width: 0;
    }

    .itemDetailName {
        font-size: 22px;
        font-weight: $fontWeight-bold;
        line-height: 1.2;
        margin: 0 0 4px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    .itemDetailBrand {
        font-size: $fontSize-base;
        margin-bottom: 8px;
        opacity: 0.85;
    }

    .itemDetailCategoryBadge {
        background: rgba(255, 255, 255, 0.2);
        border-radius: 99px;
        display: inline-block;
        font-size: $fontSize-sm;
        font-weight: $fontWeight-medium;
        padding: 2px 10px;
    }
}

.itemDetailStats {
    border-bottom: 1px solid $color-border;
    display: grid;
    grid-template-columns: repeat(3, 1fr);

    .itemDetailStat {
        border-right: 1px solid $color-border;
        padding: 14px 16px;
        text-align: center;

        &:last-child {
            border-right: none;
        }

        .itemDetailStatLabel {
            color: $color-text-muted;
            font-size: $fontSize-sm;
            font-weight: $fontWeight-medium;
            letter-spacing: $letterSpacing-caps;
            margin-bottom: 4px;
            text-transform: uppercase;
        }

        .itemDetailStatValue {
            font-size: 18px;
            font-weight: $fontWeight-bold;
        }
    }
}

.itemDetailBody {
    display: flex;
    flex-direction: column;
    gap: 16px;
    padding: 20px;
}

.itemDetailSection {
    .itemDetailSectionLabel {
        color: $color-text-muted;
        font-size: $fontSize-sm;
        font-weight: $fontWeight-medium;
        letter-spacing: $letterSpacing-caps;
        margin-bottom: 6px;
        text-transform: uppercase;
    }

    .itemDetailSectionValue {
        color: $color-text;
        font-size: $fontSize-base;

        &.muted {
            color: $color-text-muted;
            font-style: italic;
        }
    }

    a.itemDetailLink {
        align-items: center;
        color: $color-accent;
        display: inline-flex;
        font-size: $fontSize-base;
        gap: 6px;
        text-decoration: none;

        &:hover {
            text-decoration: underline;
        }
    }

    .itemDetailTags {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;

        .itemDetailTag {
            background: $color-surface;
            border: 1px solid $color-border;
            border-radius: 99px;
            font-size: $fontSize-sm;
            padding: 2px 10px;
        }
    }
}

.itemDetailDivider {
    border: none;
    border-top: 1px solid $color-border;
    margin: 0;
}

.itemDetailFooter {
    align-items: center;
    border-top: 1px solid $color-border;
    display: flex;
    gap: 8px;
    padding: 14px 20px;

    .itemDetailDelete {
        align-items: center;
        color: $color-danger;
        cursor: pointer;
        display: flex;
        font-size: $fontSize-base;
        gap: 6px;

        &:hover {
            opacity: 0.8;
        }
    }

    .itemDetailSpacer {
        flex: 1;
    }

    .lpButton.itemDetailEdit {
        align-items: center;
        display: flex;
        gap: 6px;
    }
}

/* Edit mode */
.itemDetailEditForm {
    display: flex;
    flex-direction: column;
    gap: 14px;
    padding: 20px;

    .itemDetailField {
        display: flex;
        flex-direction: column;
        gap: 4px;

        label {
            color: $color-text-muted;
            font-size: $fontSize-sm;
            font-weight: $fontWeight-medium;
            letter-spacing: $letterSpacing-caps;
            text-transform: uppercase;
        }

        input[type="text"],
        input[type="number"],
        select,
        textarea {
            border: 1px solid $color-border;
            border-radius: $radius-sm;
            font-size: $fontSize-base;
            padding: 7px 10px;
            width: 100%;

            &:focus {
                border-color: $color-accent;
                outline: none;
            }
        }

        textarea {
            min-height: 64px;
            resize: vertical;
        }
    }

    .itemDetailFieldRow {
        display: grid;
        gap: 12px;
        grid-template-columns: 1fr 1fr 1fr;
    }

    .itemDetailUnitRow {
        display: flex;
        gap: 8px;

        input {
            flex: 1;
        }

        select {
            flex: 0 0 64px;
        }
    }

    .itemDetailTagsEdit {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
        margin-bottom: 6px;

        .itemDetailTagChip {
            align-items: center;
            background: $color-surface;
            border: 1px solid $color-border;
            border-radius: 99px;
            display: flex;
            font-size: $fontSize-sm;
            gap: 4px;
            padding: 2px 8px;

            button {
                background: none;
                border: none;
                color: $color-text-muted;
                cursor: pointer;
                font-size: 14px;
                line-height: 1;
                padding: 0;

                &:hover { color: $color-text; }
            }
        }
    }

    .itemDetailTagInput {
        display: flex;
        gap: 6px;

        input { flex: 1; }

        button {
            background: $color-surface;
            border: 1px solid $color-border;
            border-radius: $radius-sm;
            cursor: pointer;
            font-size: $fontSize-sm;
            padding: 6px 12px;

            &:hover { background: $color-bg; }
        }
    }

    .itemDetailUrlRow {
        display: flex;
        gap: 6px;

        input { flex: 1; }
    }

    .itemDetailFetchBtn {
        background: $color-surface;
        border: 1px solid $color-border;
        border-radius: $radius-sm;
        cursor: pointer;
        font-size: $fontSize-sm;
        padding: 6px 12px;
        white-space: nowrap;

        &:hover:not(:disabled) { background: $color-bg; }
        &:disabled { cursor: default; opacity: 0.5; }
    }

    .itemDetailFetchError {
        color: $color-danger;
        font-size: $fontSize-sm;
        margin-top: 4px;
    }

    .itemDetailFetchSuccess {
        color: $color-accent;
        font-size: $fontSize-sm;
        margin-top: 4px;
    }
}

.itemDetailEditFooter {
    align-items: center;
    border-top: 1px solid $color-border;
    display: flex;
    gap: 8px;
    justify-content: flex-end;
    padding: 14px 20px;
}
</style>

<template>
    <modal id="itemDetailDialog" :shown="shown" @hide="close">
        <div class="itemDetail">
            <!-- View mode -->
            <template v-if="!editing">
                <div class="itemDetailHeader">
                    <img v-if="thumbnailImage" class="itemDetailThumb" :src="thumbnailImage" @click="viewImage">
                    <div v-else class="itemDetailThumbPlaceholder">⛺</div>
                    <div class="itemDetailHeaderInfo">
                        <div class="itemDetailName">{{ item.name || 'Unnamed item' }}</div>
                        <div v-if="item.brand" class="itemDetailBrand">{{ item.brand }}</div>
                        <span v-if="item.category" class="itemDetailCategoryBadge">{{ item.category }}</span>
                    </div>
                </div>

                <div class="itemDetailStats">
                    <div class="itemDetailStat">
                        <div class="itemDetailStatLabel">Weight</div>
                        <div class="itemDetailStatValue">{{ displayWeight }} {{ item.authorUnit }}</div>
                    </div>
                    <div class="itemDetailStat">
                        <div class="itemDetailStatLabel">Price</div>
                        <div class="itemDetailStatValue">{{ item.price ? item.price.toFixed(2) : '—' }}</div>
                    </div>
                    <div class="itemDetailStat">
                        <div class="itemDetailStatLabel">Qty</div>
                        <div class="itemDetailStatValue">{{ categoryItem ? categoryItem.qty : 1 }}</div>
                    </div>
                </div>

                <div class="itemDetailBody">
                    <div class="itemDetailSection">
                        <div class="itemDetailSectionLabel">Notes</div>
                        <div :class="['itemDetailSectionValue', { muted: !item.description }]">
                            {{ item.description || 'No notes added' }}
                        </div>
                    </div>

                    <hr v-if="item.url" class="itemDetailDivider">

                    <div v-if="item.url" class="itemDetailSection">
                        <div class="itemDetailSectionLabel">Purchase Link</div>
                        <a :href="item.url" target="_blank" rel="noopener" class="itemDetailLink">
                            ↗ View product page
                        </a>
                    </div>

                    <hr v-if="item.tags && item.tags.length" class="itemDetailDivider">

                    <div v-if="item.tags && item.tags.length" class="itemDetailSection">
                        <div class="itemDetailSectionLabel">Tags</div>
                        <div class="itemDetailTags">
                            <span v-for="tag in item.tags" :key="tag" class="itemDetailTag">{{ tag }}</span>
                        </div>
                    </div>
                </div>

                <div class="itemDetailFooter">
                    <a class="itemDetailDelete" @click="removeItem">
                        🗑 Delete
                    </a>
                    <div class="itemDetailSpacer" />
                    <button class="lpButton itemDetailEdit" @click="startEdit">
                        ✎ Edit Gear
                    </button>
                </div>
            </template>

            <!-- Edit mode -->
            <template v-else>
                <div class="itemDetailHeader">
                    <img v-if="thumbnailImage" class="itemDetailThumb" :src="thumbnailImage">
                    <div v-else class="itemDetailThumbPlaceholder">⛺</div>
                    <div class="itemDetailHeaderInfo">
                        <div class="itemDetailName">{{ editName || 'Unnamed item' }}</div>
                        <div v-if="editBrand" class="itemDetailBrand">{{ editBrand }}</div>
                        <span v-if="editCategory" class="itemDetailCategoryBadge">{{ editCategory }}</span>
                    </div>
                </div>

                <form class="itemDetailEditForm" @submit.prevent="saveEdit">
                    <div class="itemDetailField">
                        <label>Name</label>
                        <input v-model="editName" type="text" placeholder="Item name" autofocus>
                    </div>

                    <div class="itemDetailField">
                        <label>Notes</label>
                        <textarea v-model="editDescription" placeholder="Notes about this item"></textarea>
                    </div>

                    <div class="itemDetailField">
                        <label>Brand</label>
                        <input v-model="editBrand" type="text" placeholder="e.g. Sea to Summit" list="brandSuggestions">
                        <datalist id="brandSuggestions">
                            <option v-for="brand in knownBrands" :key="brand" :value="brand" />
                        </datalist>
                    </div>

                    <div class="itemDetailField">
                        <label>Category</label>
                        <select v-model="editCategory">
                            <option value="">— none —</option>
                            <option v-for="cat in gearCategories" :key="cat" :value="cat">{{ cat }}</option>
                        </select>
                    </div>

                    <div class="itemDetailFieldRow">
                        <div class="itemDetailField">
                            <label>Weight</label>
                            <div class="itemDetailUnitRow">
                                <input v-model="editWeight" type="text" placeholder="0">
                                <select v-model="editUnit">
                                    <option v-for="u in units" :key="u" :value="u">{{ u }}</option>
                                </select>
                            </div>
                        </div>
                        <div class="itemDetailField">
                            <label>Price</label>
                            <input v-model="editPrice" type="text" placeholder="0.00">
                        </div>
                        <div class="itemDetailField">
                            <label>Qty</label>
                            <input v-model="editQty" type="text" placeholder="1">
                        </div>
                    </div>

                    <div class="itemDetailField">
                        <label>Purchase URL</label>
                        <div class="itemDetailUrlRow">
                            <input v-model="editUrl" type="text" placeholder="https://…" @keydown.enter.prevent="fetchGear">
                            <button type="button" class="itemDetailFetchBtn" :disabled="fetchLoading || !editUrl" @click="fetchGear">
                                {{ fetchLoading ? '…' : '⬇ Fetch' }}
                            </button>
                        </div>
                        <span v-if="fetchError" class="itemDetailFetchError">{{ fetchError }}</span>
                        <span v-if="fetchSuccess" class="itemDetailFetchSuccess">{{ fetchSuccess }}</span>
                    </div>

                    <div class="itemDetailField">
                        <label>Tags</label>
                        <div class="itemDetailTagsEdit">
                            <span v-for="tag in editTags" :key="tag" class="itemDetailTagChip">
                                {{ tag }}
                                <button type="button" @click="removeTag(tag)">×</button>
                            </span>
                        </div>
                        <div class="itemDetailTagInput">
                            <input v-model="tagInput" type="text" placeholder="Add a tag…" @keydown.enter.prevent="addTag">
                            <button type="button" @click="addTag">Add</button>
                        </div>
                    </div>
                </form>

                <div class="itemDetailEditFooter">
                    <a class="lpHref close" @click="cancelEdit">Cancel</a>
                    <button class="lpButton" @click="saveEdit">Save</button>
                </div>
            </template>
        </div>
    </modal>
</template>

<script>
import modal from './modal.vue';
import { registerDialogOpener, unregisterDialogOpener } from '../services/dialogs';
import { openDialog } from '../services/dialogs';

const weightUtils = require('../utils/weight.js');

const GEAR_CATEGORIES = [
    'Shelter', 'Sleep', 'Clothing', 'Water', 'Food', 'Cook',
    'Navigation', 'Safety', 'Hygiene', 'Essentials', 'Other',
];

const UNITS = ['oz', 'lb', 'g', 'kg'];

export default {
    name: 'ItemDetail',
    components: { modal },
    data() {
        return {
            shown: false,
            editing: false,
            item: {},
            categoryItem: null,
            category: null,
            // edit fields
            editName: '',
            editDescription: '',
            editBrand: '',
            editCategory: '',
            editWeight: '',
            editUnit: 'g',
            editPrice: '',
            editQty: '',
            editUrl: '',
            editTags: [],
            tagInput: '',
            fetchLoading: false,
            fetchError: '',
            fetchSuccess: '',
        };
    },
    computed: {
        gearCategories() { return GEAR_CATEGORIES; },
        units() { return UNITS; },
        knownBrands() {
            const library = this.$store.state.library;
            if (!library || !library.items) return [];
            return [...new Set(
                library.items.map((i) => i.brand).filter(Boolean),
            )].sort();
        },
        thumbnailImage() {
            if (this.item.image) return `https://i.imgur.com/${this.item.image}s.jpg`;
            if (this.item.imageUrl) return this.item.imageUrl;
            return '';
        },
        displayWeight() {
            if (!this.item.weight) return '0';
            return weightUtils.MgToWeight(this.item.weight, this.item.authorUnit);
        },
    },
    mounted() {
        registerDialogOpener('itemDetail', ({ item, categoryItem, category }) => {
            this.item = { ...item };
            this.categoryItem = categoryItem ? { ...categoryItem } : null;
            this.category = category || null;
            this.editing = false;
            this.shown = true;
        });
    },
    beforeUnmount() {
        unregisterDialogOpener('itemDetail');
    },
    methods: {
        close() {
            this.shown = false;
            this.editing = false;
        },
        viewImage() {
            const full = this.item.image
                ? `https://i.imgur.com/${this.item.image}l.jpg`
                : this.item.imageUrl;
            if (full) openDialog('itemViewImage', full);
        },
        startEdit() {
            this.editName = this.item.name || '';
            this.editDescription = this.item.description || '';
            this.editBrand = this.item.brand || '';
            this.editCategory = this.item.category || '';
            this.editWeight = weightUtils.MgToWeight(this.item.weight, this.item.authorUnit);
            this.editUnit = this.item.authorUnit || 'g';
            this.editPrice = this.item.price != null ? this.item.price.toFixed(2) : '0.00';
            this.editQty = this.categoryItem ? this.categoryItem.qty : 1;
            this.editUrl = this.item.url || '';
            this.editTags = [...(this.item.tags || [])];
            this.tagInput = '';
            this.fetchError = '';
            this.fetchSuccess = '';
            this.editing = true;
        },
        cancelEdit() {
            this.editing = false;
        },
        saveEdit() {
            const weightFloat = parseFloat(this.editWeight) || 0;
            const updatedItem = {
                ...this.item,
                name: this.editName.trim(),
                description: this.editDescription.trim(),
                brand: this.editBrand.trim(),
                category: this.editCategory,
                url: this.editUrl.trim(),
                tags: [...this.editTags],
                authorUnit: this.editUnit,
                weight: weightUtils.WeightToMg(weightFloat, this.editUnit),
                price: Math.round((parseFloat(this.editPrice) || 0) * 100) / 100,
            };
            this.$store.commit('updateItem', updatedItem);

            if (this.categoryItem && this.category) {
                const updatedCategoryItem = {
                    ...this.categoryItem,
                    qty: parseFloat(this.editQty) || 1,
                };
                this.$store.commit('updateCategoryItem', {
                    category: this.category,
                    categoryItem: updatedCategoryItem,
                });
            }

            this.item = { ...updatedItem };
            this.editing = false;
        },
        removeItem() {
            if (this.category) {
                this.$store.commit('removeItemFromCategory', {
                    itemId: this.item.id,
                    category: this.category,
                });
            }
            this.close();
        },
        async fetchGear() {
            if (!this.editUrl || this.fetchLoading) return;
            this.fetchLoading = true;
            this.fetchError = '';
            this.fetchSuccess = '';
            try {
                const res = await fetch('/scrapeGear', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ url: this.editUrl }),
                });
                const data = await res.json();
                if (!res.ok) throw new Error(data.error || 'fetch failed');

                const filled = [];
                if (data.name && !this.editName) { this.editName = data.name; filled.push('name'); }
                if (data.brand && !this.editBrand) { this.editBrand = data.brand; filled.push('brand'); }
                if (data.price != null && !parseFloat(this.editPrice)) { this.editPrice = data.price.toFixed(2); filled.push('price'); }
                if (data.weight != null && !parseFloat(this.editWeight)) {
                    this.editWeight = data.weight;
                    if (data.weightUnit) this.editUnit = data.weightUnit;
                    filled.push('weight');
                }
                if (data.imageUrl && !this.item.image && !this.item.imageUrl) {
                    this.item = { ...this.item, imageUrl: data.imageUrl };
                    filled.push('image');
                }
                this.fetchSuccess = filled.length
                    ? `Filled: ${filled.join(', ')}`
                    : 'No data found — fields unchanged';
            } catch (err) {
                this.fetchError = err.message;
            } finally {
                this.fetchLoading = false;
            }
        },
        addTag() {
            const tag = this.tagInput.trim().toLowerCase();
            if (tag && !this.editTags.includes(tag)) this.editTags.push(tag);
            this.tagInput = '';
        },
        removeTag(tag) {
            this.editTags = this.editTags.filter((t) => t !== tag);
        },
    },
};
</script>
