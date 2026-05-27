<style lang="scss">
@import "../css/_globals";

.lpQtySubtotal {
    padding-right: 25px;
}

.lpPriceSubtotal {
    padding-right: 4px;
}

.lpAddItemInput {
    border-radius: $radius-sm;
    border: none;
    border-bottom: 1px solid $color-border;
    background: transparent;
    color: $color-text;
    font-size: $fontSize-base;
    min-height: 42px;
    padding: 8px 10px;
    width: 100%;
    max-width: 260px;
    &:focus { outline: none; border-bottom-color: $color-accent; }
}

.lpAddItemCell {
    align-self: stretch;
    display: flex;
    flex-direction: column;
    justify-content: center;
    min-height: 56px;
    overflow: visible;
    position: relative;
}

.lpSuggestions {
    background: $color-surface;
    border: 1px solid $color-border;
    border-radius: $radius-sm;
    box-shadow: 0 4px 12px rgba(0,0,0,0.10);
    left: 0;
    list-style: none;
    margin: 0;
    padding: 4px 0;
    position: absolute;
    top: calc(100% + 6px);
    width: 260px;
    z-index: 50;
}

.lpSuggestion {
    align-items: center;
    cursor: pointer;
    display: flex;
    gap: 8px;
    padding: 6px 10px;
    &:hover { background: rgba(var(--color-accent-rgb), 0.07); }
}

.lpSuggestionName { flex: 1; font-size: $fontSize-sm; }
.lpSuggestionBrand { color: $color-text-muted; font-size: $fontSize-sm; }
.lpSuggestionWeight { color: $color-text-muted; font-size: $fontSize-sm; white-space: nowrap; }
</style>

<template>
    <li :id="category.id" class="lpCategory" :data-category-id="category.id">
        <ul class="lpItems lpDataTable" :data-category-id="category.id">
            <li class="lpHeader lpItemsHeader">
                <span class="lpHandleCell">
                    <div class="lpHandle lpCategoryHandle" title="Reorder this category" />
                </span>
                <input v-focus-on-create="category._isNew" type="text" :value="category.name" placeholder="Category Name" class="lpCategoryName lpSilent" @input="updateCategoryName">
                <span v-if="library.optionalFields['price']" class="lpPriceCell">Price</span>
                <span class="lpWeightCell">Weight</span>
                <span class="lpQtyCell">qty</span>
                <span class="lpRemoveCell"><a class="lpRemove lpRemoveCategory" title="Remove this category" @click="removeCategory(category)"><i class="lpSprite lpSpriteRemove" /></a></span>
            </li>
            <item v-for="itemContainer in itemContainers" :key="itemContainer.item.id" :item-container="itemContainer" :category="category" />
            <li class="lpFooter lpItemsFooter">
                <span class="lpAddItemCell">
                    <input
                        v-if="showSuggestions || newItemName || showInput"
                        v-model="newItemName"
                        type="text"
                        class="lpSilent lpAddItemInput"
                        placeholder="Item name..."
                        @input="onNewItemInput"
                        @keydown.enter.prevent="createInlineItem('description')"
                        @keydown.tab.exact.prevent="createInlineItem('description')"
                        @keydown.escape="dismissSuggestions"
                        @blur="dismissSuggestions"
                    />
                    <a v-else class="lpAdd lpAddItem" @click="showAddInput"><i class="lpSprite lpSpriteAdd" />Add new item</a>
                    <ul v-if="showSuggestions" class="lpSuggestions">
                        <li
                            v-for="item in suggestions"
                            :key="item.id"
                            class="lpSuggestion"
                            @mousedown.prevent="selectSuggestion(item)"
                        >
                            <span class="lpSuggestionName">{{ item.name }}</span>
                            <span v-if="item.brand" class="lpSuggestionBrand">{{ item.brand }}</span>
                            <span class="lpSuggestionWeight">{{ displayWeight(item.weight, item.authorUnit) }} {{ item.authorUnit }}</span>
                        </li>
                    </ul>
                </span>
                <span v-if="library.optionalFields['price']" class="lpPriceCell lpNumber lpSubtotal">
                    {{ displayPrice(category.subtotalPrice, library.currencySymbol) }}
                </span>
                <span class="lpWeightCell lpNumber lpSubtotal">
                    <span class="lpDisplaySubtotal">{{ displayWeight(category.subtotalWeight, displayUnit) }}</span>
                    <span class="lpSubtotalUnit">{{ displayUnit }}</span>
                </span>
                <span class="lpQtyCell lpSubtotal">
                    <span class="lpQtySubtotal">{{ category.subtotalQty }}</span>
                </span>
                <span class="lpRemoveCell" />
            </li>
        </ul>
    </li>
</template>

<script>
import item from './item.vue';
import { openSpeedbump } from '../services/speedbump';
import { useUtils } from '../composables/useUtils.js';
import { suggestItems } from '../composables/useGearMatcher.js';

const { displayWeight, displayPrice } = useUtils();

export default {
    name: 'Category',
    components: {
        item,
    },
    props: ['category'],
    data() {
        return {
            newItemName: '',
            suggestions: [],
            showSuggestions: false,
            showInput: false,
        };
    },
    computed: {
        library() {
            return this.$store.state.library;
        },
        itemContainers() {
            return this.category.categoryItems.map(categoryItem => ({ categoryItem, item: this.library.getItemById(categoryItem.itemId) }));
        },
        displayUnit() {
            if (this.library.totalUnit !== 'oz') {
                return this.library.totalUnit;
            }

            const units = {};
            this.itemContainers.forEach(({ item }) => {
                if (item && item.authorUnit) {
                    units[item.authorUnit] = true;
                }
            });

            const unitList = Object.keys(units);
            return unitList.length === 1 ? unitList[0] : this.library.totalUnit;
        },
    },
    methods: {
        displayWeight,
        displayPrice,
        createInlineItem(focusField = 'name') {
            const name = this.newItemName.trim();

            if (!name) {
                this.dismissSuggestions();
                return;
            }

            this.$store.commit('newItem', {
                category: this.category,
                _isNew: true,
                name,
            });

            const newItem = this.$store.state.library.items[this.$store.state.library.items.length - 1];

            this.newItemName = '';
            this.suggestions = [];
            this.showSuggestions = false;
            this.showInput = false;

            this.$nextTick(() => {
                const selector = focusField === 'description' ? '.lpDescription' : '.lpName';
                const field = this.$el.querySelector(`[data-item-id="${newItem.id}"] ${selector}`);
                if (field) {
                    field.focus();
                }
            });
        },
        onNewItemInput(evt) {
            this.suggestions = suggestItems(
                this.newItemName,
                this.library.items,
                this.category.name,
            );
            this.showSuggestions = this.suggestions.length > 0;
        },
        selectSuggestion(item) {
            this.$store.commit('addItemToCategory', { itemId: item.id, categoryId: this.category.id, dropIndex: this.category.categoryItems.length });
            this.newItemName = '';
            this.suggestions = [];
            this.showSuggestions = false;
            this.showInput = false;
        },
        dismissSuggestions() {
            setTimeout(() => {
                this.showSuggestions = false;
                this.newItemName = '';
                this.showInput = false;
            }, 150);
        },
        showAddInput() {
            this.showSuggestions = false;
            this.newItemName = '';
            this.showInput = true;
            this.$nextTick(() => {
                const input = this.$el.querySelector('.lpAddItemInput');
                if (input) input.focus();
            });
        },
        updateCategoryName(evt) {
            this.$store.commit('updateCategoryName', { id: this.category.id, name: evt.target.value });
        },
        removeCategory(category) {
            const callback = () => {
                this.$store.commit('removeCategory', category);
            };
            const speedbumpOptions = {
                body: 'Are you sure you want to delete this category? This cannot be undone.',
            };
            openSpeedbump(callback, speedbumpOptions);
        },
    },
};
</script>
