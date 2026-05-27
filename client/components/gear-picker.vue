<style lang="scss">
@import "../css/_globals";

#gearPickerDialog.lpModal {
    border-radius: $radius-md;
    max-height: 80vh;
    overflow-y: auto;
    padding: 0;
    width: min(480px, 92vw);
}

.gearPicker {
    display: flex;
    flex-direction: column;
}

.gearPickerHeader {
    background: $color-accent;
    border-radius: $radius-md $radius-md 0 0;
    color: #fff;
    padding: 16px 20px;
}

.gearPickerTitle {
    font-size: $fontSize-md;
    font-weight: $fontWeight-bold;
    margin: 0;
}

.gearPickerSubtitle {
    font-size: $fontSize-sm;
    margin: 2px 0 0;
    opacity: 0.8;
}

.gearPickerSearch {
    background: $color-bg;
    border: 1px solid $color-border;
    border-radius: $radius-sm;
    color: $color-text;
    font-size: $fontSize-sm;
    margin: 14px 16px 0;
    padding: 8px 12px;
    width: calc(100% - 32px);

    &:focus {
        border-color: $color-accent;
        outline: none;
    }

    &::placeholder {
        color: $color-text-muted;
    }
}

.gearPickerList {
    flex: 1;
    list-style: none;
    margin: 8px 0 0;
    overflow-y: auto;
    padding: 0 0 8px;
}

.gearPickerItem {
    align-items: center;
    border-bottom: 1px solid $color-border;
    cursor: pointer;
    display: flex;
    gap: 10px;
    padding: 10px 16px;

    &:last-child {
        border-bottom: none;
    }

    &:hover {
        background: $color-bg;
    }

    &.alreadyAdded {
        cursor: default;
        opacity: 0.45;
        pointer-events: none;
    }
}

.gearPickerItemName {
    flex: 1;
    font-size: $fontSize-sm;
    font-weight: $fontWeight-bold;
}

.gearPickerItemBrand {
    color: $color-text-muted;
    font-size: $fontSize-xs;
}

.gearPickerItemWeight {
    color: $color-text-muted;
    font-size: $fontSize-xs;
    white-space: nowrap;
}

.gearPickerEmpty {
    color: $color-text-muted;
    font-size: $fontSize-sm;
    padding: 20px 16px;
    text-align: center;
}

.gearPickerFooter {
    border-top: 1px solid $color-border;
    padding: 12px 16px;
}

.gearPickerCreate {
    width: 100%;
}
</style>

<template>
    <modal id="gearPickerDialog" :shown="shown" @hide="reset">
        <div class="gearPicker">
            <div class="gearPickerHeader">
                <p class="gearPickerTitle">Add gear</p>
                <p class="gearPickerSubtitle">to {{ categoryName }}</p>
            </div>

            <input
                v-model="search"
                class="gearPickerSearch"
                type="text"
                placeholder="Search by name or brand..."
            >

            <ul class="gearPickerList">
                <li
                    v-for="gearItem in filteredItems"
                    :key="gearItem.id"
                    :class="['gearPickerItem', { alreadyAdded: isAlreadyInCategory(gearItem) }]"
                    @click="pickItem(gearItem)"
                >
                    <span class="gearPickerItemName">{{ gearItem.name || 'Unnamed item' }}</span>
                    <span v-if="gearItem.brand" class="gearPickerItemBrand">{{ gearItem.brand }}</span>
                    <span class="gearPickerItemWeight">{{ formatWeight(gearItem.weight, gearItem.authorUnit) }}</span>
                </li>
                <li v-if="filteredItems.length === 0" class="gearPickerEmpty">
                    No matching gear found.
                </li>
            </ul>

            <div class="gearPickerFooter">
                <button class="lpButton lpSmall lpButtonSecondary gearPickerCreate" @click="createNew">
                    + Create new item{{ search ? ` "${search}"` : '' }}
                </button>
            </div>
        </div>
    </modal>
</template>

<script>
import modal from './modal.vue';
import { registerDialogOpener, unregisterDialogOpener, openDialog } from '../services/dialogs';
import { useUtils } from '../composables/useUtils.js';

const { displayWeight } = useUtils();

export default {
    name: 'GearPicker',
    components: { modal },
    data() {
        return {
            shown: false,
            search: '',
            category: null,
        };
    },
    computed: {
        library() {
            return this.$store.state.library;
        },
        categoryName() {
            return this.category ? (this.category.name || 'category') : 'list';
        },
        filteredItems() {
            const q = this.search.toLowerCase();
            return (this.library?.items || []).filter(gearItem =>
                !q ||
                (gearItem.name && gearItem.name.toLowerCase().includes(q)) ||
                (gearItem.brand && gearItem.brand.toLowerCase().includes(q))
            );
        },
    },
    mounted() {
        registerDialogOpener('gearPicker', ({ category }) => {
            this.category = category || null;
            this.search = '';
            this.shown = true;
        });
    },
    beforeUnmount() {
        unregisterDialogOpener('gearPicker');
    },
    methods: {
        formatWeight(weight, unit) {
            return `${displayWeight(weight, unit)} ${unit}`;
        },
        isAlreadyInCategory(gearItem) {
            if (!this.category) return false;
            return !!this.category.getCategoryItemById(gearItem.id);
        },
        pickItem(gearItem) {
            if (!this.category || this.isAlreadyInCategory(gearItem)) return;
            this.$store.commit('addItemToCategory', {
                itemId: gearItem.id,
                categoryId: this.category.id,
                dropIndex: this.category.categoryItems.length,
            });
            this.shown = false;
        },
        createNew() {
            this.$store.commit('newItem', {
                category: this.category,
                _isNew: true,
                name: this.search || '',
            });
            const newItem = this.$store.state.library.items[this.$store.state.library.items.length - 1];
            const categoryItem = this.category ? this.category.getCategoryItemById(newItem.id) : null;
            this.shown = false;
            openDialog('itemDetail', { item: newItem, categoryItem, category: this.category });
        },
        reset() {
            this.shown = false;
            this.search = '';
            this.category = null;
        },
    },
};
</script>
