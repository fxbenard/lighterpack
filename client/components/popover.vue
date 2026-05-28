<style lang="scss">
@import "../css/_globals";

.lpPopover {
    display: block;
    position: relative;

    .lpTarget {
        cursor: default;
        display: inline-block;
        margin-bottom: -12px;
        padding-bottom: 12px;
        position: relative;
    }

    .lpContent {
        backdrop-filter: blur(14px);
        background: $color-surface-elevated;
        border: 1px solid $color-border;
        border-radius: $radius-md;
        box-shadow: $shadow-popover;
        color: $color-text;
        left: 50%;
        margin-top: 18px;
        min-width: 100%;
        opacity: 0;
        padding: 16px;
        pointer-events: none;
        position: absolute;
        top: 100%;
        transform: translateX(-50%) translateY(6px);
        transition:
            opacity $transitionDurationFast ease,
            transform $transitionDurationFast ease,
            margin-top $transitionDurationFast ease;
        white-space: nowrap;
        z-index: $dialog;

        &::before {
            background-color: $color-surface-elevated;
            border-left: 1px solid $color-border;
            border-top: 1px solid $color-border;
            border-radius: 4px 0 0 0;
            content: "";
            display: block;
            height: 18px;
            left: 50%;
            margin-left: -9px;
            position: absolute;
            top: -9px;
            transform: rotate(45deg);
            width: 18px;
            z-index: $dialog - 1;
        }

        &::after {
            background: $color-surface-elevated;
            content: "";
            display: block;
            height: 18px;
            left: 0;
            border-radius: $radius-md $radius-md 0 0;
            position: absolute;
            top: 0;
            width: 100%;
            z-index: $dialog + 1;
        }

        & > *:first-child {
            margin-top: 0;
        }

        & > *:last-child {
            margin-bottom: 0;
        }

        h3 {
            margin-bottom: 0;
        }

        ul, a {
            line-height: 1.45;
        }

        hr {
            border-color: $border1;
            margin: 14px 0;
            padding: 0;
        }
    }

    &.lpPopoverShown {
        .lpTarget {
            z-index: $aboveDialog;
        }

        .lpContent {
            margin-top: 12px;
            opacity: 1;
            pointer-events: all;
            transform: translateX(-50%) translateY(0);
        }
    }

    &.lpPopoverRight {
        .lpContent {
            left: auto;
            right: 0;
            transform: translateX(0) translateY(6px);

            &::before {
                left: auto;
                margin-left: 0;
                right: 16px;
            }
        }

        &.lpPopoverShown .lpContent {
            transform: translateX(0) translateY(0);
        }
    }
}

</style>

<template>
    <div v-click-outside="hide" :class="{'lpPopover': true, 'lpPopoverShown': shown, 'lpPopoverRight': placement === 'right'}">
        <div class="lpTarget">
            <slot name="target" />
        </div>
        <div class="lpContent">
            <slot name="content" />
        </div>
    </div>
</template>

<script>
import { addWindowListener, removeWindowListener } from '../services/window-events';

export default {
    name: 'Popover',
    props: {
        id: {
            type: String,
            required: false,
        },
        shown: {
            type: Boolean,
            required: true,
        },
        placement: {
            type: String,
            default: 'center',
        },
    },
    mounted() {
        this.bindEscape();
    },
    beforeUnmount() {
        this.unbindEscape();
    },
    methods: {
        hide() {
            this.$emit('hide');
        },
        bindEscape() {
            addWindowListener('keyup', this.closeOnEscape);
        },
        unbindEscape() {
            removeWindowListener('keyup', this.closeOnEscape);
        },
        closeOnEscape(evt) {
            if (this.shown && evt.keyCode === 27) {
                this.hide();
            }
        },
    },
};
</script>
