<style lang="scss">
@import "../css/_globals";

#libraryContainer {
    display: flex;
    flex: 2 0 30vh;
    flex-direction: column;
}

#library {
    flex: 1 0 25vh;
    overflow-y: scroll;
}

#librarySearch {
    background: $color-bg;
    border: 1px solid $color-border;
    border-radius: $radius-sm;
    color: $color-text;
    margin-bottom: 15px;
    padding: 6px 8px;
    width: 100%;

    &::placeholder {
        color: $color-text-muted;
    }

    &:focus {
        border-color: $color-accent;
        outline: none;
    }
}

.lpLibraryItem {
    border-top: 1px solid $color-border;
    color: $color-text;
    list-style: none;
    margin: 0 10px 4px;
    min-height: 43px;
    overflow: hidden;
    padding: 7px 8px 4px 15px;
    position: relative;
    transition: background $transitionDurationFast ease, color $transitionDurationFast ease;

    &:first-child {
        border-top: none;
        padding-top: 10px;
    }

    &:last-child {
        border-bottom: none;
    }

    &.gu-mirror {
        background: $color-bg;
        border: 1px solid $color-border;
        color: $color-text;
    }

    &:hover {
        background: rgba(var(--color-accent-rgb), 0.04);
    }

    .lpName {
        float: left;
        margin: 0;
        max-width: 190px;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    .lpWeight {
        color: $color-text-muted;
        float: right;
        font-variant-numeric: tabular-nums;
        width: auto;
    }

    .lpDescription {
        clear: both;
        color: $color-text-muted;
        display: block;
        font-size: $fontSize-sm;
        overflow: hidden;
        text-overflow: ellipsis;
        width: 235px;
    }

    .lpHandle {
        height: 80px;
        left: 0;
        position: absolute;
        top: 5px;
    }

    .lpRemove {
        bottom: 0;
        position: absolute;
        right: 14px;
    }

    #library.lpSearching & {
        display: none;
    }

    #library.lpSearching &.lpHit {
        display: block;
    }

    #main > & {
        background: $color-surface;
        border: 1px solid $color-border;
        color: $color-text;
        padding: 10px;
        width: 235px;
    }
}
</style>

<template>
    <section id="libraryContainer">
        <h2>Gear</h2>
        <input id="librarySearch" v-model="searchText" type="text" placeholder="search items">
        <ul id="library" ref="library">
            <li v-for="item in filteredItems" :key="item.id" class="lpLibraryItem" :data-item-id="item.id">
                <a v-if="item.url" :href="item.url" target="_blank" class="lpName lpHref">{{ item.name }}</a>
                <span v-if="!item.url" class="lpName">{{ item.name }}</span>
                <span class="lpWeight">
                    {{ displayWeight(item.weight, item.authorUnit) }}
                    {{ item.authorUnit }}
                </span>
                <span class="lpDescription">
                    {{ item.description }}
                </span>
                <a class="lpRemove lpRemoveLibraryItem speedbump" title="Delete this item permanently" @click="removeItem(item)"><i class="lpSprite lpSpriteRemove" /></a>
                <div v-if="!item.inCurrentList" class="lpHandle lpLibraryItemHandle" title="Reorder this item" />
            </li>
        </ul>
    </section>
</template>

<script>
import { useUtils } from '../composables/useUtils.js';
import { openSpeedbump } from '../services/speedbump';
import { getElementIndex } from '../utils/utils';
import { createDragDrop, getDatasetInt, queryContainers } from '../services/drag-drop';

const { displayWeight, displayPrice } = useUtils();

export default {
    name: 'LibraryItem',
    props: ['item'],
    data() {
        return {
            searchText: '',
            itemDragId: false,
            drake: null,
        };
    },
    computed: {
        library() {
            return this.$store.state.library;
        },
        filteredItems() {
            let i;
            let item;
            let filteredItems = [];
            if (!this.searchText) {
                filteredItems = this.library.items.map(item => ({ ...item }));
            } else {
                const lowerCaseSearchText = this.searchText.toLowerCase();

                for (i = 0; i < this.library.items.length; i++) {
                    item = this.library.items[i];
                    if (item.name.toLowerCase().indexOf(lowerCaseSearchText) > -1 || item.description.toLowerCase().indexOf(lowerCaseSearchText) > -1) {
                        filteredItems.push({ ...item });
                    }
                }
            }

            const currentListItems = this.library.getItemsInCurrentList();

            for (i = 0; i < filteredItems.length; i++) {
                item = filteredItems[i];
                if (currentListItems.indexOf(item.id) > -1) {
                    item.inCurrentList = true;
                }
            }

            return filteredItems;
        },
        list() {
            return this.library.getListById(this.library.defaultListId);
        },
        categories() {
            return this.list.categoryIds.map(id => this.library.getCategoryById(id));
        },
    },
    watch: {
        categories() {
            this.$nextTick(() => {
                this.handleItemDrag();
            });
        },
    },
    mounted() {
        this.handleItemDrag();
    },
    beforeUnmount() {
        if (this.drake) {
            this.drake.destroy();
            this.drake = null;
        }
    },
    methods: {
        displayWeight,
        displayPrice,
        handleItemDrag() {
            if (this.drake) {
                this.drake.destroy();
            }

            const self = this;
            const editorRoot = this.$root && this.$root.$el ? this.$root.$el : this.$el;
            const categoryItems = queryContainers(editorRoot, '.lpItems');
            const drake = createDragDrop([this.$refs.library].concat(categoryItems), {
                copy: true,
                moves($el, $source, $handle, $sibling) {
                    const items = self.library.getItemsInCurrentList();
                    if (items.indexOf(parseInt($el.dataset.itemId)) > -1) {
                        return false;
                    }
                    return $handle.classList.contains('lpLibraryItemHandle');
                },
                accepts($el, $target, $source, $sibling) {
                    if ($target.id === 'library' || !$sibling || $sibling.classList.contains('lpItemsHeader')) {
                        return false; // header and footer are technically part of this list - exclude them both.
                    }
                    return true;
                },
            });
            drake.on('drag', ($el, $target, $source, $sibling) => {
                this.itemDragId = getDatasetInt($el, 'itemId');
            });
            drake.on('drop', ($el, $target, $source, $sibling) => {
                if (!$target || $target.id === 'library') {
                    return;
                }
                const categoryId = getDatasetInt($target, 'categoryId');
                if (this.itemDragId === null || categoryId === null) {
                    drake.cancel(true);
                    return;
                }
                this.$store.commit('addItemToCategory', { itemId: this.itemDragId, categoryId, dropIndex: getElementIndex($el) - 1 });
                drake.cancel(true);
            });
            this.drake = drake;
        },
        removeItem(item) {
            const callback = () => {
                this.$store.commit('removeItem', item);
            };
            const speedbumpOptions = {
                body: 'Are you sure you want to delete this item? This cannot be undone.',
            };
            openSpeedbump(callback, speedbumpOptions);
        },
    },
};
</script>
