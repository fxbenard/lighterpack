<style lang="scss">
@import "../css/_globals";

#itemImageDialog.lpModal {
    width: min(760px, calc(100vw - 32px));
}

.imageUploadDescription {
    margin-bottom: 16px;
}

#itemImageUrlForm {
    display: flex;
    flex-direction: column;
    height: 100%;
}

.itemImageActions {
    align-items: center;
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    margin-top: auto;
}

.itemImageStatus {
    color: $color-text-muted;
    font-size: $fontSize-sm;
    margin-top: 12px;
}
</style>

<template>
    <div>
        <modal id="itemImageDialog" :shown="shown" @hide="shown = false">
            <h2>Add or update item image</h2>
            <div class="lpModalSplit">
                <div class="lpModalPanel">
                    <h3>Add image by URL</h3>
                    <form id="itemImageUrlForm" @submit.prevent="saveImageUrl()">
                        <div class="lpModalBody">
                            <div>
                                <label for="itemImageUrl">Image URL</label>
                                <input id="itemImageUrl" v-model="imageUrl" type="text" placeholder="https://example.com/image.jpg">
                            </div>
                        </div>
                        <div class="itemImageActions">
                            <a class="lpHref close" @click="shown = false">Cancel</a>
                            <input type="submit" class="lpButton" value="Save URL">
                        </div>
                    </form>
                </div>
                <div class="lpModalPanel">
                    <h3>Upload from disk</h3>
                    <template v-if="!item.image">
                        <p class="imageUploadDescription">
                            Your image will be hosted on imgur.
                        </p>
                        <button id="itemImageUpload" class="lpButton" @click="triggerImageUpload">
                            Upload Image
                        </button>
                        <a class="lpHref close" @click="shown = false">Cancel</a>
                        <p v-if="uploading" class="itemImageStatus">
                            Uploading image...
                        </p>
                    </template>
                    <template v-if="item.image">
                        <button id="itemImageUpload" class="lpButton" @click="removeItemImage">
                            Remove Image
                        </button>
                    </template>
                </div>
            </div>
        </modal>
        <form id="imageUpload" ref="imageUploadForm">
            <input id="image" type="file" name="image" ref="imageInput" @change="uploadImage">
        </form>
    </div>
</template>

<script>
import modal from './modal.vue';
import { registerDialogOpener, unregisterDialogOpener } from '../services/dialogs';
import { showGlobalAlert } from '../services/user-feedback';
import { fetchJson } from '../utils/utils';

export default {
    name: 'ItemImage',
    components: {
        modal,
    },
    data() {
        return {
            imageUrl: null,
            item: false,
            uploading: false,
            shown: false,
        };
    },
    mounted() {
        registerDialogOpener('itemImage', (item) => {
            this.shown = true;
            this.item = item;
            this.imageUrl = item.imageUrl;
        });
    },
    beforeUnmount() {
        unregisterDialogOpener('itemImage');
    },
    methods: {
        saveImageUrl() {
            this.$store.commit('updateItemImageUrl', { imageUrl: this.imageUrl, item: this.item });
            this.shown = false;
        },
        triggerImageUpload() {
            this.$refs.imageInput.click();
        },
        uploadImage(evt) {
            if (!FormData) {
                showGlobalAlert('Your browser is not supported for file uploads. Please update to a more modern browser.');
                return;
            }
            const file = evt.target.files[0];
            const name = file.name;
            const size = file.size;
            const type = file.type;

            if (name.length < 1) {
                return;
            }
            if (size > 2500000) {
                showGlobalAlert('Please upload a file less than 2.5mb');
                return;
            }
            if (type != 'image/png' && type != 'image/jpg' && !type != 'image/gif' && type != 'image/jpeg') {
                showGlobalAlert('File doesnt match png, jpg or gif.');
                return;
            }
            const formData = new FormData(this.$refs.imageUploadForm);

            this.uploading = true;

            return fetchJson('/imageUpload', {
                method: 'POST',
                body: formData,
                credentials: 'same-origin',
            })
                .then((response) => {
                    this.uploading = false;
                    this.$store.commit('updateItemImage', { image: response.data.id, item: this.item });
                    this.shown = false;
                }).catch(() => {
                    this.uploading = false;
                    showGlobalAlert('Upload failed! If this issue persists please file a bug.');
                });
        },
        removeItemImage() {
            this.$store.commit('removeItemImage', this.item);
            this.item.image = '';
        },
    },
};
</script>
