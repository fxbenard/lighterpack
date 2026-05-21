<style lang="scss">

#importValidate {
    height: 500px;
    overflow-y: scroll;
    width: 650px;
    background: #f8f6ef;

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
        color: #9b2c2c;
        margin-bottom: 20px;
    }

    .importBadge {
        background: #e7ebdf;
        border: 1px solid #c8cfbb;
        border-radius: 999px;
        display: inline-block;
        font-size: 12px;
        font-weight: 700;
        letter-spacing: 0.04em;
        padding: 4px 10px;
        text-transform: uppercase;

        &.isRejected {
            background: #f6e2de;
            border-color: #d9a39a;
            color: #8c2f1c;
        }
    }

    #importData {
        background: rgba(255, 255, 255, 0.72);
        border: 1px solid #d7dccd;
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
            background: #e9eee2;
            border-top: none;
            box-shadow: inset 0 -1px 0 #cbd2c0;
            font-size: 12px;
            font-weight: 700;
        }
    }

    .lpRow:nth-child(even):not(.lpHeader) .lpCell {
        background: rgba(245, 247, 241, 0.8);
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

</style>

<template>
    <div id="importCSV">
        <modal id="importValidate" :shown="shown" @hide="shown = false">
            <h2>Confirm your import <span v-if="importItemCount">({{ importItemCount }} items)</span></h2>
            <p class="importSummary">
                <span class="importBadge">{{ acceptedRowCount }} accepted</span>
                <span v-if="rejectedRowCount" class="importBadge isRejected">{{ rejectedRowCount }} rejected</span>
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
            <a id="importConfirm" class="lpButton" @click="importList">Import List</a>
            <a class="lpButton close" @click="shown = false">Cancel Import</a>
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

const csvImportUtils = require('../utils/csv-import.js');

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
    },
    mounted() {
        this.csvInput = this.$refs.csvInput;
        this.csvInput.onchange = this.importCSV;

        registerDialogOpener('importCSV', () => {
            this.csvInput.click();
        });
    },
    beforeDestroy() {
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

            if (!this.importData.data.length) {
                showGlobalAlert('Unable to load spreadsheet - please verify the format.');
            } else {
                this.shown = true;
            }
        },
        importList() {
            this.$store.commit('importCSV', this.importData);
            this.shown = false;
        },

    },
};
</script>
