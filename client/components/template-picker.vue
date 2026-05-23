<style lang="scss">
@import "../css/_globals";

.lpTemplatePicker {
    background: rgba(0, 0, 0, 0.55);
    bottom: 0;
    left: 0;
    position: fixed;
    right: 0;
    top: 0;
    z-index: $dialog;
}

.lpTemplatePickerModal {
    background: $color-surface;
    border-radius: $radius-lg;
    box-shadow: 0 8px 40px rgba(0, 0, 0, 0.18);
    left: 50%;
    max-height: calc(90vh - #{$spacingLarge} * 2);
    overflow-y: auto;
    padding: $spacingLarge;
    position: fixed;
    top: 50%;
    transform: translateX(-50%) translateY(-50%);
    width: 540px;
    max-width: calc(100vw - #{$spacingLarge} * 2);
    z-index: $dialog + 1;
}

.lpTemplatePickerTitle {
    font-size: $fontSize-md;
    font-weight: $fontWeight-bold;
    margin: 0 0 $spacingSmaller;
}

.lpTemplatePickerSubtitle {
    color: $color-text-muted;
    font-size: $fontSize-base;
    margin: 0 0 $spacingLarge;
}

.lpTemplatePickerCards {
    display: flex;
    flex-direction: column;
    gap: $spacingSmall;
    margin-bottom: $spacingLarge;
}

.lpTemplatePickerCard {
    align-items: center;
    background: $color-bg;
    border: 1px solid $color-border;
    border-radius: $radius-md;
    display: flex;
    gap: $spacingMedium;
    justify-content: space-between;
    padding: $spacingMedium;
    transition: border-color $transitionDurationFast;

    &:hover {
        border-color: $color-accent;
    }
}

.lpTemplatePickerCardBody {
    flex: 1;
}

.lpTemplatePickerCardName {
    font-weight: $fontWeight-bold;
    margin: 0 0 4px;
}

.lpTemplatePickerCardDesc {
    color: $color-text-muted;
    font-size: $fontSize-sm;
    margin: 0;
}

.lpTemplatePickerBlank {
    color: $color-text-muted;
    cursor: pointer;
    display: block;
    font-size: $fontSize-sm;
    text-align: center;
    text-decoration: underline;

    &:hover {
        color: $color-text;
    }
}
</style>

<template>
    <teleport to="body">
        <div class="lpTemplatePicker" @click.self="onDismiss">
            <div class="lpTemplatePickerModal">
                <p class="lpTemplatePickerTitle">Start with a template</p>
                <p class="lpTemplatePickerSubtitle">Pick a starter list or begin from scratch.</p>
                <div class="lpTemplatePickerCards">
                    <div v-for="template in templates" :key="template.id" class="lpTemplatePickerCard">
                        <div class="lpTemplatePickerCardBody">
                            <p class="lpTemplatePickerCardName">{{ template.name }}</p>
                            <p class="lpTemplatePickerCardDesc">{{ template.description }}</p>
                        </div>
                        <button class="lpButton" @click="onSelect(template)">Select</button>
                    </div>
                </div>
                <a class="lpHref lpTemplatePickerBlank" @click="onDismiss">Start blank</a>
            </div>
        </div>
    </teleport>
</template>

<script>
import { templates } from '../composables/useTemplatePicker.js';

export default {
    name: 'TemplatePicker',
    emits: ['select', 'dismiss'],
    data() {
        return {
            templates,
        };
    },
    methods: {
        onSelect(template) {
            this.$emit('select', template.data);
        },
        onDismiss() {
            this.$emit('dismiss');
        },
    },
};
</script>
