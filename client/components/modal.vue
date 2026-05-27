<style lang="scss">
@import "../css/_globals";

.lpModal {
    background: $color-surface-elevated;
    border: 1px solid $color-border;
    border-radius: $radius-lg;
    box-shadow: $shadow-modal;
    left: 50%;
    max-height: calc(100dvh - 48px);
    overflow-y: auto;
    padding: 24px;
    position: fixed;
    text-align: left;
    top: 50%;
    transform: translateX(-50%) translateY(-50%);
    transition:
        opacity $transitionDuration ease,
        transform $transitionDuration ease;
    width: min(560px, calc(100vw - 32px));
    z-index: $dialog;

    .lpHalf {
        padding: 0 14px;

        &:first-child {
            padding-left: 0;
        }

        &:last-child {
            padding-right: 0;
        }
    }

    h2 {
        font-size: 22px;
        font-weight: $fontWeight-bold;
        letter-spacing: 0;
        line-height: 1.2;
        margin: 0 0 18px;
        max-width: none;
    }

    h3 {
        font-size: $fontSize-md;
        font-weight: 700;
        letter-spacing: -0.02em;
        margin: 0 0 10px;
    }

    p {
        color: $color-text-muted;
        margin: 0 0 14px;
    }

    ul {
        padding-left: 15px;
    }

    label {
        color: $color-text-muted;
        display: block;
        font-size: $fontSize-sm;
        font-weight: 700;
        letter-spacing: 0.04em;
        margin-bottom: 8px;
        text-transform: uppercase;
    }

    input[type=text],
    input[type=email],
    input[type=password],
    select,
    textarea {
        background: $color-control;
        border: 1px solid $color-border;
        border-radius: $radius-md;
        color: $color-text;
        min-height: $control-height-lg;
        padding: 10px 12px;
        transition:
            border-color $transitionDurationFast ease,
            box-shadow $transitionDurationFast ease,
            background-color $transitionDurationFast ease;
        width: 100%;

        &:focus {
            background: $color-surface;
            border-color: $color-accent;
            box-shadow: 0 0 0 4px rgba(var(--color-accent-rgb), 0.18);
            outline: none;
        }
    }

    select {
        padding-right: 36px;
    }

    textarea {
        min-height: 120px;
        resize: vertical;
    }

    form {
        margin: 0;
    }

    .lpModalBody {
        display: flex;
        flex-direction: column;
        gap: 16px;
    }

    .lpModalSplit {
        display: grid;
        gap: 18px;
        grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    }

    .lpModalPanel {
        background: $color-surface;
        border: 1px solid $color-border;
        border-radius: $radius-md;
        padding: 18px;
    }

    .lpModalActions {
        align-items: center;
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
        justify-content: flex-end;
        margin-top: 20px;
    }

    .lpButton.close,
    .lpButton.lpButtonSecondary {
        background: $color-control;
        border: 1px solid $color-border;
        box-shadow: none;
        color: $color-text;

        &:hover:not(:disabled),
        &:active {
            background: rgba(var(--color-accent-rgb), 0.08);
            box-shadow: none;
            color: $color-accent;
        }
    }

    .lpHref.close {
        color: $color-text-muted;
        font-weight: 600;
        margin-left: 0;
        padding: 10px 4px;

        &:hover {
            color: $color-text;
            text-decoration: none;
        }
    }

    .lpWarning {
        background: rgba(var(--color-warning-rgb), 0.12);
        border: 1px solid rgba(var(--color-warning-rgb), 0.32);
        border-radius: $radius-md;
        color: $color-text;
        margin: 0;
        padding: 14px 16px;
    }

    .lpContent {
        max-height: 400px;
        overflow-y: scroll;
    }
}

.lpModalHeader {
    align-items: baseline;
    display: flex;
    justify-content: space-between;
}

.lpModalOverlay {
    backdrop-filter: blur(6px);
    background: $color-overlay;
    height: 100%;
    left: 0;
    position: fixed;
    top: 0;
    transition: all $transitionDuration;
    width: 100%;
    z-index: $belowDialog;

    &.lpBlackout {
        animation: none;
        background: url("/images/lp_bg2.jpg") 50% 50%;
        background-size: cover;
        opacity: 1;
    }

    &.lpTransparent {
        background: rgba(0, 0, 0, 0.01);
    }
}

.lpModal-enter,
.lpModal-leave-active {
    opacity: 0;

    &.lpModal {
        transform: translateX(-50%) translateY(-48%) scale(0.97);
    }
}

@media (max-width: 640px) {
    .lpModal {
        .lpModalActions {
            justify-content: stretch;

            > * {
                flex: 1 1 auto;
                text-align: center;
            }
        }
    }
}

</style>

<template>
    <div class="lpModalContainer">
        <transition name="lpModal">
            <div v-if="shown" :id="id" class="lpModal">
                <slot />
            </div>
        </transition>
        <transition name="lpModal">
            <div v-if="shown" :class="{'lpModalOverlay': true, 'lpBlackout': blackout, 'lpTransparent': transparentOverlay}" @click="hide" />
        </transition>
    </div>
</template>

<script>
import { addWindowListener, removeWindowListener } from '../services/window-events';

export default {
    name: 'Modal',
    props: {
        id: {
            type: String,
            required: false,
        },
        shown: {
            type: Boolean,
            required: true,
        },
        blackout: {
            type: Boolean,
            required: false,
            default: false,
        },
        transparentOverlay: {
            type: Boolean,
            required: false,
            default: false,
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
