<template>
    <VueColorPicker
        :width="width"
        :height="height"
        :disabled="disabled"
        :start-color="startColor"
        @color-change="onColorChange"
    />
</template>

<script>
import VueColorPicker from 'vue-color-picker-wheel';

export default {
    name: 'ColorWheelPicker',
    components: {
        VueColorPicker,
    },
    props: {
        width: {
            type: Number,
            default: 150,
        },
        height: {
            type: Number,
            default: 150,
        },
        disabled: {
            type: Boolean,
            default: false,
        },
        startColor: {
            type: String,
            required: true,
        },
    },
    methods: {
        onColorChange(newColor) {
            this.$emit('color-change', newColor);
        },
    },
};
</script>
