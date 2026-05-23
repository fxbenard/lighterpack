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
    <div id="sidebar">
        <div id="scrollable">
            <h1>LighterPack <span>+</span></h1>

            <libraryLists />
            <libraryItems />

            <button class="lpThemeToggle" @click="cycleTheme">
                {{ themeIcon }} {{ themeLabel }}
            </button>
        </div>
    </div>
</template>

<script>
import libraryItems from './library-items.vue';
import libraryLists from './library-lists.vue';
import { useTheme } from '../composables/useTheme.js';

export default {
    name: 'Sidebar',
    components: {
        libraryItems,
        libraryLists,
    },
    setup() {
        const { mode, cycleTheme } = useTheme();
        return { mode, cycleTheme };
    },
    computed: {
        themeIcon() {
            return { auto: '⚙', light: '☀', dark: '☾' }[this.mode];
        },
        themeLabel() {
            return { auto: 'Auto', light: 'Light', dark: 'Dark' }[this.mode];
        },
    },
};
</script>
