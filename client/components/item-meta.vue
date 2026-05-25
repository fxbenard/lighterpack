<style lang="scss">
@import "../css/_globals";

.itemMetaForm {
    display: flex;
    flex-direction: column;
    gap: 12px;
    min-width: 320px;

    label {
        display: block;
        font-size: $fontSize-sm;
        font-weight: $fontWeight-medium;
        margin-bottom: 4px;
    }

    input[type="text"],
    select {
        border: 1px solid $color-border;
        border-radius: $radius-sm;
        font-size: $fontSize-base;
        padding: 6px 8px;
        width: 100%;
    }

    .itemMetaTags {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
        margin-top: 4px;
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

            &:hover {
                color: $color-text;
            }
        }
    }

    .itemMetaTagInput {
        display: flex;
        gap: 6px;

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

            &:hover {
                background: $color-bg;
            }
        }
    }

    .itemMetaActions {
        display: flex;
        gap: 8px;
        justify-content: flex-end;
        margin-top: 4px;
    }
}
</style>

<template>
    <modal id="itemMetaDialog" :shown="shown" @hide="cancel">
        <h2>Edit gear details</h2>
        <form class="itemMetaForm" @submit.prevent="save">
            <div>
                <label for="itemMetaBrand">Brand</label>
                <input id="itemMetaBrand" v-model="brand" type="text" placeholder="e.g. Sea to Summit">
            </div>
            <div>
                <label for="itemMetaCategory">Category</label>
                <select id="itemMetaCategory" v-model="category">
                    <option value="">— none —</option>
                    <option v-for="cat in gearCategories" :key="cat" :value="cat">{{ cat }}</option>
                </select>
            </div>
            <div>
                <label>Tags</label>
                <div class="itemMetaTags">
                    <span v-for="tag in tags" :key="tag" class="itemMetaTag">
                        {{ tag }}
                        <button type="button" @click="removeTag(tag)">×</button>
                    </span>
                </div>
                <div class="itemMetaTagInput">
                    <input v-model="tagInput" type="text" placeholder="Add a tag…" @keydown.enter.prevent="addTag">
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
    'Shelter', 'Sleep', 'Clothing', 'Water', 'Food', 'Cook',
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
        };
    },
    computed: {
        gearCategories() {
            return GEAR_CATEGORIES;
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
