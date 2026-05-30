<style lang="scss">
@import "../css/_globals";

.sharePopover {
    display: flex;
    flex-direction: column;
    gap: 16px;
    min-width: 280px;
    padding: 4px 0;
}

.shareSection {
    display: flex;
    flex-direction: column;
    gap: 6px;
}

.shareLabel {
    color: $color-text-muted;
    font-size: $fontSize-xs;
    font-weight: $fontWeight-bold;
    letter-spacing: $letterSpacing-caps;
    text-transform: uppercase;
}

.shareInput {
    appearance: none;
    background: $color-bg;
    border: 1px solid $color-border;
    border-radius: $radius-md;
    box-sizing: border-box;
    color: $color-text;
    font-size: $fontSize-sm;
    font-variant-numeric: tabular-nums;
    min-height: 36px;
    padding: 0 10px;
    width: 100%;

    &:focus {
        border-color: $color-accent;
        box-shadow: 0 0 0 4px rgba(var(--color-accent-rgb), 0.1);
        outline: none;
    }
}

.shareSelectWrap {
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
}

.shareSelect {
    appearance: none;
    background: $color-bg;
    border: 1px solid $color-border;
    border-radius: $radius-md;
    box-sizing: border-box;
    color: $color-text;
    font-size: $fontSize-sm;
    min-height: 36px;
    padding: 0 32px 0 10px;
    width: 100%;

    &:focus {
        border-color: $color-accent;
        box-shadow: 0 0 0 4px rgba(var(--color-accent-rgb), 0.1);
        outline: none;
    }
}

.shareCheckbox {
    align-items: center;
    color: $color-text;
    cursor: pointer;
    display: flex;
    font-size: $fontSize-sm;
    gap: 8px;

    input[type="checkbox"] {
        accent-color: $color-accent;
        cursor: pointer;
        flex-shrink: 0;
        height: 15px;
        width: 15px;
    }
}

.shareTextarea {
    appearance: none;
    background: $color-bg;
    border: 1px solid $color-border;
    border-radius: $radius-md;
    box-sizing: border-box;
    color: $color-text-muted;
    font-family: ui-monospace, monospace;
    font-size: 11px;
    line-height: 1.5;
    min-height: 64px;
    padding: 8px 10px;
    resize: none;
    width: 100%;

    &:focus {
        border-color: $color-accent;
        box-shadow: 0 0 0 4px rgba(var(--color-accent-rgb), 0.1);
        outline: none;
    }
}

.shareDivider {
    border: none;
    border-top: 1px solid $color-border;
    margin: 0;
}

.shareFooter {
    align-items: center;
    display: flex;
    justify-content: space-between;
}

.shareCsvLink {
    align-items: center;
    color: $color-text-muted;
    display: flex;
    font-size: $fontSize-sm;
    gap: 4px;
    text-decoration: none;
    transition: color $transitionDurationFast ease;

    &:hover {
        color: $color-accent;
    }
}
</style>

<template>
    <span v-if="isSignedIn" class="headerItem hasPopover">
        <PopoverHover id="share" @shown="focusShare">
            <template #target><span><i class="lpSprite lpLink" /> Share</span></template>
            <template #content>
                <div class="sharePopover">
                    <div class="shareSection">
                        <div class="shareLabel">Share link</div>
                        <input id="shareUrl" ref="shareUrlInput" v-select-on-focus type="text" class="shareInput" :value="shareUrl" readonly>
                    </div>

                    <div class="shareSection">
                        <div class="shareLabel">Visibility</div>
                        <div class="shareSelectWrap">
                            <select id="listVisibility" class="shareSelect" :value="list.visibility" @change="setVisibility($event.target.value)">
                                <option value="private">Private</option>
                                <option value="shareable">Shareable by link</option>
                                <option value="discoverable">Discoverable</option>
                                <option value="indexable">Indexable</option>
                            </select>
                        </div>
                        <label class="shareCheckbox">
                            <input type="checkbox" :checked="list.allowSearchIndexing" @change="setSearchIndexing($event.target.checked)">
                            Allow search engines to index this list
                        </label>
                    </div>

                    <div class="shareSection">
                        <div class="shareLabel">Embed</div>
                        <textarea v-select-on-focus class="shareTextarea" readonly>&lt;script src="{{ this.baseUrl }}/e/{{ this.externalId }}"&gt;&lt;/script&gt;&lt;div id="{{ this.externalId }}"&gt;&lt;/div&gt;</textarea>
                    </div>

                    <hr class="shareDivider">

                    <div class="shareFooter">
                        <a :href="csvUrl" target="_blank" class="shareCsvLink">
                            <i class="lpSprite lpSpriteDownload" /> Export to CSV
                        </a>
                    </div>
                </div>
            </template>
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
