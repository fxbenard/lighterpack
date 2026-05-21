<style lang="scss">

</style>

<template>
    <Popover id="lpPickerContainer" :shown="shown" @hide="shown = false">
        <span slot="target" class="lpLegend" :style="{'background-color': color}" @click="shown = true" />
        <ColorWheelPicker slot="content" :width="150" :height="150" :disabled="false" :start-color="color" @color-change="onColorChange" />
    </Popover>
</template>

<script>
import Popover from './popover.vue';
import ColorWheelPicker from './color-wheel-picker.vue';

export default {
    name: 'ColorPicker',
    components: {
        ColorWheelPicker,
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
    methods: {
        onColorChange(newColor) {
            this.$emit('colorChange', newColor);
        },
    },
};

</script>
