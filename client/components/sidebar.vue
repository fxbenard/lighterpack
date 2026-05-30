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

        align-items: center;
        border-bottom: 1px solid $color-border;
        display: flex;
        height: 60px;
        justify-content: space-between;
        margin: 0 -20px 20px 0;
        padding: 20px 0 20px;
        position: relative;

        span {
            color: $color-text-muted;
        }
    }

    section {
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
    overflow: hidden;
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

.lpGearSection {
    display: flex;
    flex: 1;
    flex-direction: column;
    min-height: 0;
}

.lpGearSectionHeader {
    align-items: center;
    color: $color-text;
    display: flex;
    flex: 0 0 auto;
    font-size: $fontSize-md;
    font-weight: $fontWeight-bold;
    justify-content: space-between;
    margin: 0 0 10px;
}

.lpGearRoomBtn {
    white-space: nowrap;
}


.lpThemeToggle {
    background: transparent;
    border: none;
    border-radius: $radius-md;
    color: $color-text-muted;
    cursor: pointer;
    font-size: 16px;
    line-height: 1;
    padding: 2px 4px;
    transition: color $transitionDurationFast;

    &:hover {
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
                    <button class="lpButton lpSmall lpButtonSecondary lpGearRoomBtn" @click="$emit('open-gear-room')">Gear Room</button>
                </h2>
                <libraryItems :show-title="false" />
            </section>
        </div>
        </div>
    </div>
</template>

<script>
import libraryItems from './library-items.vue';
import libraryLists from './library-lists.vue';
export default {
    name: 'Sidebar',
    components: {
        libraryItems,
        libraryLists,
    },
    emits: ['open-gear-room'],
    methods: {
        closeSidebar() {
            this.$store.commit('toggleSidebar');
        },
    },
};
</script>
