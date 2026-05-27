<style lang="scss">
@import "../css/_globals";

#importValidate {
    height: 500px;
    overflow-y: scroll;
    width: 650px;
    background: $color-bg;

    .lpButton {
        margin-bottom: 30px;
    }

    .importSummary {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
        margin-bottom: 16px;
    }

    .importErrors {
        color: $color-danger;
        margin-bottom: 20px;
    }

    .importBadge {
        background: $color-control-muted;
        border: 1px solid $color-border;
        border-radius: 999px;
        display: inline-block;
        font-size: 12px;
        font-weight: 700;
        letter-spacing: 0.04em;
        padding: 4px 10px;
        text-transform: uppercase;

        &.isRejected {
            background: rgba(var(--color-danger-rgb), 0.1);
            border-color: rgba(var(--color-danger-rgb), 0.24);
            color: $color-danger;
        }

        &.isAmbiguous {
            background: rgba(var(--color-warning-rgb), 0.12);
            border-color: rgba(var(--color-warning-rgb), 0.32);
            color: $color-text;
        }
    }

    #importData {
        background: $color-surface-elevated;
        border: 1px solid $color-border;
        border-radius: 6px;
        margin-bottom: 20px;
        overflow: hidden;
    }

    .lpTable {
        border-collapse: separate;
        border-spacing: 0;
        width: 100%;
    }

    .lpCell {
        padding: 8px 10px;
    }

    .lpHeader {
        position: sticky;
        top: 0;
        z-index: 1;

        .lpCell {
            background: $color-control-muted;
            border-top: none;
            box-shadow: inset 0 -1px 0 $color-border;
            font-size: 12px;
            font-weight: 700;
        }
    }

    .lpRow:nth-child(even):not(.lpHeader) .lpCell {
        background: $color-control-muted;
    }

    .lpRow:not(.lpHeader) .lpCell:nth-child(4),
    .lpRow:not(.lpHeader) .lpCell:nth-child(5),
    .lpRow:not(.lpHeader) .lpCell:nth-child(8) {
        text-align: right;
    }

    .lpRow:not(.lpHeader) .lpCell:nth-child(9),
    .lpRow:not(.lpHeader) .lpCell:nth-child(10) {
        text-align: center;
    }
}

.importReview {
    margin-bottom: 20px;
    h3 { font-size: 14px; font-weight: 700; margin: 0 0 10px; }
}

.importReviewRow {
    align-items: center;
    border: 1px solid $color-border;
    border-radius: 6px;
    display: flex;
    gap: 12px;
    margin-bottom: 8px;
    padding: 10px;
}

.importReviewCol { flex: 1; }
.importReviewLabel { color: $color-text-muted; font-size: 11px; font-weight: 700; margin: 0 0 2px; text-transform: uppercase; }
.importReviewName { font-size: 13px; font-weight: 600; margin: 0 0 2px; }
.importReviewMeta { color: $color-text-muted; font-size: 12px; margin: 0; }
.importReviewActions { display: flex; flex-direction: column; gap: 6px; }
.lpButtonSm { font-size: 12px; padding: 4px 10px; }

</style>

<template>
    <div id="importCSV">
        <modal id="importValidate" :shown="shown" @hide="shown = false">
            <h2>Confirm your import <span v-if="importItemCount">({{ importItemCount }} items)</span></h2>
            <p class="importSummary">
                <span class="importBadge">{{ acceptedRowCount }} accepted</span>
                <span v-if="rejectedRowCount" class="importBadge isRejected">{{ rejectedRowCount }} rejected</span>
            </p>
            <p v-if="importData.mergeCount || reviewCount" class="importSummary">
                <span v-if="importData.mergeCount" class="importBadge">{{ importData.mergeCount }} will merge with existing gear</span>
                <span v-if="reviewCount" class="importBadge isAmbiguous">{{ reviewCount }} need your review</span>
            </p>
            <ul v-if="rejectedRowCount" class="importErrors">
                <li v-for="row in importData.rejectedRows" :key="row.rowNumber">
                    Row {{ row.rowNumber }}: {{ row.reason }}
                </li>
            </ul>
            <div id="importData">
                <ul class="lpTable lpDataTable">
                    <li class="lpRow lpHeader">
                        <span class="lpCell">Item Name</span>
                        <span class="lpCell">Category</span>
                        <span class="lpCell">Description</span>
                        <span class="lpCell lpNumber">Qty</span>
                        <span class="lpCell lpNumber">Weight</span>
                        <span class="lpCell">Unit</span>
                        <span class="lpCell">Link</span>
                        <span class="lpCell lpNumber">Price</span>
                        <span class="lpCell">Worn</span>
                        <span class="lpCell">Consumable</span>
                    </li>
                    <li v-for="(row, index) in importData.data" :key="index" class="lpRow">
                        <span class="lpCell">{{ row.name }}</span>
                        <span class="lpCell">{{ row.category }}</span>
                        <span class="lpCell">{{ row.description }}</span>
                        <span class="lpCell">{{ row.qty }}</span>
                        <span class="lpCell">{{ row.weight }}</span>
                        <span class="lpCell">{{ row.unit }}</span>
                        <span class="lpCell">{{ row.url ? 'Yes' : '' }}</span>
                        <span class="lpCell">{{ row.price }}</span>
                        <span class="lpCell">{{ row.worn ? 'Yes' : '' }}</span>
                        <span class="lpCell">{{ row.consumable ? 'Yes' : '' }}</span>
                    </li>
                </ul>
            </div>
            <div v-if="reviewCount" class="importReview">
                <h3>Review these items</h3>
                <div v-for="(row, index) in ambiguousRows" :key="index" class="importReviewRow">
                    <div class="importReviewCol">
                        <p class="importReviewLabel">Imported</p>
                        <p class="importReviewName">{{ row.name }}</p>
                        <p class="importReviewMeta">{{ row.weight }} {{ row.unit }}<span v-if="row.brand"> · {{ row.brand }}</span></p>
                    </div>
                    <div class="importReviewCol">
                        <p class="importReviewLabel">Existing match</p>
                        <p class="importReviewName">{{ row._match.item.name }}</p>
                        <p class="importReviewMeta">{{ displayWeight(row._match.item.weight, row._match.item.authorUnit) }} {{ row._match.item.authorUnit }}<span v-if="row._match.item.brand"> · {{ row._match.item.brand }}</span></p>
                    </div>
                    <div class="importReviewActions">
                        <button class="lpButton lpButtonSm" @click="resolveReview(index, 'merge')">Merge</button>
                        <button class="lpButton lpButtonSm lpButtonSecondary" @click="resolveReview(index, 'new')">Keep both</button>
                    </div>
                </div>
            </div>
            <div class="lpModalActions">
                <a class="lpButton close" @click="shown = false">Cancel Import</a>
                <a id="importConfirm" class="lpButton" @click="importList">Import List</a>
            </div>
        </modal>
        <form id="csvUpload">
            <input id="csv" ref="csvInput" type="file" name="csv">
        </form>
    </div>
</template>

<script>
import modal from './modal.vue';
import { registerDialogOpener, unregisterDialogOpener } from '../services/dialogs';
import { showGlobalAlert } from '../services/user-feedback';
import { findBestMatch } from '../composables/useGearMatcher.js';
import { useUtils } from '../composables/useUtils.js';

const csvImportUtils = require('../utils/csv-import.js');
const weightUtils = require('../utils/weight.js');
const { displayWeight } = useUtils();

function computeDedup(importData, libraryItems) {
    let mergeCount = 0;
    let reviewCount = 0;

    importData.data = importData.data.map(row => {
        const weightMg = weightUtils.WeightToMg(parseFloat(row.weight), row.unit);
        const match = findBestMatch(row, libraryItems, weightMg);
        if (match.decision === 'merge') mergeCount++;
        if (match.decision === 'review') reviewCount++;
        return { ...row, _match: match };
    });

    importData.mergeCount = mergeCount;
    importData.reviewCount = reviewCount;
    return importData;
}

export default {
    name: 'ImportCsv',
    components: {
        modal,
    },
    data() {
        return {
            csvInput: false,
            listId: false,
            importData: {},
            shown: false,
        };
    },
    computed: {
        library() {
            return this.$store.state.library;
        },
        importItemCount() {
            return this.importData.data ? this.importData.data.length : 0;
        },
        acceptedRowCount() {
            return this.importData.acceptedRows || this.importItemCount;
        },
        rejectedRowCount() {
            return this.importData.rejectedRows ? this.importData.rejectedRows.length : 0;
        },
        ambiguousRows() {
            if (!this.importData.data) return [];
            return this.importData.data.filter(row => row._match && row._match.decision === 'review');
        },
        reviewCount() {
            return this.ambiguousRows.length;
        },
    },
    mounted() {
        this.csvInput = this.$refs.csvInput;
        this.csvInput.onchange = this.importCSV;

        registerDialogOpener('importCSV', () => {
            this.csvInput.click();
        });
    },
    beforeUnmount() {
        if (this.csvInput) {
            this.csvInput.onchange = null;
        }
        unregisterDialogOpener('importCSV');
    },
    methods: {
        importCSV(evt) {
            const file = evt.target.files[0];
            const name = file.name;

            if (file.name.length < 1) {
                return;
            }
            if (file.size > 1000000) {
                showGlobalAlert('File is too big');
                return;
            }
            if (name.substring(name.length - 4).toLowerCase() !== '.csv') {
                showGlobalAlert('Please select a CSV.');
                return;
            }
            const reader = new FileReader();

            reader.onload = ((theFile) => {
                this.validateImport(theFile.target.result, file.name.substring(0, file.name.length - 4).replace(/_/g, ' '));
            });

            reader.readAsText(file);
        },
        validateImport(input, name) {
            this.importData = csvImportUtils.parseImportCsv(input, name);
            this.importData = computeDedup(this.importData, this.library.items);

            if (!this.importData.data.length) {
                showGlobalAlert('Unable to load spreadsheet - please verify the format.');
            } else {
                this.shown = true;
            }
        },
        importList() {
            this.$store.commit('importCSV', this.importData);
            this.shown = false;
            if (this.csvInput) this.csvInput.value = '';
        },
        displayWeight,
        resolveReview(rowIndex, decision) {
            const ambiguous = this.importData.data.filter(row => row._match && row._match.decision === 'review');
            const row = ambiguous[rowIndex];
            if (row) row._match.decision = decision;
        },
    },
};
</script>
