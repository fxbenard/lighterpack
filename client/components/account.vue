<style lang="scss">
@import "../css/_globals";

#accountSettings {
    width: min(640px, calc(100vw - 32px));
}

.accountSection {
    border-bottom: 1px solid $color-border;
    margin-bottom: 24px;
    padding-bottom: 24px;
}

.accountActions {
    align-items: center;
    display: grid;
    gap: 10px;
    grid-template-columns: 1fr auto auto;
    margin-top: 18px;

    .lpButton {
        min-width: 160px;
    }
}

.accountDangerLink {
    color: $color-danger;
}

@media (max-width: 640px) {
    .accountActions {
        grid-template-columns: 1fr;

        .lpButton {
            width: 100%;
        }
    }
}
</style>

<template>
    <modal id="accountSettings" :shown="shown" @hide="shown = false">
        <h2>Account Settings</h2>

        <section class="accountSection">
            <form id="accountForm" @submit.prevent="updateAccount()">
                <div class="lpFields">
                    <input type="text" name="username" class="username" disabled :value="username">
                    <input v-model="currentPassword" type="password" placeholder="Current password" name="currentPassword" class="currentPassword">
                    <hr>
                    <input v-model="newEmail" type="email" placeholder="New Email" name="newEmail" class="newEmail">
                    <hr>
                    <input v-model="newPassword" type="password" placeholder="New Password" name="newPassword" class="newPassword">
                    <input v-model="confirmNewPassword" type="password" placeholder="Confirm New Password" name="confirmNewPassword" class="confirmNewPassword">
                </div>

                <errors :errors="errors" />

                <div class="accountActions">
                    <button class="lpButton">
                        Submit
                        <spinner v-if="saving" />
                    </button>
                    <a class="lpHref" @click="shown = false">Cancel</a>
                    <a class="lpHref accountDangerLink" @click="showDeleteAccount">Delete account</a>
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
