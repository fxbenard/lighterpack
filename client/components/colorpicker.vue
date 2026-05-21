<style lang="scss">
.lpNativeColorInput {
    appearance: none;
    background: transparent;
    border: 0;
    cursor: pointer;
    height: 28px;
    padding: 0;
    width: 28px;

    &::-webkit-color-swatch-wrapper {
        padding: 0;
    }

    &::-webkit-color-swatch {
        border: 0;
        border-radius: 4px;
    }

    &::-moz-color-swatch {
        border: 0;
        border-radius: 4px;
    }
}
</style>

<template>
    <Popover id="lpPickerContainer" :shown="shown" @hide="shown = false">
        <template #target><span class="lpLegend" :style="{'background-color': color}" @click="shown = true" /></template>
        <template #content><input
            class="lpNativeColorInput"
            type="color"
            :value="normalizedColor"
            @input="onColorChange($event.target.value)"
        ></template>
    </Popover>
</template>

<script>
import Popover from './popover.vue';

export default {
    name: 'ColorPicker',
    components: {
        Popover,
    },
    props: [
        'color',
    ],
    data() {
        return {
            shown: false,
        };
    },
    computed: {
        normalizedColor() {
            return this.color || '#000000';
        },
    },
    methods: {
        onColorChange(newColor) {
            this.$emit('colorChange', newColor);
        },
    },
};

</script>
