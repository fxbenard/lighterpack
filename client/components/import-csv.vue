<style lang="scss">

#importValidate {
    height: 500px;
    overflow-y: scroll;
    width: 650px;

    .lpButton {
        margin-bottom: 30px;
    }
}

</style>

<template>
    <div id="importCSV">
        <modal id="importValidate" :shown="shown" @hide="shown = false">
            <h2>Confirm your import <span v-if="importItemCount">({{ importItemCount }} items)</span></h2>
            <div id="importData">
                <ul class="lpTable lpDataTable">
                    <li class="lpRow lpHeader">
                        <span class="lpCell">Item Name</span>
                        <span class="lpCell">Category</span>
                        <span class="lpCell">Description</span>
                        <span class="lpCell">Qty</span>
                        <span class="lpCell">Weight</span>
                        <span class="lpCell">Unit</span>
                        <span class="lpCell">Link</span>
                        <span class="lpCell">Price</span>
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
            <input id="csv" type="file" name="csv">
        </form>
    </div>
</template>

<script>
import modal from './modal.vue';

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
    },
    mounted() {
        this.csvInput = document.getElementById('csv');
        this.csvInput.onchange = this.importCSV;

        bus.$on('importCSV', () => {
            this.csvInput.click();
        });
    },
    methods: {
        importCSV(evt) {
            const file = evt.target.files[0];
            const name = file.name;

            if (file.name.length < 1) {
                return;
            }
            if (file.size > 1000000) {
                alert('File is too big');
                return;
            }
            if (name.substring(name.length - 4).toLowerCase() !== '.csv') {
                alert('Please select a CSV.');
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
                alert('Unable to load spreadsheet - please verify the format.');
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
