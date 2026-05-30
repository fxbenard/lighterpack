<style lang="scss">
@import "../css/_globals";

.itemMetaForm {
    display: flex;
    flex-direction: column;
    gap: 14px;
    min-width: 320px;
}

.itemMetaField {
    display: flex;
    flex-direction: column;
    gap: 4px;
    position: relative;
}

.itemMetaLabel {
    color: $color-text-muted;
    font-size: $fontSize-xs;
    font-weight: $fontWeight-bold;
    letter-spacing: $letterSpacing-caps;
    text-transform: uppercase;
}

.itemMetaInput,
.itemMetaSelect {
    appearance: none;
    background: $color-bg;
    border: 1px solid $color-border;
    border-radius: $radius-md;
    box-sizing: border-box;
    color: $color-text;
    font-family: $font-family-base;
    font-size: $fontSize-base;
    min-height: 38px;
    padding: 0 12px;
    width: 100%;

    &:focus {
        border-color: $color-accent;
        box-shadow: 0 0 0 4px rgba(var(--color-accent-rgb), 0.1);
        outline: none;
    }
}

.itemMetaSelectWrap {
    position: relative;

    &::after {
        color: $color-text-muted;
        content: "⌄";
        font-size: 18px;
        line-height: 1;
        pointer-events: none;
        position: absolute;
        right: 10px;
        top: 50%;
        transform: translateY(-54%);
    }

    .itemMetaSelect {
        padding-right: 30px;
    }
}

.itemMetaBrandSuggestions {
    background: $color-surface;
    border: 1px solid $color-border;
    border-radius: $radius-md;
    box-shadow: $shadow-popover;
    left: 0;
    list-style: none;
    margin: 0;
    padding: 4px 0;
    position: absolute;
    right: 0;
    max-height: 188px;
    overflow-y: auto;
    top: calc(100% + 4px);
    z-index: 10;
}

.itemMetaBrandSuggestion {
    cursor: pointer;
    font-size: $fontSize-base;
    padding: 8px 12px;
    transition: background $transitionDurationFast ease;

    &:hover,
    &.active {
        background: rgba(var(--color-accent-rgb), 0.08);
        color: $color-accent;
    }
}

.itemMetaTags {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    margin-top: 2px;
}

.itemMetaTag {
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

.itemMetaTagInput {
    display: flex;
    gap: 6px;
    margin-top: 4px;

    input {
        flex: 1;
    }

    button {
        background: $color-surface;
        border: 1px solid $color-border;
        border-radius: $radius-sm;
        cursor: pointer;
        font-size: $fontSize-sm;
        padding: 4px 10px;

        &:hover { background: $color-bg; }
    }
}

.itemMetaActions {
    display: flex;
    gap: 8px;
    justify-content: flex-end;
    margin-top: 4px;
}
</style>

<template>
    <modal id="itemMetaDialog" :shown="shown" @hide="cancel">
        <h2>Edit gear details</h2>
        <form class="itemMetaForm" @submit.prevent="save">
            <div class="itemMetaField">
                <span class="itemMetaLabel">Brand</span>
                <input
                    id="itemMetaBrand"
                    v-model="brand"
                    type="text"
                    class="itemMetaInput"
                    placeholder="e.g. Sea to Summit"
                    autocomplete="off"
                    @focus="brandDropdownOpen = true; brandActiveIndex = -1"
                    @blur="closeBrandDropdown"
                    @keydown.down.prevent="moveBrandIndex(1)"
                    @keydown.up.prevent="moveBrandIndex(-1)"
                    @keydown.enter.prevent="selectBrandSuggestion(brandActiveIndex)"
                    @keydown.escape="brandDropdownOpen = false; brandActiveIndex = -1"
                >
                <ul v-if="brandDropdownOpen && brandSuggestionsFiltered.length" ref="brandList" class="itemMetaBrandSuggestions">
                    <li
                        v-for="(b, i) in brandSuggestionsFiltered"
                        :key="b"
                        class="itemMetaBrandSuggestion"
                        :class="{ active: i === brandActiveIndex }"
                        @mousedown.prevent="brand = b; brandDropdownOpen = false; brandActiveIndex = -1"
                    >{{ b }}</li>
                </ul>
            </div>

            <div class="itemMetaField">
                <span class="itemMetaLabel">Type</span>
                <div class="itemMetaSelectWrap">
                    <select id="itemMetaCategory" v-model="category" class="itemMetaSelect">
                        <option value="">— none —</option>
                        <option v-for="cat in gearCategories" :key="cat" :value="cat">{{ cat }}</option>
                    </select>
                </div>
            </div>

            <div class="itemMetaField">
                <span class="itemMetaLabel">Tags</span>
                <div class="itemMetaTags">
                    <span v-for="tag in tags" :key="tag" class="itemMetaTag">
                        {{ tag }}
                        <button type="button" @click="removeTag(tag)">×</button>
                    </span>
                </div>
                <div class="itemMetaTagInput">
                    <input v-model="tagInput" type="text" class="itemMetaInput" placeholder="Add a tag…" @keydown.enter.prevent="addTag">
                    <button type="button" @click="addTag">Add</button>
                </div>
            </div>

            <div class="itemMetaActions">
                <a class="lpHref close" @click="cancel">Cancel</a>
                <input type="submit" class="lpButton" value="Save">
            </div>
        </form>
    </modal>
</template>

<script>
import modal from './modal.vue';
import { registerDialogOpener, unregisterDialogOpener } from '../services/dialogs';

const GEAR_CATEGORIES = [
    'Pack & Bags', 'Shelter', 'Sleep', 'Clothing', 'Water', 'Food', 'Cook',
    'Navigation', 'Safety', 'Hygiene', 'Essentials', 'Other',
];

export default {
    name: 'ItemMeta',
    components: { modal },
    data() {
        return {
            shown: false,
            item: null,
            brand: '',
            category: '',
            tags: [],
            tagInput: '',
            brandDropdownOpen: false,
            brandActiveIndex: -1,
        };
    },
    computed: {
        gearCategories() {
            return GEAR_CATEGORIES;
        },
        knownBrands() {
            const library = this.$store.state.library;
            if (!library || !library.items) return [];
            return [...new Set(
                library.items.map((i) => i.brand).filter(Boolean),
            )].sort();
        },
        brandSuggestionsFiltered() {
            if (!this.brand) return this.knownBrands;
            const q = this.brand.toLowerCase();
            return this.knownBrands.filter(b => b.toLowerCase().includes(q));
        },
    },
    mounted() {
        registerDialogOpener('itemMeta', (item) => {
            this.item = item;
            this.brand = item.brand || '';
            this.category = item.category || '';
            this.tags = [...(item.tags || [])];
            this.tagInput = '';
            this.shown = true;
        });
    },
    beforeUnmount() {
        unregisterDialogOpener('itemMeta');
    },
    methods: {
        closeBrandDropdown() {
            setTimeout(() => { this.brandDropdownOpen = false; this.brandActiveIndex = -1; }, 150);
        },
        moveBrandIndex(dir) {
            const max = this.brandSuggestionsFiltered.length - 1;
            this.brandActiveIndex = Math.min(Math.max(this.brandActiveIndex + dir, -1), max);
            this.$nextTick(() => {
                const list = this.$refs.brandList;
                if (!list) return;
                const active = list.children[this.brandActiveIndex];
                if (active) active.scrollIntoView({ block: 'nearest' });
            });
        },
        selectBrandSuggestion(index) {
            if (index >= 0 && index < this.brandSuggestionsFiltered.length) {
                this.brand = this.brandSuggestionsFiltered[index];
            }
            this.brandDropdownOpen = false;
            this.brandActiveIndex = -1;
        },
        addTag() {
            const tag = this.tagInput.trim().toLowerCase();
            if (tag && !this.tags.includes(tag)) {
                this.tags.push(tag);
            }
            this.tagInput = '';
        },
        removeTag(tag) {
            this.tags = this.tags.filter((t) => t !== tag);
        },
        save() {
            this.$store.commit('updateItem', {
                ...this.item,
                brand: this.brand.trim(),
                category: this.category,
                tags: [...this.tags],
            });
            this.shown = false;
        },
        cancel() {
            this.shown = false;
        },
    },
};
</script>
