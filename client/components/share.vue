<style lang="scss">
#share label {
    font-weight: bold;
}
</style>

<template>
    <span v-if="isSignedIn" class="headerItem hasPopover">
        <PopoverHover id="share" @shown="focusShare">
            <template #target><span><i class="lpSprite lpLink" /> Share</span></template>
            <template #content><div class="lpFields">
                <div class="lpField">
                    <label for="shareUrl">Share your list</label>
                    <input id="shareUrl" ref="shareUrlInput" v-select-on-focus type="text" :value="shareUrl">
                </div>
                <div class="lpField">
                    <label for="listVisibility">Visibility</label>
                    <select id="listVisibility" :value="list.visibility" @change="setVisibility($event.target.value)">
                        <option value="private">Private</option>
                        <option value="shareable">Shareable by link</option>
                        <option value="discoverable">Discoverable</option>
                        <option value="indexable">Indexable</option>
                    </select>
                </div>
                <label class="lpField lpCheckboxField">
                    <input type="checkbox" :checked="list.allowSearchIndexing" @change="setSearchIndexing($event.target.checked)">
                    Allow search engines to index this list
                </label>
                <div class="lpField">
                    <label for="embedUrl">Embed your list</label>
                    <textarea id="embedUrl" v-select-on-focus>&lt;script src="{{ this.baseUrl }}/e/{{ this.externalId }}"&gt;&lt;/script&gt;&lt;div id="{{ this.externalId }}"&gt;&lt;/div&gt;</textarea>
                </div>
                <a id="csvUrl" :href="csvUrl" target="_blank" class="lpHref"><i class="lpSprite lpSpriteDownload" />Export to CSV</a>
            </div></template>
        </PopoverHover>
    </span>
</template>

<script>
import PopoverHover from './popover-hover.vue';
import { showGlobalAlert } from '../services/user-feedback';
import { fetchJson } from '../utils/utils';

export default {
    name: 'Share',
    components: {
        PopoverHover,
    },
    data() {
        return {
            shareReady: true,
        };
    },
    computed: {
        library() {
            return this.$store.state.library;
        },
        list() {
            return this.library.getListById(this.library.defaultListId);
        },
        isSignedIn() {
            return this.$store.state.loggedIn;
        },
        externalId() {
            return this.list.externalId || '';
        },
        baseUrl() {
            const location = window.location;
            return location.origin ? location.origin : `${location.protocol}//${location.hostname}`;
        },
        shareUrl() {
            if (this.externalId && this.shareReady) {
                return `${this.baseUrl}/p/${this.externalId}`;
            }
            return '';
        },
        csvUrl() {
            if (this.externalId) {
                return `${this.baseUrl}/csv/${this.externalId}`;
            }
            return '';
        },
    },
    methods: {
        selectShareUrl() {
            this.$nextTick(() => {
                if (this.$refs.shareUrlInput) {
                    this.$refs.shareUrlInput.select();
                }
            });
        },
        setVisibility(visibility) {
            this.$store.commit('updateListVisibility', {
                listId: this.list.id,
                visibility,
                allowSearchIndexing: visibility === 'indexable' && this.list.allowSearchIndexing,
            });
            return this.saveShareState().catch(() => {
                showGlobalAlert('An error occurred while attempting to save your sharing settings. Please try again later.');
            });
        },
        setSearchIndexing(allowSearchIndexing) {
            this.$store.commit('updateListVisibility', {
                listId: this.list.id,
                visibility: allowSearchIndexing ? 'indexable' : this.list.visibility,
                allowSearchIndexing,
            });
            return this.saveShareState().catch(() => {
                showGlobalAlert('An error occurred while attempting to save your sharing settings. Please try again later.');
            });
        },
        focusShare() {
            if (!this.list.externalId) {
                this.shareReady = false;
                return fetchJson('/externalId', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    credentials: 'same-origin',
                })
                    .then((response) => {
                        this.$store.commit('setExternalId', { externalId: response.externalId, list: this.list });
                        this.ensureShareable();
                        return this.saveShareState();
                    })
                    .then(() => {
                        this.shareReady = true;
                        this.selectShareUrl();
                    })
                    .catch(() => {
                        showGlobalAlert('An error occurred while attempting to get an ID for your list. Please try again later.');
                    });
            }
            this.ensureShareable();
            this.shareReady = false;
            return this.saveShareState()
                .then(() => {
                    this.shareReady = true;
                    this.selectShareUrl();
                })
                .catch(() => {
                    showGlobalAlert('An error occurred while attempting to save your sharing settings. Please try again later.');
                });
        },
        ensureShareable() {
            if (this.list.visibility === 'private') {
                this.$store.commit('updateListVisibility', {
                    listId: this.list.id,
                    visibility: 'shareable',
                    allowSearchIndexing: false,
                });
            }
        },
        saveShareState() {
            if (this.$store.state.saveType !== 'remote' || !this.$store.state.loggedIn) {
                return Promise.resolve();
            }

            const saveData = JSON.stringify(this.library.save());

            if (saveData === this.$store.state.lastSaveData) {
                return Promise.resolve();
            }

            this.$store.commit('setIsSaving', true);
            this.$store.commit('setLastSaveData', saveData);

            return fetchJson('/saveLibrary/', {
                method: 'POST',
                body: JSON.stringify({
                    syncToken: this.$store.state.syncToken,
                    username: this.$store.state.loggedIn,
                    data: saveData,
                }),
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'same-origin',
            })
                .then((response) => {
                    this.$store.commit('setSyncToken', response.syncToken);
                    this.$store.commit('setIsSaving', false);
                })
                .catch((error) => {
                    this.$store.commit('setIsSaving', false);
                    throw error;
                });
        },
    },
};
</script>
