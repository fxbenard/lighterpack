<style lang="scss">
@import "../css/_globals";

.lpGearRoom {
    background: $color-bg;
    bottom: 0;
    display: flex;
    flex-direction: column;
    left: 0;
    overflow: hidden;
    position: fixed;
    right: 0;
    top: 0;
    z-index: $aboveSidebar;
}

.lpGearRoomHeader {
    align-items: center;
    background: $color-surface;
    border-bottom: 1px solid $color-border;
    display: flex;
    flex-shrink: 0;
    gap: 12px;
    min-height: 60px;
    padding: 0 20px;
}

.lpGearRoomTitle {
    flex: 1;
    font-size: $fontSize-md;
    font-weight: $fontWeight-bold;
    margin: 0;
}

.lpGearRoomBody {
    display: flex;
    flex: 1;
    overflow: hidden;
}

.lpGearRoomFilters {
    border-right: 1px solid $color-border;
    display: flex;
    flex-direction: column;
    flex-shrink: 0;
    gap: 16px;
    overflow-y: auto;
    padding: 20px 16px;
    width: 220px;
}

.lpGearRoomFiltersLabel {
    color: $color-text-muted;
    font-size: $fontSize-sm;
    font-weight: $fontWeight-bold;
    letter-spacing: 0.05em;
    margin-bottom: 6px;
    text-transform: uppercase;
}

.lpGearRoomSearch {
    appearance: none;
    background: $color-surface;
    border: 1px solid $color-border;
    border-radius: $radius-md;
    box-sizing: border-box;
    color: $color-text;
    font-size: $fontSize-md;
    min-height: $control-height-md;
    padding: 0 10px;
    width: 100%;

    &:focus {
        border-color: $color-accent;
        outline: none;
    }

    &::placeholder {
        color: $color-text-muted;
    }
}

.lpGearRoomCategoryChips {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
}

.lpGearRoomChip {
    background: $color-surface;
    border: 1px solid $color-border;
    border-radius: 999px;
    color: $color-text;
    cursor: pointer;
    font-family: $font-family-base;
    font-size: $fontSize-sm;
    padding: 3px 10px;

    &:hover {
        border-color: $color-accent;
        color: $color-accent;
    }

    &.active {
        background: $color-accent;
        border-color: $color-accent;
        color: #fff;
    }
}

.lpGearRoomWeightRange {
    align-items: center;
    display: flex;
    gap: 6px;
}

.lpGearRoomWeightInput {
    appearance: none;
    background: $color-surface;
    border: 1px solid $color-border;
    border-radius: $radius-md;
    color: $color-text;
    font-size: $fontSize-sm;
    min-height: 32px;
    padding: 0 6px;
    text-align: center;
    width: 70px;

    &:focus {
        border-color: $color-accent;
        outline: none;
    }
}

.lpGearRoomMain {
    display: flex;
    flex: 1;
    flex-direction: column;
    overflow: hidden;
}

.lpGearRoomStats {
    align-items: center;
    border-bottom: 1px solid $color-border;
    color: $color-text-muted;
    display: flex;
    flex-shrink: 0;
    font-size: $fontSize-sm;
    gap: 24px;
    padding: 10px 20px;
}

.lpGearRoomStat strong {
    color: $color-text;
    font-size: $fontSize-md;
}

.lpGearRoomTableWrap {
    flex: 1;
    overflow-y: auto;
}

.lpGearRoomTable {
    border-collapse: collapse;
    width: 100%;

    th {
        background: $color-surface;
        border-bottom: 1px solid $color-border;
        color: $color-text-muted;
        font-size: $fontSize-sm;
        font-weight: $fontWeight-bold;
        padding: 8px 12px;
        position: sticky;
        text-align: left;
        top: 0;
        white-space: nowrap;

        &.lpGRSortable {
            cursor: pointer;
            user-select: none;

            &:hover {
                color: $color-text;
            }
        }

        &.lpGRCheckCol { width: 36px; }
        &.lpGRImgCol { width: 56px; }
        &.lpGRWeightCol, &.lpGRPriceCol { text-align: right; width: 90px; }
        &.lpGRCategoryCol { width: 130px; }
    }

    td {
        border-bottom: 1px solid $color-border;
        padding: 8px 12px;
        vertical-align: middle;

        &.lpGRCheckCol { text-align: center; width: 36px; }
        &.lpGRImgCol { width: 56px; }
        &.lpGRWeightCol, &.lpGRPriceCol { text-align: right; }
    }

    tr {
        cursor: pointer;

        &:hover td {
            background: rgba(var(--color-accent-rgb), 0.04);
        }
    }
}

.lpGearRoomThumb {
    background: $color-border;
    border-radius: $radius-sm;
    display: block;
    height: 40px;
    object-fit: cover;
    width: 40px;
}

.lpGearRoomThumbPlaceholder {
    align-items: center;
    background: rgba(var(--color-accent-rgb), 0.06);
    border-radius: $radius-sm;
    color: $color-text-muted;
    display: flex;
    font-size: 18px;
    height: 40px;
    justify-content: center;
    width: 40px;
}

.lpGearRoomItemName {
    font-weight: $fontWeight-bold;
}

.lpGearRoomItemDesc {
    color: $color-text-muted;
    font-size: $fontSize-sm;
    margin-top: 2px;
}

.lpGearRoomCategoryBadge {
    background: rgba(var(--color-accent-rgb), 0.1);
    border-radius: 999px;
    color: $color-accent;
    font-size: $fontSize-sm;
    padding: 2px 8px;
    white-space: nowrap;
}

.lpGearRoomBatchBar {
    align-items: center;
    background: #1a1a1a;
    border-radius: 12px;
    bottom: 24px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
    color: #fff;
    display: flex;
    flex-wrap: wrap;
    font-size: $fontSize-sm;
    gap: 8px;
    left: 50%;
    padding: 10px 16px;
    position: fixed;
    transform: translateX(-50%);
    white-space: nowrap;
    z-index: $belowDialog;
}

.lpGearRoomBatchCount {
    background: $color-accent;
    border-radius: 999px;
    font-size: 12px;
    font-weight: $fontWeight-bold;
    padding: 2px 8px;
}

.lpGearRoomBatchSep {
    color: #555;
}

.lpGearRoomBatchAction {
    background: #2a2a2a;
    border: 1px solid #444;
    border-radius: $radius-sm;
    color: #eee;
    cursor: pointer;
    font-family: $font-family-base;
    font-size: $fontSize-sm;
    padding: 5px 12px;

    &:hover {
        background: #3a3a3a;
    }

    &.danger {
        border-color: #882222;
        color: #ff7070;
    }
}

.lpGearRoomBatchCancel {
    background: none;
    border: none;
    color: #777;
    cursor: pointer;
    font-family: $font-family-base;
    font-size: $fontSize-sm;
    padding: 4px;

    &:hover {
        color: #aaa;
    }
}

.lpGearRoomBatchPanel {
    background: $color-surface;
    border: 1px solid $color-border;
    border-radius: $radius-md;
    bottom: 72px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.12);
    left: 50%;
    padding: 16px;
    position: fixed;
    transform: translateX(-50%);
    width: 300px;
    z-index: $belowDialog;
}

.lpGearRoomBatchPanelTitle {
    color: $color-text-muted;
    font-size: $fontSize-sm;
    font-weight: $fontWeight-bold;
    margin-bottom: 12px;
    text-transform: uppercase;
}

.lpGearRoomBatchPanelRow {
    align-items: center;
    display: flex;
    gap: 8px;
    margin-bottom: 10px;
}

.lpGearRoomBatchPanelLabel {
    color: $color-text-muted;
    flex-shrink: 0;
    font-size: $fontSize-sm;
    width: 70px;
}

.lpGearRoomBatchPanelInput,
.lpGearRoomBatchPanelSelect {
    background: $color-surface;
    border: 1px solid $color-border;
    border-radius: $radius-sm;
    color: $color-text;
    flex: 1;
    font-size: $fontSize-sm;
    min-height: 32px;
    padding: 0 8px;

    &:focus {
        border-color: $color-accent;
        outline: none;
    }
}

.lpGearRoomBatchApply {
    background: $color-accent;
    border: none;
    border-radius: $radius-sm;
    color: #fff;
    cursor: pointer;
    font-family: $font-family-base;
    font-size: $fontSize-sm;
    margin-top: 4px;
    padding: 7px 16px;
    width: 100%;

    &:hover {
        opacity: 0.9;
    }
}

.lpGearRoomFiltersToggle {
    background: $color-surface;
    border: 1px solid $color-border;
    border-radius: $radius-sm;
    color: $color-text;
    cursor: pointer;
    display: none;
    font-family: $font-family-base;
    font-size: $fontSize-sm;
    margin: 8px 16px 0;
    padding: 6px 12px;
}

@media (max-width: 768px) {
    .lpGearRoomFilters {
        border-bottom: 1px solid $color-border;
        border-right: none;
        display: none;
        padding: 12px 16px;
        width: 100%;

        &.open {
            display: flex;
        }
    }

    .lpGearRoomBody {
        flex-direction: column;
    }

    .lpGearRoomFiltersToggle {
        display: block;
    }

    .lpGearRoomTable {
        th.lpGRCategoryCol,
        td.lpGRCategoryCol,
        th.lpGRPriceCol,
        td.lpGRPriceCol {
            display: none;
        }
    }

    .lpGearRoomBatchBar {
        left: 16px;
        right: 16px;
        transform: none;
        width: auto;
    }
}
</style>
<template>
    <div class="lpGearRoom">
        <div class="lpGearRoomHeader">
            <button class="lpButton lpSmall lpButtonSecondary" @click="$emit('close')">← Back to lists</button>
            <h1 class="lpGearRoomTitle">Your Gear</h1>
            <button class="lpButton lpSmall" @click="createItem">+ New item</button>
        </div>

        <button class="lpGearRoomFiltersToggle" @click="filtersOpen = !filtersOpen">
            {{ filtersOpen ? 'Hide filters' : 'Filters' }}
        </button>

        <div class="lpGearRoomBody">
            <div :class="['lpGearRoomFilters', { open: filtersOpen }]">
                <div>
                    <div class="lpGearRoomFiltersLabel">Search</div>
                    <input v-model="search" class="lpGearRoomSearch" type="text" placeholder="Name, brand, description…">
                </div>
                <div>
                    <div class="lpGearRoomFiltersLabel">Category</div>
                    <div class="lpGearRoomCategoryChips">
                        <button :class="['lpGearRoomChip', { active: filterCategory === '' }]" @click="filterCategory = ''">All</button>
                        <button
                            v-for="cat in availableCategories"
                            :key="cat"
                            :class="['lpGearRoomChip', { active: filterCategory === cat }]"
                            @click="filterCategory = cat"
                        >{{ cat }}</button>
                    </div>
                </div>
                <div>
                    <div class="lpGearRoomFiltersLabel">Weight (g)</div>
                    <div class="lpGearRoomWeightRange">
                        <input v-model.number="weightMin" class="lpGearRoomWeightInput" type="number" min="0" placeholder="Min">
                        <span>–</span>
                        <input v-model.number="weightMax" class="lpGearRoomWeightInput" type="number" min="0" placeholder="Max">
                    </div>
                </div>
            </div>

            <div class="lpGearRoomMain">
                <div class="lpGearRoomStats">
                    <span class="lpGearRoomStat"><strong>{{ totalWeightDisplay }}</strong> total</span>
                    <span class="lpGearRoomStat"><strong>{{ filteredItems.length }}</strong> items</span>
                    <span v-if="showTotalValue" class="lpGearRoomStat"><strong>€{{ totalValue }}</strong> value</span>
                </div>

                <div class="lpGearRoomTableWrap">
                    <table class="lpGearRoomTable">
                        <thead>
                            <tr>
                                <th class="lpGRCheckCol">
                                    <input
                                        type="checkbox"
                                        :checked="allSelected"
                                        :indeterminate.prop="someSelected"
                                        @change="toggleSelectAll"
                                    >
                                </th>
                                <th class="lpGRImgCol"></th>
                                <th class="lpGRSortable" @click="setSort('name')">
                                    Item {{ sortKey === 'name' ? (sortAsc ? '↑' : '↓') : '' }}
                                </th>
                                <th class="lpGRCategoryCol">Category</th>
                                <th class="lpGRWeightCol lpGRSortable" @click="setSort('weight')">
                                    Weight {{ sortKey === 'weight' ? (sortAsc ? '↑' : '↓') : '' }}
                                </th>
                                <th v-if="showPrice" class="lpGRPriceCol lpGRSortable" @click="setSort('price')">
                                    Price {{ sortKey === 'price' ? (sortAsc ? '↑' : '↓') : '' }}
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="item in sortedItems" :key="item.id" @click.self="openItemDetail(item)">
                                <td class="lpGRCheckCol" @click.stop>
                                    <input v-model="selected" type="checkbox" :value="item.id">
                                </td>
                                <td class="lpGRImgCol" @click="openItemDetail(item)">
                                    <img v-if="itemThumb(item)" :src="itemThumb(item)" class="lpGearRoomThumb" :alt="item.name">
                                    <div v-else class="lpGearRoomThumbPlaceholder"></div>
                                </td>
                                <td @click="openItemDetail(item)">
                                    <div class="lpGearRoomItemName">{{ itemDisplayName(item) }}</div>
                                    <div v-if="item.description" class="lpGearRoomItemDesc">{{ item.description }}</div>
                                </td>
                                <td class="lpGRCategoryCol" @click="openItemDetail(item)">
                                    <span v-if="item.category" class="lpGearRoomCategoryBadge">{{ item.category }}</span>
                                </td>
                                <td class="lpGRWeightCol" @click="openItemDetail(item)">{{ displayWeight(item.weight, item.authorUnit) }} {{ item.authorUnit }}</td>
                                <td v-if="showPrice" class="lpGRPriceCol" @click="openItemDetail(item)">{{ item.price > 0 ? '€' + item.price : '–' }}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>

        <!-- Batch actions bar — appears when items are selected -->
        <div v-if="selected.length > 0" class="lpGearRoomBatchBar">
            <span class="lpGearRoomBatchCount">{{ selected.length }} selected</span>
            <span class="lpGearRoomBatchSep">|</span>
            <button class="lpGearRoomBatchAction" @click="batchSwapNameDesc">Swap name ↔ desc</button>
            <button class="lpGearRoomBatchAction" @click="toggleBatchPanel('category')">Set category</button>
            <button class="lpGearRoomBatchAction" @click="toggleBatchPanel('tag')">Add tag</button>
            <button class="lpGearRoomBatchAction danger" @click="batchDelete">Delete</button>
            <span class="lpGearRoomBatchSep">|</span>
            <button class="lpGearRoomBatchCancel" @click="selected = []">✕ Cancel</button>
        </div>

        <!-- Category panel -->
        <div v-if="activeBatchPanel === 'category'" class="lpGearRoomBatchPanel">
            <div class="lpGearRoomBatchPanelTitle">Set category for {{ selected.length }} items</div>
            <div class="lpGearRoomBatchPanelRow">
                <span class="lpGearRoomBatchPanelLabel">Category</span>
                <select v-model="batchCategory" class="lpGearRoomBatchPanelSelect">
                    <option value="">— none —</option>
                    <option v-for="cat in availableCategories" :key="cat" :value="cat">{{ cat }}</option>
                </select>
            </div>
            <button class="lpGearRoomBatchApply" @click="applyBatchCategory">Apply</button>
        </div>

        <!-- Tag panel -->
        <div v-if="activeBatchPanel === 'tag'" class="lpGearRoomBatchPanel">
            <div class="lpGearRoomBatchPanelTitle">Add tag to {{ selected.length }} items</div>
            <div class="lpGearRoomBatchPanelRow">
                <span class="lpGearRoomBatchPanelLabel">Tag</span>
                <input
                    v-model="batchTag"
                    class="lpGearRoomBatchPanelInput"
                    type="text"
                    placeholder="ex: bikepacking"
                    @keydown.enter="applyBatchTag"
                >
            </div>
            <button class="lpGearRoomBatchApply" @click="applyBatchTag">Apply</button>
        </div>
    </div>
</template>
<script>
import { openDialog } from '../services/dialogs';
import { useUtils } from '../composables/useUtils.js';
import { openSpeedbump } from '../services/speedbump';

const { displayWeight } = useUtils();

export default {
    name: 'GearRoom',
    emits: ['close'],
    data() {
        return {
            search: '',
            filterCategory: '',
            weightMin: null,
            weightMax: null,
            selected: [],
            sortKey: 'name',
            sortAsc: true,
            activeBatchPanel: null,
            batchCategory: '',
            batchTag: '',
            filtersOpen: false,
        };
    },
    computed: {
        library() {
            return this.$store.state.library;
        },
        allItems() {
            return this.library.items;
        },
        availableCategories() {
            return [...new Set(this.allItems.map(i => i.category).filter(Boolean))].sort();
        },
        filteredItems() {
            let items = this.allItems;
            if (this.search) {
                const q = this.search.toLowerCase();
                items = items.filter(i =>
                    (i.name || '').toLowerCase().includes(q) ||
                    (i.description || '').toLowerCase().includes(q) ||
                    (i.brand || '').toLowerCase().includes(q)
                );
            }
            if (this.filterCategory) {
                items = items.filter(i => i.category === this.filterCategory);
            }
            if (this.weightMin !== null && this.weightMin !== '') {
                const minMg = this.weightMin * 1000;
                items = items.filter(i => i.weight >= minMg);
            }
            if (this.weightMax !== null && this.weightMax !== '') {
                const maxMg = this.weightMax * 1000;
                items = items.filter(i => i.weight <= maxMg);
            }
            return items;
        },
        sortedItems() {
            const items = [...this.filteredItems];
            items.sort((a, b) => {
                let va, vb;
                if (this.sortKey === 'weight') {
                    va = a.weight || 0;
                    vb = b.weight || 0;
                } else if (this.sortKey === 'price') {
                    va = a.price || 0;
                    vb = b.price || 0;
                } else {
                    va = this.itemDisplayName(a).toLowerCase();
                    vb = this.itemDisplayName(b).toLowerCase();
                }
                if (va < vb) return this.sortAsc ? -1 : 1;
                if (va > vb) return this.sortAsc ? 1 : -1;
                return 0;
            });
            return items;
        },
        allSelected() {
            return this.selected.length === this.filteredItems.length && this.filteredItems.length > 0;
        },
        someSelected() {
            return this.selected.length > 0 && this.selected.length < this.filteredItems.length;
        },
        totalWeightDisplay() {
            const totalMg = this.filteredItems.reduce((s, i) => s + (i.weight || 0), 0);
            const kg = totalMg / 1000000;
            return kg >= 1 ? kg.toFixed(2) + ' kg' : (totalMg / 1000).toFixed(0) + ' g';
        },
        totalValue() {
            return this.filteredItems.reduce((s, i) => s + (i.price || 0), 0).toFixed(2).replace(/\.00$/, '');
        },
        showTotalValue() {
            return this.filteredItems.some(i => i.price > 0);
        },
        showPrice() {
            return this.allItems.some(i => i.price > 0);
        },
    },
    methods: {
        displayWeight,
        itemDisplayName(item) {
            return [item.brand, item.name].filter(Boolean).join(' ');
        },
        itemThumb(item) {
            if (item.image) return `https://i.imgur.com/${item.image}s.jpg`;
            if (item.imageUrl) return item.imageUrl;
            return '';
        },
        setSort(key) {
            if (this.sortKey === key) {
                this.sortAsc = !this.sortAsc;
            } else {
                this.sortKey = key;
                this.sortAsc = true;
            }
        },
        toggleSelectAll() {
            if (this.allSelected) {
                this.selected = [];
            } else {
                this.selected = this.filteredItems.map(i => i.id);
            }
        },
        openItemDetail(item) {
            openDialog('itemDetail', { item, categoryItem: null, category: null });
        },
        createItem() {
            this.$store.commit('newItem', { _isNew: true, name: '' });
            const newItem = this.library.items[this.library.items.length - 1];
            openDialog('itemDetail', { item: newItem, categoryItem: null, category: null, startEditing: true });
        },
        toggleBatchPanel(panel) {
            this.activeBatchPanel = this.activeBatchPanel === panel ? null : panel;
        },
        batchSwapNameDesc() {
            const ids = new Set(this.selected);
            this.allItems
                .filter(i => ids.has(i.id))
                .forEach(item => {
                    this.$store.commit('updateItem', { ...item, name: item.description, description: item.name });
                });
            this.selected = [];
            this.activeBatchPanel = null;
        },
        applyBatchCategory() {
            const ids = new Set(this.selected);
            this.allItems
                .filter(i => ids.has(i.id))
                .forEach(item => {
                    this.$store.commit('updateItem', { ...item, category: this.batchCategory });
                });
            this.selected = [];
            this.activeBatchPanel = null;
            this.batchCategory = '';
        },
        applyBatchTag() {
            if (!this.batchTag.trim()) return;
            const tag = this.batchTag.trim().toLowerCase();
            const ids = new Set(this.selected);
            this.allItems
                .filter(i => ids.has(i.id))
                .forEach(item => {
                    const tags = [...(item.tags || [])];
                    if (!tags.includes(tag)) tags.push(tag);
                    this.$store.commit('updateItem', { ...item, tags });
                });
            this.selected = [];
            this.activeBatchPanel = null;
            this.batchTag = '';
        },
        batchDelete() {
            const count = this.selected.length;
            const ids = new Set(this.selected);
            openSpeedbump(
                () => {
                    this.allItems
                        .filter(i => ids.has(i.id))
                        .forEach(item => {
                            this.$store.commit('removeItem', item);
                        });
                    this.selected = [];
                },
                { body: `Delete ${count} item${count > 1 ? 's' : ''}? This cannot be undone.` },
            );
        },
    },
};
</script>
