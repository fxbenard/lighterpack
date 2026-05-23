<style lang="scss">
@import "../css/_globals";

.lpUnitSelect {
    border: 1px solid transparent;
    cursor: pointer;
    display: inline-block;
    padding: 0 5px;
    position: relative;

    &:hover,
    &.lpHover {
        background: $color-surface;
        border: 1px solid $color-border;

        i {
            opacity: 1;
        }
    }

    i {
        opacity: 0.6;
    }

    &.lpOpen {
        background: $color-surface;

        .lpUnitDropdown {
            display: block;
        }
    }

    .lpDisplay {
        display: inline-block;
        width: 1.1em;
    }

    .lpUnitDropdown {
        background: $color-surface;
        border: 1px solid $color-border;
        display: none;
        left: 0;
        padding: 0;
        position: absolute;
        top: -1px;
        z-index: $aboveSidebar+1;

        &.lb {
            top: -30px;
        }

        &.g {
            top: -55px;
        }

        &.kg {
            top: -81px;
        }

        li {
            list-style: none;
            padding: 2px 14px;

            &:hover {
                background: $color-accent;
                color: $color-surface;
            }
        }
    }
}
</style>

<template>
    <div class="lpUnitSelect" :class="{lpOpen: isOpen, lpHover: isFocused}" @click="toggle($event)">
        <select class="lpUnit lpInvisible" :value="unit" @keyup="keyup($event)" @focus="focusSelect" @blur="blurSelect">
            <option v-for="unit in units" :key="unit" :value="unit">
                {{ unit }}
            </option>
        </select>
        <span class="lpDisplay">{{ unit }}</span>
        <i class="lpSprite lpExpand" />
        <ul :class="'lpUnitDropdown ' + unit">
            <li v-for="unit in units" :key="unit" :class="unit" @click="select(unit)">
                {{ unit }}
            </li>
        </ul>
    </div>
</template>

<script>
import { bindWindowListeners, unbindWindowListeners } from '../services/window-events';

export default {
    name: 'UnitSelect',
    emits: ['change'],
    props: ['weight', 'unit'],
    data() {
        return {
            units: [
                'oz',
                'lb',
                'g',
                'kg',
            ],
            isOpen: false,
            isFocused: false,
            closeBindings: [],
        };
    },
    created() {
        this.closeBindings = [
            { eventName: 'keyup', handler: this.closeOnEscape },
            { eventName: 'click', handler: this.closeOnClick },
        ];
    },
    beforeUnmount() {
        this.unbindCloseListeners();
    },
    methods: {
        toggle(evt) {
            evt.stopPropagation();
            if (!this.isOpen) {
                this.open();
            } else {
                this.close();
            }
        },
        open() {
            this.isOpen = true;
            this.bindCloseListeners();
        },
        close() {
            this.isOpen = false;
            this.unbindCloseListeners();
        },
        select(unit) {
            this.$emit('change', unit);
        },
        keyup(evt) {
            this.$emit('change', evt.target.value);
        },
        bindCloseListeners() {
            bindWindowListeners(this.closeBindings);
        },
        unbindCloseListeners() {
            unbindWindowListeners(this.closeBindings);
        },
        closeOnEscape(evt) {
            if (evt.keyCode === 27) {
                this.close();
            }
        },
        closeOnClick(evt) {
            this.close();
        },
        focusSelect() {
            this.isFocused = true;
        },
        blurSelect() {
            this.isFocused = false;
        },
    },
};
</script>
