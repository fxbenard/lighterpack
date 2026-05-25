<style lang="scss">
@import "../css/_globals";

$sidebarWidth: 280px;
$sidebarOverflow: 1000px;
$sidebarPadding: 20px;

#sidebar {
    background: $color-surface;
    border-right: 1px solid $color-border;
    box-shadow: 2px 0 8px rgba(0, 0, 0, 0.06);
    color: $color-text;
    height: 100%;
    margin-left: -$sidebarOverflow;
    opacity: 0;
    padding-left: $sidebarOverflow + $sidebarPadding;
    padding-right: $sidebarPadding;
    position: fixed;
    transition: opacity $transitionDurationSlow ease-in-out 0s;
    width: $sidebarWidth + $sidebarOverflow + $sidebarPadding*2;
    z-index: $sidebar;

    .lpHasSidebar & {
        opacity: 1;
    }

    h1 {
        @include fullBleedLeft();

        border-bottom: 1px solid $color-border;
        height: 60px;
        margin: 0 -20px 20px 0;
        padding: 20px 0 20px;
        position: relative;

        span {
            color: $color-text-muted;
        }
    }

    section {
        margin-bottom: 40px;
        position: relative;
    }

    h2 {
        color: $color-text;
        font-size: $fontSize-md;
        font-weight: $fontWeight-bold;
        margin: 0 0 10px;
    }

    ul {
        background: $color-bg;
        border: 1px solid $color-border;
        border-radius: $radius-md;
        margin: 0;
        overflow-x: hidden;
        padding: 0;
    }

    .lpHref {
        color: $color-accent;
    }
}

#scrollable {
    display: flex;
    flex-direction: column;
    height: 100%;
    overflow-y: auto;
    padding-bottom: 20px;
    position: relative;
    top: 0;

    > h1 {
        flex: 0 0 auto;
    }
}

@media (max-width: 768px) {
    #sidebar {
        box-shadow: 4px 0 16px rgba(0, 0, 0, 0.18);
        margin-left: 0;
        opacity: 1;
        padding-left: $sidebarPadding;
        transform: translateX(-100%);
        transition: transform $transitionDurationSlow ease-in-out;
        width: $sidebarWidth + $sidebarPadding * 2;
        z-index: $dialog;

        .lpHasSidebar & {
            transform: translateX(0);
        }
    }

    .lpSidebarOverlay {
        background: rgba(0, 0, 0, 0.4);
        bottom: 0;
        display: none;
        left: 0;
        position: fixed;
        right: 0;
        top: 0;
        z-index: $dialog - 1;

        .lpHasSidebar & {
            display: block;
        }
    }
}

.lpGearSectionHeader {
    align-items: center;
    color: $color-text;
    display: flex;
    font-size: $fontSize-md;
    font-weight: $fontWeight-bold;
    justify-content: space-between;
    margin: 0 0 10px;
}

.lpGearRoomBtn {
    background: none;
    border: 1px solid $color-border;
    border-radius: $radius-sm;
    color: $color-text-muted;
    cursor: pointer;
    font-family: $font-family-base;
    font-size: $fontSize-xs;
    padding: 2px 8px;

    &:hover {
        border-color: $color-accent;
        color: $color-accent;
    }
}

.lpGearRoomModal {
    padding: 16px;
    width: min(520px, 92vw);
}

.lpThemeToggle {
    align-items: center;
    background: $color-bg;
    border: 1px solid $color-border;
    border-radius: $radius-md;
    color: $color-text-muted;
    cursor: pointer;
    display: flex;
    font-family: $font-family-base;
    font-size: $fontSize-sm;
    gap: 6px;
    margin-top: auto;
    padding: 8px 12px;
    transition: color $transitionDurationFast, border-color $transitionDurationFast;
    width: 100%;

    &:hover {
        border-color: $color-accent;
        color: $color-text;
    }
}

</style>

<template>
    <div>
        <div class="lpSidebarOverlay" @click="closeSidebar" />
        <div id="sidebar">
        <div id="scrollable">
            <h1>LighterPack <span>+</span></h1>

            <libraryLists />
            <section class="lpGearSection">
                <h2 class="lpGearSectionHeader">
                    Gear
                    <button class="lpGearRoomBtn" @click="gearRoomOpen = true">⊞ Gear Room</button>
                </h2>
                <libraryItems />
            </section>

            <modal :shown="gearRoomOpen" @hide="gearRoomOpen = false">
                <div class="lpGearRoomModal">
                    <libraryItems />
                </div>
            </modal>

            <button class="lpThemeToggle" @click="cycleTheme">
                {{ themeIcon }} {{ themeLabel }}
            </button>
        </div>
        </div>
    </div>
</template>

<script>
import libraryItems from './library-items.vue';
import libraryLists from './library-lists.vue';
import modal from './modal.vue';
import { useTheme } from '../composables/useTheme.js';

export default {
    name: 'Sidebar',
    components: {
        libraryItems,
        libraryLists,
        modal,
    },
    setup() {
        const { mode, cycleTheme } = useTheme();
        return { mode, cycleTheme };
    },
    data() {
        return {
            gearRoomOpen: false,
        };
    },
    computed: {
        themeIcon() {
            return { auto: '⚙', light: '☀', dark: '☾' }[this.mode];
        },
        themeLabel() {
            return { auto: 'Auto', light: 'Light', dark: 'Dark' }[this.mode];
        },
    },
    methods: {
        closeSidebar() {
            this.$store.commit('toggleSidebar');
        },
    },
};
</script>
