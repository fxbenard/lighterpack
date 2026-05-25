<style lang="scss">
@import "../css/_globals";

#header {
    align-items: center;
    background: $color-surface;
    border-bottom: 1px solid $color-border;
    display: flex;
    gap: 2px;
    margin: 0 -20px 20px;
    min-height: 60px;
    padding: 0 8px;
    position: sticky;
    top: 0;
    z-index: $belowDialog;
}

#hamburger {
    align-items: center;
    cursor: pointer;
    display: flex;
    flex-direction: column;
    gap: 4px;
    justify-content: center;
    opacity: 0.6;
    padding: 4px;
    transition: transform $transitionDurationSlow, opacity $transitionDurationFast;

    &:hover {
        opacity: 1;
    }

    .lpHasSidebar & {
        opacity: 1;
    }

    .lpHamburgerLine {
        background: $color-text;
        border-radius: 2px;
        display: block;
        height: 2px;
        transition: transform $transitionDurationFast, opacity $transitionDurationFast;
        width: 20px;
    }
}

@media (max-width: 768px) {
    #sidebar {
        transform: translateX(-100%);
        transition: transform $transitionDurationSlow ease-in-out;

        .lpHasSidebar & {
            opacity: 1;
            transform: translateX(0);
        }
    }

    #main .lpList {
        margin-left: 0 !important;
    }
}

#lpListName {
    background: transparent;
    border-radius: $radius-sm;
    color: $color-text;
    font-size: $fontSize-md;
    font-weight: $fontWeight-bold;
    letter-spacing: -0.01em;
    padding: 10px 14px;

    &::placeholder {
        color: $color-text-muted;
        font-weight: $fontWeight-normal;
    }
}

.headerItem {
    flex: 0 0 auto;
    color: $color-text-muted;
    height: 100%;
    padding: 10px 12px;
    position: relative;

    &:first-child {
        padding-left: 12px;
    }

    .lpPopover {
        &:hover .lpTarget {
            color: $color-accent;
        }
    }

    .lpTarget {
        border-radius: 4px;
        font-weight: 600;
        padding: 10px 12px;
    }

    &#lpListName {
        flex: 1 0 auto;
    }

    &.hasPopover {
        padding: 0;
    }

    &.signInRegisterButtons {
        height: auto;
        padding: 0 16px;
    }
}
</style>

<template>
    <div v-if="isLoaded" id="main" :class="{lpHasSidebar: library.showSidebar}">
        <sidebar />
        <div class="lpList lpTransition">
            <div id="header" class="clearfix">
                <span class="headerItem">
                    <a id="hamburger" class="lpTransition" @click="toggleSidebar">
                        <span class="lpHamburgerLine" />
                        <span class="lpHamburgerLine" />
                        <span class="lpHamburgerLine" />
                    </a>
                </span>
                <input id="lpListName" :value="list.name" type="text" class="lpListName lpSilent headerItem" value="New List" placeholder="List Name" autocomplete="off" name="lastpass-disable-search" @input="updateListName">
                <share />
                <listSettings />
                <accountDropdown v-if="isSignedIn" />
                <span v-else class="headerItem signInRegisterButtons">
                    <router-link to="/register" class="lpButton lpSmall">Register</router-link>
                    or
                    <router-link to="/signin" class="lpButton lpSmall">Sign In</router-link>
                </span>
                <span class="clearfix" />
            </div>

            <list />

            <div id="lpFooter">
                <div class="lpSiteBy">
                    Site by <a class="lpHref" href="https://www.galenmaly.com/" target="_blank" rel="noopener noreferrer">Galen Maly</a>
                    and <a class="lpHref" href="https://github.com/galenmaly/lighterpack/graphs/contributors" target="_blank" rel="noopener noreferrer">friends</a>.
                </div>
                <div class="lpContact">
                    <a class="lpHref" href="https://github.com/galenmaly/lighterpack" target="_blank" rel="noopener noreferrer">Copyleft</a> LighterPack 2019
                    -
                    <a class="lpHref" href="mailto:info@lighterpack.com">Contact</a>
                </div>
            </div>
        </div>

        <globalAlerts />
        <speedbump />
        <copyList />
        <importCSV />
        <itemImage />
        <itemViewImage />
        <itemLink />
        <help />
        <account />
        <accountDelete />
    </div>
</template>

<script>
import globalAlerts from '../components/global-alerts.vue';
import sidebar from '../components/sidebar.vue';
import share from '../components/share.vue';
import listSettings from '../components/list-settings.vue';
import accountDropdown from '../components/account-dropdown.vue';
import forgotPassword from './forgot-password.vue';
import account from '../components/account.vue';
import accountDelete from '../components/account-delete.vue';
import help from '../components/help.vue';
import list from '../components/list.vue';

import itemImage from '../components/item-image.vue';
import itemViewImage from '../components/item-view-image.vue';
import itemLink from '../components/item-link.vue';
import importCSV from '../components/import-csv.vue';
import copyList from '../components/copy-list.vue';
import speedbump from '../components/speedbump.vue';
import { push } from '../services/navigation';

export default {
    name: 'Dashboard',
    components: {
        sidebar,
        share,
        listSettings,
        accountDropdown,
        forgotPassword,
        account,
        accountDelete,
        help,
        list,
        itemLink,
        copyList,
        importCSV,
        itemImage,
        itemViewImage,
        speedbump,
        globalAlerts,
    },
    data() {
        return {
            isLoaded: false,
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
    },
    created() {
        if (!this.$store.state.library) {
            push('/welcome');
        } else {
            this.isLoaded = true;
        }
    },
    methods: {
        toggleSidebar() {
            this.$store.commit('toggleSidebar');
        },
        updateListName(evt) {
            this.$store.commit('updateListName', { id: this.list.id, name: evt.target.value });
        },
    },
};
</script>
