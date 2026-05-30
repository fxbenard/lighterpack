<style lang="scss">
@import "../css/_globals";

.lpThemeItem {
    align-items: center;
    color: $color-text-muted;
    cursor: pointer;
    display: flex;
    font-size: 16px;
    padding: 0 12px;
    transition: color $transitionDurationFast ease;

    &:hover {
        color: $color-text;
    }

    span {
        position: relative;
        top: 4px;
    }
}
</style>

<template>
    <a class="lpThemeItem" @click="cycleTheme">
        <span>{{ mode === 'dark' ? '☾' : mode === 'light' ? '☀' : '⚙' }}</span>
    </a>
</template>

<script>
import { useTheme } from '../composables/useTheme.js';

export default {
    name: 'ThemeToggle',
    setup() {
        const { mode, cycleTheme } = useTheme();
        return { mode, cycleTheme };
    },
};
</script>
