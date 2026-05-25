<style lang="scss">
@import "../css/_globals";

.lp-list-enter-active {
    animation: lpSlideDown 0.2s ease-out;
}

.lp-list-leave-active {
    animation: lpSlideDown 0.15s ease-in reverse;
}

@keyframes lpSlideDown {
    from {
        opacity: 0;
        transform: translateY(-8px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

#listDescriptionContainer {
    margin: 25px 0;

    h3,
    p {
        display: inline-block;
        margin: 0 0 5px;
    }

    h3 {
        margin-right: 10px;
    }

    textarea {
        height: 65px;
        width: 100%;
    }
}

#getStarted {
    background: $color-bg;
    border-radius: $radius-lg;
    display: flex;
    flex-direction: column;
    justify-content: center;
    line-height: 1.7;
    margin-bottom: $spacingLarge;
    min-height: 200px;
    padding: $spacingLarge * 1.5;

    h2 {
        color: $color-text;
        font-size: 22px;
        font-weight: $fontWeight-bold;
        letter-spacing: -0.01em;
        line-height: 1.2;
        margin: 0 0 $spacingMedium;
    }

    p {
        color: $color-text-muted;
        font-size: $fontSize-base;
        margin: 0 0 $spacingSmall;
    }

    ol {
        color: $color-text-muted;
        margin: 0 0 $spacingMedium;
        padding-left: 20px;

        li {
            margin-bottom: 4px;
        }
    }

    & > *:last-child {
        margin-bottom: 0;
    }
}

</style>

<template>
    <div class="lpListBody">
        <div v-if="isListNew" id="getStarted">
            <h2>Welcome to LighterPack!</h2>
            <p>Here's what you need to get started:</p>
            <ol>
                <li>Click on things to edit them. Give your list and category a name.</li>
                <li>Add new categories and give items weights to start the visualization.</li>
                <li v-if="!isLocalSaving">
                    When you're done, share your list with others!
                </li>
            </ol>
            <p v-if="isLocalSaving" class="lpWarning">
                <strong>Note:</strong> Your data is being saved to your local computer. In order to share your lists please register an account.
            </p>
        </div>
        <list-summary v-if="!isListNew" :list="list" />


        <div style="clear: both;" />

        <div v-if="library.optionalFields['listDescription']" id="listDescriptionContainer">
            <h3>List Description</h3> <p>(<a href="https://guides.github.com/features/mastering-markdown/" target="_blank" class="lpHref">Markdown</a> supported)</p>
            <textarea id="listDescription" v-model="list.description" @input="updateListDescription" />
        </div>

        <TransitionGroup name="lp-list" tag="ul" ref="categories" class="lpCategories">
            <category v-for="category in categories" :key="category.id" :category="category" />
        </TransitionGroup>

        <hr>

        <a class="lpAdd addCategory" @click="newCategory"><i class="lpSprite lpSpriteAdd" />Add new category</a>
    </div>
</template>

<script>
import category from './category.vue';
import listSummary from './list-summary.vue';
import { getElementIndex } from '../utils/utils';
import { createDragDrop, getDatasetInt, queryContainers } from '../services/drag-drop';

export default {
    name: 'List',
    components: {
        listSummary,
        category,
        categoryDragStartIndex: false,
        itemDragId: false,
    },
    data() {
        return {
            onboardingCompleted: false,
            itemDrake: null,
            categoryDrake: null,
        };
    },
    computed: {
        library() {
            return this.$store.state.library;
        },
        list() {
            return this.$store.getters.activeList;
        },
        categories() {
            return this.list.categoryIds.map(id => this.library.getCategoryById(id));
        },
        isListNew() {
            return this.list.totalWeight === 0;
        },
        isLocalSaving() {
            return this.$store.state.saveType === 'local';
        },
    },
    watch: {
        categories() {
            this.$nextTick(() => {
                this.handleItemReorder();
            });
        },
    },
    mounted() {
        this.handleCategoryReorder();
        this.handleItemReorder();
    },
    beforeUnmount() {
        if (this.itemDrake) {
            this.itemDrake.destroy();
            this.itemDrake = null;
        }
        if (this.categoryDrake) {
            this.categoryDrake.destroy();
            this.categoryDrake = null;
        }
    },
    methods: {
        newCategory() {
            this.$store.commit('newCategory', this.list);
        },
        updateListDescription() {
            this.$store.commit('updateListDescription', this.list);
        },
        handleItemReorder() {
            if (this.itemDrake) {
                this.itemDrake.destroy();
            }
            const categoryItems = queryContainers(this.$el, '.lpItems');
            const drake = createDragDrop(categoryItems, {
                moves($el, $source, $handle, $sibling) {
                    return $handle.classList.contains('lpItemHandle');
                },
                accepts($el, $target, $source, $sibling) {
                    if (!$sibling || $sibling.classList.contains('lpItemsHeader')) {
                        return false; // header and footer are technically part of this list - exclude them both.
                    }
                    return true;
                },
            });
            drake.on('drag', ($el, $target, $source, $sibling) => {
                this.itemDragId = getDatasetInt($el, 'itemId');
            });
            drake.on('drop', ($el, $target, $source, $sibling) => {
                const categoryId = getDatasetInt($target, 'categoryId');
                if (this.itemDragId === null || categoryId === null) {
                    drake.cancel(true);
                    return;
                }
                this.$store.commit('reorderItem', {
                    list: this.list, itemId: this.itemDragId, categoryId, dropIndex: getElementIndex($el) - 1,
                });
                drake.cancel(true);
            });
            this.itemDrake = drake;
        },
        handleCategoryReorder() {
            if (this.categoryDrake) {
                this.categoryDrake.destroy();
            }

            const drake = createDragDrop([this.$refs.categories], {
                moves(el, $source, $handle, $sibling) {
                    return $handle.classList.contains('lpCategoryHandle');
                },
            });
            drake.on('drag', ($el, $target, $source, $sibling) => {
                this.categoryDragStartIndex = getElementIndex($el);
            });
            drake.on('drop', ($el, $target, $source, $sibling) => {
                this.$store.commit('reorderCategory', { list: this.list, before: this.categoryDragStartIndex, after: getElementIndex($el) });
                drake.cancel(true);
            });
            this.categoryDrake = drake;
        },
    },
};
</script>
