<style lang="scss">
@import "../css/_globals";

#accountSettings {
    width: min(640px, calc(100vw - 32px));
}

.accountSettingsTitle {
    font-size: 20px;
    font-weight: $fontWeight-bold;
    margin: 0 0 24px;
}

.accountSection {
    border-bottom: 1px solid $color-border;
    margin-bottom: 28px;
    padding-bottom: 28px;
}

.accountFieldGroup {
    display: flex;
    flex-direction: column;
    gap: 10px;
    margin-bottom: 16px;
}

.accountFieldGroupDivider {
    border: none;
    border-top: 1px solid $color-border;
    margin: 4px 0;
}

.accountField {
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.accountFieldLabel {
    color: $color-text-muted;
    font-size: $fontSize-xs;
    font-weight: $fontWeight-bold;
    letter-spacing: $letterSpacing-caps;
    text-transform: uppercase;
}

.accountFieldInput {
    appearance: none;
    background: $color-bg;
    border: 1px solid $color-border;
    border-radius: $radius-md;
    box-sizing: border-box;
    color: $color-text;
    font-family: $font-family-base;
    font-size: $fontSize-base;
    min-height: 40px;
    padding: 0 12px;
    width: 100%;

    &:focus {
        border-color: $color-accent;
        box-shadow: 0 0 0 4px rgba(var(--color-accent-rgb), 0.1);
        outline: none;
    }

    &:disabled {
        background: $color-control-muted;
        color: $color-text-muted;
        cursor: not-allowed;
    }
}

.accountActions {
    align-items: center;
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
    margin-top: 20px;

    .lpButton {
        min-width: 120px;
    }
}

.accountActionsRight {
    display: flex;
    gap: 12px;
    margin-left: auto;
}

.accountCancelLink {
    align-items: center;
    color: $color-text-muted;
    cursor: pointer;
    display: flex;
    font-size: $fontSize-sm;
    text-decoration: none;
    transition: color $transitionDurationFast ease;

    &:hover {
        color: $color-text;
    }
}

.accountDangerLink {
    align-items: center;
    color: $color-text-muted;
    cursor: pointer;
    display: flex;
    font-size: $fontSize-sm;
    text-decoration: none;
    transition: color $transitionDurationFast ease;

    &:hover {
        color: $color-danger;
    }
}

@media (max-width: 640px) {
    .accountActions {
        flex-direction: column;
        align-items: stretch;

        .lpButton {
            width: 100%;
        }

        .accountActionsRight {
            margin-left: 0;
            justify-content: space-between;
        }
    }
}
</style>

<template>
    <modal id="accountSettings" :shown="shown" @hide="shown = false">
        <h2 class="accountSettingsTitle">Account Settings</h2>

        <section class="accountSection">
            <form id="accountForm" @submit.prevent="updateAccount()">
                <div class="accountFieldGroup">
                    <div class="accountField">
                        <span class="accountFieldLabel">Username</span>
                        <input type="text" name="username" class="accountFieldInput" disabled :value="username">
                    </div>
                    <div class="accountField">
                        <span class="accountFieldLabel">Current password</span>
                        <input v-model="currentPassword" type="password" class="accountFieldInput" placeholder="Required to make changes" name="currentPassword">
                    </div>

                    <hr class="accountFieldGroupDivider">

                    <div class="accountField">
                        <span class="accountFieldLabel">New email</span>
                        <input v-model="newEmail" type="email" class="accountFieldInput" placeholder="Leave blank to keep current" name="newEmail">
                    </div>

                    <hr class="accountFieldGroupDivider">

                    <div class="accountField">
                        <span class="accountFieldLabel">New password</span>
                        <input v-model="newPassword" type="password" class="accountFieldInput" placeholder="Leave blank to keep current" name="newPassword">
                    </div>
                    <div class="accountField">
                        <span class="accountFieldLabel">Confirm new password</span>
                        <input v-model="confirmNewPassword" type="password" class="accountFieldInput" placeholder="Repeat new password" name="confirmNewPassword">
                    </div>
                </div>

                <errors :errors="errors" />

                <div class="accountActions">
                    <button class="lpButton">
                        Save changes
                        <spinner v-if="saving" />
                    </button>
                    <div class="accountActionsRight">
                        <a class="accountCancelLink" @click="shown = false">Cancel</a>
                        <a class="accountDangerLink" @click="showDeleteAccount">Delete account</a>
                    </div>
                </div>
            </form>
        </section>

        <profileSettings />
        <creatorLinks />
    </modal>
</template>

<script>
import errors from './errors.vue';
import modal from './modal.vue';
import spinner from './spinner.vue';
import profileSettings from './profile-settings.vue';
import creatorLinks from './creator-links.vue';
import { openDialog, registerDialogOpener, unregisterDialogOpener } from '../services/dialogs';
import { fetchJson } from '../utils/utils';

export default {
    name: 'Account',
    components: {
        errors,
        modal,
        spinner,
        profileSettings,
        creatorLinks,
    },
    data() {
        return {
            saving: false,
            errors: [],
            currentPassword: '',
            newEmail: '',
            newPassword: '',
            confirmNewPassword: '',
            shown: false,
        };
    },
    computed: {
        library() {
            return this.$store.state.library;
        },
        username() {
            return this.$store.state.loggedIn;
        },
    },
    mounted() {
        registerDialogOpener('account', () => {
            this.shown = true;
        });
    },
    beforeUnmount() {
        unregisterDialogOpener('account');
    },
    methods: {
        updateAccount() {
            this.errors = [];

            if (!this.currentPassword) {
                this.errors.push({ field: 'currentPassword', message: 'Please enter your current password.' });
            }

            if (this.newPassword && this.newPassword != this.confirmNewPassword) {
                this.errors.push({ field: 'newPassword', message: "Your passwords don't match." });
            }

            if (this.newPassword && (this.newPassword.length < 5 || this.newPassword.length > 60)) {
                this.errors.push({ field: 'newPassword', message: 'Please enter a password between 5 and 60 characters.' });
            }

            if (this.errors.length) {
                return;
            }

            const data = { username: this.username, currentPassword: this.currentPassword };

            let dirty = false;

            if (this.newPassword) {
                dirty = true;
                data.newPassword = this.newPassword;
            }
            if (this.newEmail) {
                dirty = true;
                data.newEmail = this.newEmail;
            }

            if (!dirty) return;

            this.currentPassword = '';
            this.saving = true;

            fetchJson('/account', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'same-origin',
                body: JSON.stringify(data),
            })
                .then((response) => {
                    this.saving = false;
                    this.shown = false;
                })
                .catch((err) => {
                    this.errors = err;
                    this.saving = false;
                });
        },
        showDeleteAccount() {
            this.shown = false;
            openDialog('deleteAccount');
        },
    },
};
</script>
